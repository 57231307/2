/**
 * 成本差异分析服务
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CostVariance } from '../entities/cost-variance.entity';
import { format } from 'date-fns';

/**
 * 创建成本差异分析DTO
 */
export interface CreateCostVarianceDto {
  workOrderId?: string;
  workOrderNo?: string;
  orderId?: string;
  orderNo?: string;
  productId?: string;
  productName?: string;
  productCode?: string;
  standardCost: number;
  actualCost: number;
  varianceReason?: string;
  analysisDate: string;
  analyst: string;
  remark?: string;
}

/**
 * 查询成本差异分析DTO
 */
export interface QueryCostVarianceDto {
  keyword?: string;
  startDate?: string;
  endDate?: string;
  orderId?: string;
}

/**
 * 成本差异分析服务
 */
@Injectable()
export class CostVarianceService {
  constructor(
    @InjectRepository(CostVariance)
    private costVarianceRepository: Repository<CostVariance>,
  ) {}

  /**
   * 生成分析编号
   * 格式：CF-YYYYMMDD-XXXX
   */
  private async generateAnalysisNo(): Promise<string> {
    const today = new Date();
    const dateStr = format(today, 'yyyyMMdd');
    const prefix = `CF${dateStr}`;

    const maxRecord = await this.costVarianceRepository
      .createQueryBuilder('cv')
      .where('cv.analysis_no LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('cv.analysis_no', 'DESC')
      .select(['cv.analysis_no'])
      .getOne();

    let nextNumber = 1;
    if (maxRecord) {
      const lastNo = maxRecord.analysisNo.slice(-4);
      nextNumber = parseInt(lastNo, 10) + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  /**
   * 创造成本差异分析记录
   */
  async create(dto: CreateCostVarianceDto): Promise<CostVariance> {
    const analysisNo = await this.generateAnalysisNo();

    // 计算差异金额和差异率
    const varianceAmount = dto.actualCost - dto.standardCost;
    const varianceRate = dto.standardCost > 0
      ? (varianceAmount / dto.standardCost) * 100
      : 0;

    const costVariance = this.costVarianceRepository.create({
      analysisNo,
      workOrderId: dto.workOrderId || null,
      workOrderNo: dto.workOrderNo || null,
      orderId: dto.orderId || null,
      orderNo: dto.orderNo || null,
      productId: dto.productId || null,
      productName: dto.productName || null,
      productCode: dto.productCode || null,
      standardCost: dto.standardCost,
      actualCost: dto.actualCost,
      varianceAmount,
      varianceRate,
      varianceReason: dto.varianceReason || null,
      analysisDate: new Date(dto.analysisDate),
      analyst: dto.analyst,
      remark: dto.remark || null,
    });

    return this.costVarianceRepository.save(costVariance);
  }

  /**
   * 查询成本差异分析列表
   */
  async findAll(
    query: QueryCostVarianceDto,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: CostVariance[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.costVarianceRepository
      .createQueryBuilder('cv')
      .orderBy('cv.analysis_date', 'DESC');

    if (query.keyword) {
      queryBuilder.andWhere(
        '(cv.analysis_no LIKE :keyword OR cv.order_no LIKE :keyword OR cv.work_order_no LIKE :keyword OR cv.product_name LIKE :keyword)',
        { keyword: `%${query.keyword}%` },
      );
    }

    if (query.orderId) {
      queryBuilder.andWhere('cv.order_id = :orderId', { orderId: query.orderId });
    }

    if (query.startDate) {
      queryBuilder.andWhere('cv.analysis_date >= :startDate', { startDate: query.startDate });
    }

    if (query.endDate) {
      queryBuilder.andWhere('cv.analysis_date <= :endDate', { endDate: query.endDate });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * 获取分析详情
   */
  async findOne(id: string): Promise<CostVariance> {
    const costVariance = await this.costVarianceRepository.findOne({
      where: { id },
    });

    if (!costVariance) {
      throw new NotFoundException('成本差异分析记录不存在');
    }

    return costVariance;
  }

  /**
   * 按订单ID查询差异分析
   */
  async findByOrderId(orderId: string): Promise<CostVariance[]> {
    return this.costVarianceRepository.find({
      where: { orderId },
      order: { analysisDate: 'DESC' },
    });
  }

  /**
   * 按工单ID查询差异分析
   */
  async findByWorkOrderId(workOrderId: string): Promise<CostVariance[]> {
    return this.costVarianceRepository.find({
      where: { workOrderId },
      order: { analysisDate: 'DESC' },
    });
  }

  /**
   * 更新成本差异分析
   */
  async update(id: string, dto: Partial<CreateCostVarianceDto>): Promise<CostVariance> {
    const costVariance = await this.findOne(id);

    if (dto.standardCost !== undefined) {
      costVariance.standardCost = dto.standardCost;
    }
    if (dto.actualCost !== undefined) {
      costVariance.actualCost = dto.actualCost;
    }
    if (dto.varianceReason !== undefined) {
      costVariance.varianceReason = dto.varianceReason;
    }
    if (dto.remark !== undefined) {
      costVariance.remark = dto.remark;
    }

    // 重新计算差异
    const varianceAmount = costVariance.actualCost - costVariance.standardCost;
    const varianceRate = costVariance.standardCost > 0
      ? (varianceAmount / costVariance.standardCost) * 100
      : 0;
    costVariance.varianceAmount = varianceAmount;
    costVariance.varianceRate = varianceRate;

    return this.costVarianceRepository.save(costVariance);
  }

  /**
   * 删除成本差异分析
   */
  async remove(id: string): Promise<void> {
    const costVariance = await this.findOne(id);
    await this.costVarianceRepository.remove(costVariance);
  }
}
