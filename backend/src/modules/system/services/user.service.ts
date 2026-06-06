import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, ILike, FindOperator } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

/**
 * 用户查询参数 DTO
 */
export interface UserQueryDto {
  page?: number;
  pageSize?: number;
  keyword?: string;
  username?: string;
  email?: string;
  phone?: string;
  status?: UserStatus;
  isSystem?: boolean;
  roleId?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 用户分页结果 DTO
 */
export interface PaginatedUserResult {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class UserService {
  // 密码哈希轮数
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * 创建用户（密码 bcrypt 加密）
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // 检查用户名是否已存在
    await this.checkUsernameExists(createUserDto.username);

    // 检查邮箱是否已存在
    await this.checkEmailExists(createUserDto.email);

    // 密码加密
    const hashedPassword = await this.hashPassword(createUserDto.password);

    // 处理角色
    let roles: Role[] = [];
    if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
      roles = await this.findRolesByIds(createUserDto.roleIds);
    }

    // 创建用户实体
    const user = this.userRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      phone: createUserDto.phone,
      name: createUserDto.name,
      password: hashedPassword,
      avatar: createUserDto.avatar,
      status: createUserDto.status || UserStatus.ACTIVE,
      isSystem: false,
      roles,
      metadata: createUserDto.metadata,
    });

    return this.userRepository.save(user);
  }

  /**
   * 分页查询用户列表（支持过滤、排序）
   */
  async findAll(queryDto: UserQueryDto): Promise<PaginatedUserResult> {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      username,
      email,
      phone,
      status,
      isSystem,
      roleId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // 关键词搜索（用户名、姓名、邮箱）
    if (keyword) {
      queryBuilder.andWhere(
        '(user.username LIKE :keyword OR user.name LIKE :keyword OR user.email LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    // 按用户名精确查询
    if (username) {
      queryBuilder.andWhere('user.username = :username', { username });
    }

    // 按邮箱精确查询
    if (email) {
      queryBuilder.andWhere('user.email = :email', { email });
    }

    // 按手机号码查询
    if (phone) {
      queryBuilder.andWhere('user.phone = :phone', { phone });
    }

    // 按状态筛选
    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    // 按系统用户筛选
    if (isSystem !== undefined) {
      queryBuilder.andWhere('user.isSystem = :isSystem', { isSystem });
    }

    // 按角色筛选
    if (roleId) {
      queryBuilder.innerJoin('user.roles', 'role').andWhere('role.id = :roleId', { roleId });
    }

    // 只查询未删除的用户
    queryBuilder.andWhere('user.isActive = :isActive', { isActive: true });

    // 排序
    const allowedSortFields = ['createdAt', 'updatedAt', 'username', 'email', 'name', 'status'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`user.${sortField}`, sortOrder);

    // 分页
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    // 关联角色信息
    queryBuilder.leftJoinAndSelect('user.roles', 'role');

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根据ID查询用户
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }

    return user;
  }

  /**
   * 根据用户名查询
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username, isActive: true },
      relations: ['roles', 'roles.permissions'],
    });
  }

  /**
   * 根据邮箱查询
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, isActive: true },
      relations: ['roles', 'roles.permissions'],
    });
  }

  /**
   * 更新用户
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // 如果更新邮箱，检查邮箱是否已被其他用户使用
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      await this.checkEmailExists(updateUserDto.email, id);
    }

    // 处理角色更新
    if (updateUserDto.roleIds !== undefined) {
      const roles = await this.findRolesByIds(updateUserDto.roleIds);
      user.roles = roles;
    }

    // 合并更新（排除 roleIds，它已经在上面处理了）
    const { roleIds, ...rest } = updateUserDto;
    Object.assign(user, rest);

    return this.userRepository.save(user);
  }

  /**
   * 删除用户（软删除）
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);

    // 系统用户不允许删除
    if (user.isSystem) {
      throw new BadRequestException('系统用户不允许删除');
    }

    user.isActive = false;
    await this.userRepository.save(user);
  }

  /**
   * 修改密码（验证旧密码）
   */
  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.findOne(id);

    // 验证旧密码
    const isPasswordValid = await this.comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('旧密码不正确');
    }

    // 检查新旧密码是否相同
    const isSamePassword = await this.comparePassword(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('新密码不能与旧密码相同');
    }

    // 更新密码
    user.password = await this.hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    await this.userRepository.save(user);
  }

  /**
   * 重置密码（管理员）
   */
  async resetPassword(id: string, newPassword: string): Promise<void> {
    const user = await this.findOne(id);

    // 更新密码
    user.password = await this.hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    await this.userRepository.save(user);
  }

  /**
   * 分配角色
   */
  async assignRoles(id: string, roleIds: string[]): Promise<User> {
    const user = await this.findOne(id);

    // 查找角色
    const roles = await this.findRolesByIds(roleIds);

    // 更新角色
    user.roles = roles;
    return this.userRepository.save(user);
  }

  /**
   * 锁定用户
   */
  async lock(id: string): Promise<User> {
    const user = await this.findOne(id);

    // 系统用户不允许锁定
    if (user.isSystem) {
      throw new BadRequestException('系统用户不允许锁定');
    }

    user.status = UserStatus.LOCKED;
    return this.userRepository.save(user);
  }

  /**
   * 解锁用户
   */
  async unlock(id: string): Promise<User> {
    const user = await this.findOne(id);

    user.status = UserStatus.ACTIVE;
    return this.userRepository.save(user);
  }

  /**
   * 获取当前用户信息
   */
  async getProfile(id: string): Promise<User> {
    return this.findOne(id);
  }

  /**
   * 验证用户密码
   */
  async validatePassword(username: string, password: string): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (!user) {
      return null;
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('用户已被锁定或禁用');
    }

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return user;
  }

  /**
   * 检查用户名是否存在
   */
  private async checkUsernameExists(username: string): Promise<void> {
    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictException(`用户名 ${username} 已存在`);
    }
  }

  /**
   * 检查邮箱是否存在
   */
  private async checkEmailExists(email: string, excludeUserId?: string): Promise<void> {
    const queryBuilder = this.userRepository.createQueryBuilder('user').where('user.email = :email', { email });
    if (excludeUserId) {
      queryBuilder.andWhere('user.id != :excludeUserId', { excludeUserId });
    }
    const existingUser = await queryBuilder.getOne();
    if (existingUser) {
      throw new ConflictException(`邮箱 ${email} 已存在`);
    }
  }

  /**
   * 根据ID列表查找角色
   */
  private async findRolesByIds(roleIds: string[]): Promise<Role[]> {
    const roles = await this.roleRepository.findByIds(roleIds);
    if (roles.length !== roleIds.length) {
      const foundIds = roles.map((r) => r.id);
      const notFoundIds = roleIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`角色ID ${notFoundIds.join(', ')} 不存在`);
    }
    return roles;
  }

  /**
   * 密码哈希加密
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * 密码比对
   */
  private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
