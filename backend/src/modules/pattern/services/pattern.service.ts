import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Pattern } from '../entities/pattern.entity';
import { PatternStatus } from '../enums';
import { CreatePatternDto, UpdatePatternDto, QueryPatternDto } from '../dto';

/**
 * 花型服务
 * 提供花型的CRUD操作
 */
@Injectable()
export class PatternService {
  constructor(
    @InjectRepository(Pattern)
    private patternRepository: Repository<Pattern>,
  ) {}

  /**
   * 创建花型
   */
  async create(data: CreatePatternDto): Promise<Pattern> {
    const code = data.code || await this.generateCode();
    const existing = await this.patternRepository.findOne({ where: { code } });
    if (existing) {
      throw new ConflictException('花型编码已存在');
    }

    const pattern = this.patternRepository.create({
      ...data,
      code,
    });
    return this.patternRepository.save(pattern);
  }

  /**
   * 分页查询花型列表
   */
  async findAll(query: QueryPatternDto): Promise<{ data: Pattern[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = {};

    if (query.search) {
      where.name = Like(`%${query.search}%`);
    }
    if (query.style) {
      where.style = query.style;
    }
    if (query.usage) {
      where.usage = query.usage;
    }
    if (query.category) {
      where.category = query.category;
    }
    if (query.status) {
      where.status = query.status;
    }

    const order: any = {};
    if (query.sortBy) {
      order[query.sortBy] = query.sortOrder || 'DESC';
    } else {
      order.createdAt = 'DESC';
    }

    const [data, total] = await this.patternRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order,
    });

    return { data, total, page, limit };
  }

  /**
   * 获取花型详情
   */
  async findOne(id: string): Promise<Pattern> {
    const pattern = await this.patternRepository.findOne({
      where: { id },
      relations: ['copyright'],
    });
    if (!pattern) {
      throw new NotFoundException('花型不存在');
    }
    return pattern;
  }

  /**
   * 更新花型
   */
  async update(id: string, data: UpdatePatternDto): Promise<Pattern> {
    const pattern = await this.findOne(id);

    Object.assign(pattern, data);
    return this.patternRepository.save(pattern);
  }

  /**
   * 删除花型（软删除 - 设置为停用状态）
   */
  async remove(id: string): Promise<void> {
    const pattern = await this.findOne(id);
    pattern.status = PatternStatus.INACTIVE;
    await this.patternRepository.save(pattern);
  }

  /**
   * 彻底删除花型（硬删除）
   */
  async hardRemove(id: string): Promise<void> {
    const pattern = await this.findOne(id);
    await this.patternRepository.remove(pattern);
  }

  /**
   * 更新花型使用次数
   */
  async incrementUsageCount(id: string): Promise<void> {
    await this.patternRepository.increment({ id }, 'usageCount', 1);
  }

  /**
   * 搜索花型（按名称或编码模糊搜索）
   */
  async search(keyword: string): Promise<Pattern[]> {
    return this.patternRepository.find({
      where: [
        { name: Like(`%${keyword}%`) },
        { code: Like(`%${keyword}%`) },
      ],
      take: 20,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据风格获取花型列表
   */
  async findByStyle(style: string): Promise<Pattern[]> {
    return this.patternRepository.find({
      where: { style: style as any, status: PatternStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据用途获取花型列表
   */
  async findByUsage(usage: string): Promise<Pattern[]> {
    return this.patternRepository.find({
      where: { usage: usage as any, status: PatternStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 生成花型编码
   * 格式：PAT + 日期(YYYYMMDD) + 序号(4位)
   */
  private async generateCode(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `PAT${dateStr}`;

    const count = await this.patternRepository.count({
      where: { code: Like(`${prefix}%`) },
    });

    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}${seq}`;
  }
}
