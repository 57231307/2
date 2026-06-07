import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Between } from 'typeorm';
import { PatternCopyright } from '../entities/pattern-copyright.entity';
import { CopyrightStatus } from '../enums';
import { CreatePatternCopyrightDto, QueryPatternCopyrightDto } from '../dto';

/**
 * 花型版权服务
 * 提供花型版权的CRUD操作和到期预警
 */
@Injectable()
export class PatternCopyrightService {
  constructor(
    @InjectRepository(PatternCopyright)
    private copyrightRepository: Repository<PatternCopyright>,
  ) {}

  /**
   * 创建版权
   */
  async create(data: CreatePatternCopyrightDto): Promise<PatternCopyright> {
    const existing = await this.copyrightRepository.findOne({
      where: { copyrightNo: data.copyrightNo },
    });
    if (existing) {
      throw new ConflictException('版权号已存在');
    }

    // 根据日期自动设置状态
    let status = data.status;
    if (!status) {
      status = this.calculateStatus(new Date(data.startDate), new Date(data.endDate));
    }

    const copyright = this.copyrightRepository.create({
      ...data,
      status,
    });
    return this.copyrightRepository.save(copyright);
  }

  /**
   * 分页查询版权列表
   */
  async findAll(query: QueryPatternCopyrightDto): Promise<{
    data: PatternCopyright[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = {};

    if (query.patternId) {
      where.patternId = query.patternId;
    }
    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await this.copyrightRepository.findAndCount({
      where,
      relations: ['pattern'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * 获取版权详情
   */
  async findOne(id: string): Promise<PatternCopyright> {
    const copyright = await this.copyrightRepository.findOne({
      where: { id },
      relations: ['pattern'],
    });
    if (!copyright) {
      throw new NotFoundException('版权不存在');
    }
    return copyright;
  }

  /**
   * 根据花型ID获取版权
   */
  async findByPatternId(patternId: string): Promise<PatternCopyright | null> {
    return this.copyrightRepository.findOne({
      where: { patternId },
      relations: ['pattern'],
    });
  }

  /**
   * 获取即将到期的版权列表
   * @param days 提前多少天提醒，默认30天
   */
  async findExpiring(days: number = 30): Promise<PatternCopyright[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.copyrightRepository.find({
      where: {
        status: CopyrightStatus.VALID,
        endDate: LessThanOrEqual(futureDate),
      },
      relations: ['pattern'],
      order: { endDate: 'ASC' },
    });
  }

  /**
   * 获取已过期的版权列表
   */
  async findExpired(): Promise<PatternCopyright[]> {
    const now = new Date();
    return this.copyrightRepository.find({
      where: {
        endDate: LessThanOrEqual(now),
      },
      relations: ['pattern'],
      order: { endDate: 'ASC' },
    });
  }

  /**
   * 更新版权使用统计
   */
  async incrementUsageCount(id: string): Promise<void> {
    await this.copyrightRepository.increment({ id }, 'usedCount', 1);
  }

  /**
   * 更新授权产品数
   */
  async updateLicensedProductCount(id: string, count: number): Promise<void> {
    await this.copyrightRepository.update(id, { licensedProductCount: count });
  }

  /**
   * 更新版权状态（批量更新过期状态）
   */
  async updateExpiredStatuses(): Promise<void> {
    const now = new Date();

    // 更新已过期的版权状态
    await this.copyrightRepository.update(
      {
        endDate: LessThanOrEqual(now),
        status: CopyrightStatus.VALID,
      },
      {
        status: CopyrightStatus.EXPIRED,
      },
    );

    // 更新即将到期的版权状态（30天内）
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    await this.copyrightRepository
      .createQueryBuilder()
      .update(PatternCopyright)
      .set({ status: CopyrightStatus.EXPIRING })
      .where('end_date > :now', { now })
      .andWhere('end_date <= :futureDate', { futureDate: thirtyDaysLater })
      .andWhere('status = :validStatus', { validStatus: CopyrightStatus.VALID })
      .execute();
  }

  /**
   * 获取版权使用统计
   */
  async getUsageStats(id: string): Promise<{
    usedCount: number;
    licensedProductCount: number;
    renewalCount: number;
    daysUntilExpiry: number;
  }> {
    const copyright = await this.findOne(id);
    const now = new Date();
    const endDate = new Date(copyright.endDate);
    const daysUntilExpiry = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      usedCount: copyright.usedCount,
      licensedProductCount: copyright.licensedProductCount,
      renewalCount: copyright.renewalCount,
      daysUntilExpiry: Math.max(0, daysUntilExpiry),
    };
  }

  /**
   * 根据日期计算版权状态
   */
  private calculateStatus(startDate: Date, endDate: Date): CopyrightStatus {
    const now = new Date();

    if (now < startDate) {
      return CopyrightStatus.UNAUTHORIZED;
    }

    if (now > endDate) {
      return CopyrightStatus.EXPIRED;
    }

    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    if (endDate <= thirtyDaysLater) {
      return CopyrightStatus.EXPIRING;
    }

    return CopyrightStatus.VALID;
  }
}
