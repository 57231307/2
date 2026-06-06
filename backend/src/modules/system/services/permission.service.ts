import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission, PermissionType } from '../entities/permission.entity';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

/**
 * 权限分组结果 DTO
 */
export interface GroupedPermissions {
  module: string;
  permissions: Permission[];
}

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * 创建权限
   */
  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    // 检查权限编码是否已存在
    const existingPermission = await this.permissionRepository.findOne({
      where: { code: createPermissionDto.code },
    });

    if (existingPermission) {
      throw new ConflictException(`权限编码 ${createPermissionDto.code} 已存在`);
    }

    // 创建权限
    const permission = this.permissionRepository.create(createPermissionDto);

    return this.permissionRepository.save(permission);
  }

  /**
   * 查询所有权限（按模块分组）
   */
  async findAll(): Promise<GroupedPermissions[]> {
    const permissions = await this.permissionRepository.find({
      order: { module: 'ASC', sortOrder: 'ASC', createdAt: 'DESC' },
    });

    // 按模块分组
    const groupedMap = new Map<string, Permission[]>();

    for (const permission of permissions) {
      const module = permission.module || '未分类';
      if (!groupedMap.has(module)) {
        groupedMap.set(module, []);
      }
      groupedMap.get(module)!.push(permission);
    }

    // 转换为数组格式
    return Array.from(groupedMap.entries()).map(([module, perms]) => ({
      module,
      permissions: perms,
    }));
  }

  /**
   * 根据ID查询权限详情
   */
  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException(`权限ID ${id} 不存在`);
    }

    return permission;
  }

  /**
   * 更新权限信息
   */
  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);

    // 如果更新编码，检查是否与其他权限冲突
    if (updatePermissionDto.code && updatePermissionDto.code !== permission.code) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { code: updatePermissionDto.code },
      });
      if (existingPermission) {
        throw new ConflictException(`权限编码 ${updatePermissionDto.code} 已存在`);
      }
    }

    // 合并更新
    Object.assign(permission, updatePermissionDto);

    return this.permissionRepository.save(permission);
  }

  /**
   * 删除权限（系统权限不能删除）
   */
  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);

    if (permission.isSystem) {
      throw new BadRequestException('系统权限不能删除');
    }

    await this.permissionRepository.remove(permission);
  }

  /**
   * 按模块查询权限
   */
  async getByModule(module: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { module, isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 根据编码查询权限
   */
  async findByCode(code: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { code },
    });
  }

  /**
   * 检查权限编码是否存在
   */
  async isCodeExists(code: string): Promise<boolean> {
    const count = await this.permissionRepository.count({
      where: { code },
    });
    return count > 0;
  }
}
