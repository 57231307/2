import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { format } from 'date-fns';
import { SupplierEvaluation, SupplierEvaluationLevel } from '../entities/supplier-evaluation.entity';
import { SupplierEvaluationItem, EvaluationItemType } from '../entities/supplier-evaluation-item.entity';
import { Supplier } from '../../base-data/entities/supplier.entity';
import { CreateSupplierEvaluationDto, UpdateSupplierEvaluationDto, QuerySupplierEvaluationDto } from '../dto/supplier-evaluation.dto';

/**
 * 供应商评估服务
 * 提供供应商评估的CRUD和统计分析功能
 */
@Injectable()
export class SupplierEvaluationService {
  constructor(
    @InjectRepository(SupplierEvaluation)
    private evaluationRepository: Repository<SupplierEvaluation>,
    @InjectRepository(SupplierEvaluationItem)
    private evaluationItemRepository: Repository<SupplierEvaluationItem>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    private dataSource: DataSource,
  ) {}

  /**
   * 生成评估编号
   * 格式：PG-YYYYMMDD-XXXX
   */
  private async generateEvaluationNo(): Promise<string> {
    const today = new Date();
    const dateStr = format(today, 'yyyyMMdd');
    const prefix = `PG${dateStr}`;

    // 查询当日最大序号
    const maxEvaluation = await this.evaluationRepository
      .createQueryBuilder('evaluation')
      .where('evaluation.evaluation_no LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('evaluation.evaluation_no', 'DESC')
      .select(['evaluation.evaluation_no'])
      .getOne();

    let nextNumber = 1;
    if (maxEvaluation) {
      const lastNo = maxEvaluation.evaluationNo.slice(-4);
      nextNumber = parseInt(lastNo, 10) + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  /**
   * 计算评估等级
   * 根据综合评分计算等级：A(8-10), B(6-8), C(4-6), D(<4)
   */
  private calculateLevel(totalScore: number): SupplierEvaluationLevel {
    if (totalScore >= 8) {
      return SupplierEvaluationLevel.A;
    } else if (totalScore >= 6) {
      return SupplierEvaluationLevel.B;
    } else if (totalScore >= 4) {
      return SupplierEvaluationLevel.C;
    } else {
      return SupplierEvaluationLevel.D;
    }
  }

  /**
   * 创建供应商评估
   */
  async create(dto: CreateSupplierEvaluationDto): Promise<SupplierEvaluation> {
    // 校验供应商
    const supplier = await this.supplierRepository.findOne({ where: { id: dto.supplierId } });
    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }

    // 计算综合评分
    const totalScore = (
      Number(dto.qualityScore) +
      Number(dto.deliveryScore) +
      Number(dto.priceScore) +
      Number(dto.serviceScore)
    ) / 4;

    // 计算评估等级
    const level = this.calculateLevel(totalScore);

    // 生成评估编号
    const evaluationNo = await this.generateEvaluationNo();

    // 创建评估明细
    const items: SupplierEvaluationItem[] = [];
    if (dto.items && dto.items.length > 0) {
      for (const itemDto of dto.items) {
        const item = this.evaluationItemRepository.create({
          itemName: itemDto.itemName,
          itemType: itemDto.itemType,
          score: itemDto.score,
          description: itemDto.description,
        });
        items.push(item);
      }
    }

    // 创建评估记录
    const evaluation = this.evaluationRepository.create({
      evaluationNo,
      supplierId: dto.supplierId,
      supplierName: supplier.name,
      evaluationDate: new Date(dto.evaluationDate),
      evaluator: dto.evaluator,
      qualityScore: dto.qualityScore,
      deliveryScore: dto.deliveryScore,
      priceScore: dto.priceScore,
      serviceScore: dto.serviceScore,
      totalScore,
      level,
      conclusion: dto.conclusion,
      notes: dto.notes,
      items,
    });

    return this.evaluationRepository.save(evaluation);
  }

  /**
   * 查询供应商评估列表
   */
  async findAll(
    query: QuerySupplierEvaluationDto,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: SupplierEvaluation[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.evaluationRepository
      .createQueryBuilder('evaluation')
      .leftJoinAndSelect('evaluation.items', 'items')
      .orderBy('evaluation.created_at', 'DESC');

    if (query.supplierId) {
      queryBuilder.andWhere('evaluation.supplier_id = :supplierId', { supplierId: query.supplierId });
    }

    if (query.evaluator) {
      queryBuilder.andWhere('evaluation.evaluator LIKE :evaluator', { evaluator: `%${query.evaluator}%` });
    }

    if (query.level) {
      queryBuilder.andWhere('evaluation.level = :level', { level: query.level });
    }

    if (query.evaluationDateFrom) {
      queryBuilder.andWhere('evaluation.evaluation_date >= :evaluationDateFrom', { evaluationDateFrom: query.evaluationDateFrom });
    }

    if (query.evaluationDateTo) {
      queryBuilder.andWhere('evaluation.evaluation_date <= :evaluationDateTo', { evaluationDateTo: query.evaluationDateTo });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * 获取供应商评估详情
   */
  async findOne(id: string): Promise<SupplierEvaluation> {
    const evaluation = await this.evaluationRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!evaluation) {
      throw new NotFoundException('供应商评估不存在');
    }

    return evaluation;
  }

  /**
   * 更新供应商评估
   */
  async update(id: string, dto: UpdateSupplierEvaluationDto): Promise<SupplierEvaluation> {
    const evaluation = await this.findOne(id);

    // 更新供应商信息
    if (dto.supplierId) {
      const supplier = await this.supplierRepository.findOne({ where: { id: dto.supplierId } });
      if (!supplier) {
        throw new NotFoundException('供应商不存在');
      }
      evaluation.supplierId = dto.supplierId;
      evaluation.supplierName = supplier.name;
    }

    // 更新评估日期
    if (dto.evaluationDate) {
      evaluation.evaluationDate = new Date(dto.evaluationDate);
    }

    // 更新评估人
    if (dto.evaluator !== undefined) {
      evaluation.evaluator = dto.evaluator;
    }

    // 更新评分（如果提供）
    if (dto.qualityScore !== undefined) {
      evaluation.qualityScore = dto.qualityScore;
    }
    if (dto.deliveryScore !== undefined) {
      evaluation.deliveryScore = dto.deliveryScore;
    }
    if (dto.priceScore !== undefined) {
      evaluation.priceScore = dto.priceScore;
    }
    if (dto.serviceScore !== undefined) {
      evaluation.serviceScore = dto.serviceScore;
    }

    // 重新计算综合评分和等级
    const totalScore = (
      Number(evaluation.qualityScore) +
      Number(evaluation.deliveryScore) +
      Number(evaluation.priceScore) +
      Number(evaluation.serviceScore)
    ) / 4;
    evaluation.totalScore = totalScore;
    evaluation.level = this.calculateLevel(totalScore);

    // 更新结论和备注
    if (dto.conclusion !== undefined) {
      evaluation.conclusion = dto.conclusion;
    }
    if (dto.notes !== undefined) {
      evaluation.notes = dto.notes;
    }

    // 更新明细
    if (dto.items && dto.items.length > 0) {
      // 删除原有明细
      await this.evaluationItemRepository.delete({ evaluationId: id });

      // 创建新明细
      const items: SupplierEvaluationItem[] = [];
      for (const itemDto of dto.items) {
        const item = this.evaluationItemRepository.create({
          evaluationId: id,
          itemName: itemDto.itemName,
          itemType: itemDto.itemType,
          score: itemDto.score,
          description: itemDto.description,
        });
        items.push(item);
      }
      evaluation.items = items;
    }

    return this.evaluationRepository.save(evaluation);
  }

  /**
   * 获取供应商的评分记录
   */
  async getSupplierScores(supplierId: string): Promise<SupplierEvaluation[]> {
    return this.evaluationRepository.find({
      where: { supplierId },
      order: { evaluationDate: 'DESC' },
    });
  }

  /**
   * 获取供应商的平均评分
   */
  async getSupplierAverageScores(supplierId: string): Promise<{
    avgQualityScore: number;
    avgDeliveryScore: number;
    avgPriceScore: number;
    avgServiceScore: number;
    avgTotalScore: number;
    totalEvaluations: number;
  }> {
    const result = await this.evaluationRepository
      .createQueryBuilder('evaluation')
      .where('evaluation.supplier_id = :supplierId', { supplierId })
      .select([
        'AVG(evaluation.quality_score) as avgQualityScore',
        'AVG(evaluation.delivery_score) as avgDeliveryScore',
        'AVG(evaluation.price_score) as avgPriceScore',
        'AVG(evaluation.service_score) as avgServiceScore',
        'AVG(evaluation.total_score) as avgTotalScore',
        'COUNT(*) as totalEvaluations',
      ])
      .getRawOne();

    return {
      avgQualityScore: parseFloat(result.avgQualityScore) || 0,
      avgDeliveryScore: parseFloat(result.avgDeliveryScore) || 0,
      avgPriceScore: parseFloat(result.avgPriceScore) || 0,
      avgServiceScore: parseFloat(result.avgServiceScore) || 0,
      avgTotalScore: parseFloat(result.avgTotalScore) || 0,
      totalEvaluations: parseInt(result.totalEvaluations, 10) || 0,
    };
  }
}
