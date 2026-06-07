/**
 * 质检报告服务
 * 提供质检报告的完整操作流程
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere } from 'typeorm';
import { QualityInspection } from '../entities/quality-inspection.entity';
import { QualityInspectionItem } from '../entities/quality-inspection-item.entity';
import { QualityStandard } from '../entities/quality-standard.entity';
import { 
  CreateQualityInspectionDto, 
  AddInspectionItemDto,
  AddInspectionItemsDto,
  QueryQualityInspectionDto 
} from '../dto';
import { InspectionResult, InspectionStatus, InspectionItemResult } from '../enums';

/**
 * 质检报告服务
 */
@Injectable()
export class QualityInspectionService {
  constructor(
    @InjectRepository(QualityInspection)
    private inspectionRepository: Repository<QualityInspection>,
    @InjectRepository(QualityInspectionItem)
    private inspectionItemRepository: Repository<QualityInspectionItem>,
    @InjectRepository(QualityStandard)
    private standardRepository: Repository<QualityStandard>,
  ) {}

  /**
   * 创建质检报告
   */
  async createInspection(data: CreateQualityInspectionDto): Promise<QualityInspection> {
    const inspectionNo = await this.generateInspectionNo();

    const inspection = this.inspectionRepository.create({
      ...data,
      inspectionNo,
      inspectionDate: new Date(data.inspectionDate),
      status: InspectionStatus.PENDING,
    });

    return this.inspectionRepository.save(inspection);
  }

  /**
   * 分页查询质检列表
   */
  async findInspections(query: QueryQualityInspectionDto): Promise<{ data: QualityInspection[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: FindOptionsWhere<QualityInspection> = {};

    if (query.type) {
      where.type = query.type;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.sourceId) {
      where.sourceId = query.sourceId;
    }

    let whereConditions: any = where;
    if (query.startDate && query.endDate) {
      whereConditions = {
        ...where,
        inspectionDate: Between(new Date(query.startDate), new Date(query.endDate)),
      };
    }

    if (query.search) {
      whereConditions.inspectionNo = Like(`%${query.search}%`);
    }

    const [data, total] = await this.inspectionRepository.findAndCount({
      where: whereConditions,
      relations: ['standard'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * 获取质检详情（包含明细列表）
   */
  async findInspectionById(id: string): Promise<QualityInspection> {
    const inspection = await this.inspectionRepository.findOne({
      where: { id },
      relations: ['standard', 'inspectionItems'],
    });
    if (!inspection) {
      throw new NotFoundException('质检报告不存在');
    }
    return inspection;
  }

  /**
   * 添加单个质检项
   */
  async recordInspectionItem(id: string, data: AddInspectionItemDto): Promise<QualityInspectionItem> {
    const inspection = await this.findInspectionById(id);
    
    if (inspection.status === InspectionStatus.COMPLETED) {
      throw new BadRequestException('已完成的质检报告不能添加质检项');
    }

    // 更新状态为进行中
    if (inspection.status === InspectionStatus.PENDING) {
      inspection.status = InspectionStatus.IN_PROGRESS;
      await this.inspectionRepository.save(inspection);
    }

    const item = this.inspectionItemRepository.create({
      ...data,
      inspectionId: id,
    });

    return this.inspectionItemRepository.save(item);
  }

  /**
   * 批量添加质检项
   */
  async recordInspectionItems(id: string, data: AddInspectionItemsDto): Promise<QualityInspectionItem[]> {
    const inspection = await this.findInspectionById(id);
    
    if (inspection.status === InspectionStatus.COMPLETED) {
      throw new BadRequestException('已完成的质检报告不能添加质检项');
    }

    // 更新状态为进行中
    if (inspection.status === InspectionStatus.PENDING) {
      inspection.status = InspectionStatus.IN_PROGRESS;
      await this.inspectionRepository.save(inspection);
    }

    const items = data.items.map(itemData => 
      this.inspectionItemRepository.create({
        ...itemData,
        inspectionId: id,
      })
    );

    return this.inspectionItemRepository.save(items);
  }

  /**
   * 计算质检结果
   * 根据所有质检项的结果判定最终质检结果
   */
  async calculateResult(id: string): Promise<QualityInspection> {
    const inspection = await this.findInspectionById(id);
    
    if (inspection.status === InspectionStatus.COMPLETED) {
      throw new BadRequestException('已完成的质检报告不能重新计算结果');
    }

    // 统计合格和不合格数量
    const items = await this.inspectionItemRepository.find({
      where: { inspectionId: id },
    });

    let passedQuantity = 0;
    let failedQuantity = 0;

    for (const item of items) {
      if (item.result === InspectionItemResult.OK || item.result === InspectionItemResult.NA) {
        passedQuantity++;
      } else {
        failedQuantity++;
      }
    }

    // 计算不合格率
    const defectRate = items.length > 0 ? failedQuantity / items.length : 0;

    // 根据AQL标准判定
    // 实际应用中应根据AQL表和抽样数量来确定，这里简化处理
    let result: InspectionResult;
    if (defectRate === 0) {
      result = InspectionResult.PASSED;
    } else if (defectRate <= 0.01) {
      result = InspectionResult.CONDITIONAL;
    } else {
      result = InspectionResult.FAILED;
    }

    inspection.passedQuantity = passedQuantity;
    inspection.failedQuantity = failedQuantity;
    inspection.result = result;
    inspection.status = InspectionStatus.COMPLETED;

    return this.inspectionRepository.save(inspection);
  }

  /**
   * 审核通过
   */
  async approve(id: string, approverId: string): Promise<QualityInspection> {
    const inspection = await this.findInspectionById(id);
    
    if (inspection.status !== InspectionStatus.COMPLETED) {
      throw new BadRequestException('只能审核已完成的质检报告');
    }

    if (!inspection.result) {
      throw new BadRequestException('请先计算质检结果');
    }

    inspection.approverId = approverId;
    inspection.approvedAt = new Date();

    return this.inspectionRepository.save(inspection);
  }

  /**
   * 生成质检单号
   * 格式：QI + 日期(YYYYMMDD) + 序号(4位)
   */
  private async generateInspectionNo(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `QI${dateStr}`;

    const count = await this.inspectionRepository.count({
      where: { inspectionNo: Like(`${prefix}%`) },
    });

    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}${seq}`;
  }
}
