import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * 创建角色
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // 检查角色编码是否已存在
    const existingRole = await this.roleRepository.findOne({
      where: { code: createRoleDto.code },
    });

    if (existingRole) {
      throw new ConflictException(`角色编码 ${createRoleDto.code} 已存在`);
    }

    // 处理权限关联
    let permissions: Permission[] = [];
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      permissions = await this.permissionRepository.findByIds(createRoleDto.permissionIds);
      if (permissions.length !== createRoleDto.permissionIds.length) {
        throw new BadRequestException('部分权限ID不存在');
      }
    }

    // 创建角色
    const role = this.roleRepository.create({
      ...createRoleDto,
      permissions,
    });

    return this.roleRepository.save(role);
  }

  /**
   * 查询所有角色
   */
  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据ID查询角色详情
   */
  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`角色ID ${id} 不存在`);
    }

    return role;
  }

  /**
   * 更新角色信息
   */
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // 如果更新编码，检查是否与其他角色冲突
    if (updateRoleDto.code && updateRoleDto.code !== role.code) {
      const existingRole = await this.roleRepository.findOne({
        where: { code: updateRoleDto.code },
      });
      if (existingRole) {
        throw new ConflictException(`角色编码 ${updateRoleDto.code} 已存在`);
      }
    }

    // 合并更新
    Object.assign(role, updateRoleDto);

    return this.roleRepository.save(role);
  }

  /**
   * 删除角色（系统角色不能删除）
   */
  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new BadRequestException('系统角色不能删除');
    }

    await this.roleRepository.remove(role);
  }

  /**
   * 为角色分配权限
   */
  async assignPermissions(id: string, permissionIds: string[]): Promise<Role> {
    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new BadRequestException('系统角色不能修改权限');
    }

    // 查询权限
    const permissions = await this.permissionRepository.findByIds(permissionIds);

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('部分权限ID不存在');
    }

    // 更新角色权限
    role.permissions = permissions;

    return this.roleRepository.save(role);
  }

  /**
   * 根据编码查询角色
   */
  async findByCode(code: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { code },
      relations: ['permissions'],
    });
  }

  /**
   * 检查角色编码是否存在
   */
  async isCodeExists(code: string): Promise<boolean> {
    const count = await this.roleRepository.count({
      where: { code },
    });
    return count > 0;
  }
}
