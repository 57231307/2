/**
 * 系统参数服务
 * 提供系统参数的完整操作流程
 */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemParameter, ParameterType } from '../entities/system-parameter.entity';

export interface CreateSystemParameterDto {
  parameterKey: string;
  parameterValue: string;
  parameterType: ParameterType;
  parameterName: string;
  description?: string;
  parameterGroup?: string;
  isActive?: boolean;
  isEditable?: boolean;
  sortOrder?: number;
  remark?: string;
}

export interface UpdateSystemParameterDto {
  parameterValue?: string;
  parameterName?: string;
  description?: string;
  parameterGroup?: string;
  isActive?: boolean;
  isEditable?: boolean;
  sortOrder?: number;
  remark?: string;
}

/**
 * 系统参数服务
 */
@Injectable()
export class SystemParameterService {
  constructor(
    @InjectRepository(SystemParameter)
    private parameterRepository: Repository<SystemParameter>,
  ) {}

  /**
   * 创建系统参数
   */
  async create(dto: CreateSystemParameterDto): Promise<SystemParameter> {
    // 检查参数键是否已存在
    const existing = await this.parameterRepository.findOne({
      where: { parameterKey: dto.parameterKey },
    });
    if (existing) {
      throw new ConflictException('参数键已存在');
    }

    const parameter = this.parameterRepository.create({
      parameterKey: dto.parameterKey,
      parameterValue: dto.parameterValue,
      parameterType: dto.parameterType,
      parameterName: dto.parameterName,
      description: dto.description,
      parameterGroup: dto.parameterGroup,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      isEditable: dto.isEditable !== undefined ? dto.isEditable : true,
      sortOrder: dto.sortOrder || 0,
      remark: dto.remark,
    });

    return this.parameterRepository.save(parameter);
  }

  /**
   * 查询所有系统参数
   */
  async findAll(): Promise<SystemParameter[]> {
    return this.parameterRepository.find({
      order: { parameterGroup: 'ASC', sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 按分组查询系统参数
   */
  async findByGroup(group: string): Promise<SystemParameter[]> {
    return this.parameterRepository.find({
      where: { parameterGroup: group },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 获取启用的系统参数
   */
  async findActive(): Promise<SystemParameter[]> {
    return this.parameterRepository.find({
      where: { isActive: true },
      order: { parameterGroup: 'ASC', sortOrder: 'ASC' },
    });
  }

  /**
   * 获取参数详情
   */
  async findOne(key: string): Promise<SystemParameter> {
    const parameter = await this.parameterRepository.findOne({
      where: { parameterKey: key },
    });
    if (!parameter) {
      throw new NotFoundException(`参数不存在: ${key}`);
    }
    return parameter;
  }

  /**
   * 获取参数值
   */
  async getValue(key: string): Promise<string | null> {
    const parameter = await this.parameterRepository.findOne({
      where: { parameterKey: key, isActive: true },
    });
    return parameter?.parameterValue || null;
  }

  /**
   * 获取参数值（带默认值）
   */
  async getValueWithDefault(key: string, defaultValue: string): Promise<string> {
    const parameter = await this.parameterRepository.findOne({
      where: { parameterKey: key, isActive: true },
    });
    return parameter?.parameterValue || defaultValue;
  }

  /**
   * 更新系统参数
   */
  async update(key: string, dto: UpdateSystemParameterDto): Promise<SystemParameter> {
    const parameter = await this.findOne(key);

    if (!parameter.isEditable) {
      throw new ConflictException('该参数不可编辑');
    }

    Object.assign(parameter, dto);
    return this.parameterRepository.save(parameter);
  }

  /**
   * 更新参数值
   */
  async updateValue(key: string, value: string): Promise<SystemParameter> {
    const parameter = await this.findOne(key);

    if (!parameter.isEditable) {
      throw new ConflictException('该参数不可编辑');
    }

    parameter.parameterValue = value;
    return this.parameterRepository.save(parameter);
  }

  /**
   * 删除系统参数
   */
  async remove(key: string): Promise<void> {
    const parameter = await this.findOne(key);

    if (!parameter.isEditable) {
      throw new ConflictException('该参数不可删除');
    }

    await this.parameterRepository.remove(parameter);
  }

  /**
   * 批量更新参数值
   */
  async batchUpdateValue(updates: Array<{ key: string; value: string }>): Promise<void> {
    for (const update of updates) {
      await this.updateValue(update.key, update.value);
    }
  }

  /**
   * 获取所有分组
   */
  async getAllGroups(): Promise<string[]> {
    const parameters = await this.parameterRepository
      .createQueryBuilder('param')
      .select('DISTINCT param.parameter_group', 'group')
      .where('param.parameter_group IS NOT NULL')
      .getRawMany();

    return parameters.map((p) => p.group).filter(Boolean);
  }
}
