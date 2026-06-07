/**
 * 岗位服务
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position, PositionStatus } from '../entities/position.entity';
import { Department } from '../entities/department.entity';

/**
 * 创建岗位DTO
 */
export interface CreatePositionDto {
  positionCode: string;
  positionName: string;
  departmentId?: string;
  jobResponsibilities?: string;
  requirements?: string;
  status?: PositionStatus;
  sortOrder?: number;
  remark?: string;
}

/**
 * 更新岗位DTO
 */
export interface UpdatePositionDto {
  positionName?: string;
  departmentId?: string;
  jobResponsibilities?: string;
  requirements?: string;
  status?: PositionStatus;
  sortOrder?: number;
  remark?: string;
}

/**
 * 查询岗位DTO
 */
export interface QueryPositionDto {
  keyword?: string;
  departmentId?: string;
  status?: PositionStatus;
}

/**
 * 岗位服务
 */
@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  /**
   * 创岗岗位
   */
  async create(dto: CreatePositionDto): Promise<Position> {
    // 检查岗位编号是否已存在
    const existing = await this.positionRepository.findOne({
      where: { positionCode: dto.positionCode },
    });
    if (existing) {
      throw new BadRequestException('岗位编号已存在');
    }

    // 获取部门名称
    let departmentName: string | null = null;
    if (dto.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: { id: dto.departmentId },
      });
      if (department) {
        departmentName = department.departmentName;
      }
    }

    const position = this.positionRepository.create({
      positionCode: dto.positionCode,
      positionName: dto.positionName,
      departmentId: dto.departmentId || null,
      departmentName: departmentName,
      jobResponsibilities: dto.jobResponsibilities || null,
      requirements: dto.requirements || null,
      status: dto.status || PositionStatus.ACTIVE,
      sortOrder: dto.sortOrder || 0,
      remark: dto.remark || null,
    });

    return this.positionRepository.save(position);
  }

  /**
   * 查询岗位列表
   */
  async findAll(
    query: QueryPositionDto,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Position[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.positionRepository
      .createQueryBuilder('position')
      .orderBy('position.sort_order', 'ASC');

    if (query.keyword) {
      queryBuilder.andWhere(
        '(position.position_code LIKE :keyword OR position.position_name LIKE :keyword)',
        { keyword: `%${query.keyword}%` },
      );
    }

    if (query.departmentId) {
      queryBuilder.andWhere('position.department_id = :departmentId', {
        departmentId: query.departmentId,
      });
    }

    if (query.status) {
      queryBuilder.andWhere('position.status = :status', { status: query.status });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * 获取岗位详情
   */
  async findOne(id: string): Promise<Position> {
    const position = await this.positionRepository.findOne({
      where: { id },
    });

    if (!position) {
      throw new NotFoundException('岗位不存在');
    }

    return position;
  }

  /**
   * 更新岗位
   */
  async update(id: string, dto: UpdatePositionDto): Promise<Position> {
    const position = await this.findOne(id);

    if (dto.positionName !== undefined) {
      position.positionName = dto.positionName;
    }

    if (dto.departmentId !== undefined) {
      position.departmentId = dto.departmentId || null;
      // 获取部门名称
      if (dto.departmentId) {
        const department = await this.departmentRepository.findOne({
          where: { id: dto.departmentId },
        });
        position.departmentName = department?.departmentName || null;
      } else {
        position.departmentName = null;
      }
    }

    if (dto.jobResponsibilities !== undefined) {
      position.jobResponsibilities = dto.jobResponsibilities;
    }

    if (dto.requirements !== undefined) {
      position.requirements = dto.requirements;
    }

    if (dto.status !== undefined) {
      position.status = dto.status;
    }

    if (dto.sortOrder !== undefined) {
      position.sortOrder = dto.sortOrder;
    }

    if (dto.remark !== undefined) {
      position.remark = dto.remark;
    }

    return this.positionRepository.save(position);
  }

  /**
   * 删除岗位
   */
  async remove(id: string): Promise<void> {
    const position = await this.findOne(id);
    await this.positionRepository.remove(position);
  }

  /**
   * 按部门查询岗位列表
   */
  async findByDepartment(departmentId: string): Promise<Position[]> {
    return this.positionRepository.find({
      where: { departmentId },
      order: { sortOrder: 'ASC' },
    });
  }
}
