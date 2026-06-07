/**
 * 部门服务
 * 提供部门的完整操作流程
 */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, FindOptionsWhere } from 'typeorm';
import { Department, DepartmentStatus } from '../entities/department.entity';

export interface CreateDepartmentDto {
  departmentCode: string;
  departmentName: string;
  parentId?: string;
  managerId?: string;
  managerName?: string;
  managerPhone?: string;
  managerEmail?: string;
  description?: string;
  sortOrder?: number;
  remark?: string;
}

export interface UpdateDepartmentDto {
  departmentCode?: string;
  departmentName?: string;
  parentId?: string;
  managerId?: string;
  managerName?: string;
  managerPhone?: string;
  managerEmail?: string;
  status?: DepartmentStatus;
  description?: string;
  sortOrder?: number;
  remark?: string;
}

/**
 * 部门服务
 */
@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  /**
   * 创建部门
   */
  async create(dto: CreateDepartmentDto): Promise<Department> {
    // 检查部门编号是否已存在
    const existing = await this.departmentRepository.findOne({
      where: { departmentCode: dto.departmentCode },
    });
    if (existing) {
      throw new ConflictException('部门编号已存在');
    }

    const department = this.departmentRepository.create({
      departmentCode: dto.departmentCode,
      departmentName: dto.departmentName,
      parentId: dto.parentId || null,
      managerId: dto.managerId,
      managerName: dto.managerName,
      managerPhone: dto.managerPhone,
      managerEmail: dto.managerEmail,
      description: dto.description,
      sortOrder: dto.sortOrder || 0,
      remark: dto.remark,
      status: DepartmentStatus.ACTIVE,
    });

    return this.departmentRepository.save(department);
  }

  /**
   * 查询所有部门（树形结构）
   */
  async findAll(): Promise<Department[]> {
    const departments = await this.departmentRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      relations: ['parent'],
    });

    // 构建树形结构
    return this.buildTree(departments);
  }

  /**
   * 查询启用的部门列表
   */
  async findActive(): Promise<Department[]> {
    return this.departmentRepository.find({
      where: { status: DepartmentStatus.ACTIVE },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 获取部门详情
   */
  async findOne(id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['parent'],
    });
    if (!department) {
      throw new NotFoundException('部门不存在');
    }
    return department;
  }

  /**
   * 更新部门
   */
  async update(id: string, dto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id);

    // 如果更新部门编号，检查是否冲突
    if (dto.departmentCode && dto.departmentCode !== department.departmentCode) {
      const existing = await this.departmentRepository.findOne({
        where: { departmentCode: dto.departmentCode },
      });
      if (existing) {
        throw new ConflictException('部门编号已存在');
      }
    }

    // 不能将自己设为父部门
    if (dto.parentId === id) {
      throw new ConflictException('不能将自己设为父部门');
    }

    Object.assign(department, dto);
    return this.departmentRepository.save(department);
  }

  /**
   * 删除部门
   */
  async remove(id: string): Promise<void> {
    const department = await this.findOne(id);

    // 检查是否有子部门
    const children = await this.departmentRepository.find({
      where: { parentId: id },
    });
    if (children.length > 0) {
      throw new ConflictException('该部门存在子部门，无法删除');
    }

    // 检查是否被用户引用
    // TODO: 检查用户表中是否有引用

    await this.departmentRepository.remove(department);
  }

  /**
   * 构建树形结构
   */
  private buildTree(departments: Department[]): Department[] {
    const map = new Map<string, Department>();
    const roots: Department[] = [];

    // 先将所有部门放入map
    departments.forEach((dept) => {
      map.set(dept.id, { ...dept, children: [] });
    });

    // 构建树形关系
    departments.forEach((dept) => {
      const node = map.get(dept.id)!;
      if (dept.parentId && map.has(dept.parentId)) {
        map.get(dept.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * 获取子部门ID列表
   */
  async getSubDepartmentIds(parentId: string): Promise<string[]> {
    const allDepartments = await this.departmentRepository.find();
    const result: string[] = [];

    const collectChildren = (pid: string) => {
      allDepartments.forEach((dept) => {
        if (dept.parentId === pid) {
          result.push(dept.id);
          collectChildren(dept.id);
        }
      });
    };

    collectChildren(parentId);
    return result;
  }
}
