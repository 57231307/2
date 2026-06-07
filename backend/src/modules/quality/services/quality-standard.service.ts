/**
 * 质检标准服务
 * 提供质检标准的CRUD操作
 */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { QualityStandard } from '../entities/quality-standard.entity';
import { CreateQualityStandardDto, UpdateQualityStandardDto, QueryQualityStandardDto } from '../dto';
import { InspectionStatus } from '../enums';

/**
 * 质检标准服务
 */
@Injectable()
export class QualityStandardService {
  constructor(
    @InjectRepository(QualityStandard)
    private qualityStandardRepository: Repository<QualityStandard>,
  ) {}

  /**
   * 创建质检标准
   */
  async create(data: CreateQualityStandardDto): Promise<QualityStandard> {
    const code = data.code || await this.generateCode();
    
    // 检查编码是否重复
    const existing = await this.qualityStandardRepository.findOne({ where: { code } });
    if (existing) {
      throw new ConflictException('质检标准编码已存在');
    }

    const standard = this.qualityStandardRepository.create({
      ...data,
      code,
      status: 'ACTIVE',
    });

    return this.qualityStandardRepository.save(standard);
  }

  /**
   * 分页查询质检标准列表
   */
  async findAll(query: QueryQualityStandardDto): Promise<{ data: QualityStandard[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = {};

    if (query.search) {
      where.name = Like(`%${query.search}%`);
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await this.qualityStandardRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * 获取质检标准详情
   */
  async findOne(id: string): Promise<QualityStandard> {
    const standard = await this.qualityStandardRepository.findOne({ where: { id } });
    if (!standard) {
      throw new NotFoundException('质检标准不存在');
    }
    return standard;
  }

  /**
   * 更新质检标准
   */
  async update(id: string, data: UpdateQualityStandardDto): Promise<QualityStandard> {
    const standard = await this.findOne(id);

    if (data.code && data.code !== standard.code) {
      const existing = await this.qualityStandardRepository.findOne({ where: { code: data.code } });
      if (existing) {
        throw new ConflictException('质检标准编码已存在');
      }
    }

    Object.assign(standard, data);
    return this.qualityStandardRepository.save(standard);
  }

  /**
   * 删除质检标准（软删除）
   */
  async remove(id: string): Promise<void> {
    const standard = await this.findOne(id);
    standard.status = InspectionStatus.CANCELLED;
    await this.qualityStandardRepository.save(standard);
  }

  /**
   * 生成质检标准编码
   * 格式：QS + 日期(YYYYMMDD) + 序号(4位)
   */
  private async generateCode(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `QS${dateStr}`;

    const count = await this.qualityStandardRepository.count({
      where: { code: Like(`${prefix}%`) },
    });

    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}${seq}`;
  }
}
