import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { format } from 'date-fns';
import { ProcessReport, ProcessReportStatus } from '../entities/process-report.entity';
import { WorkOrderDispatch } from '../entities/work-order-dispatch.entity';
import { ProcessStep } from '../entities/process-step.entity';

/**
 * 创建工序汇报DTO
 */
export interface CreateProcessReportDto {
  dispatchId: string;
  stepId: string;
  reportDate: string;
  qualifiedQuantity: number;
  defectiveQuantity: number;
  defectReason?: string;
  remark?: string;
}

/**
 * 更新工序汇报DTO
 */
export interface UpdateProcessReportDto {
  reportDate?: string;
  qualifiedQuantity?: number;
  defectiveQuantity?: number;
  defectReason?: string;
  remark?: string;
}

/**
 * 工序汇报查询DTO
 */
export interface QueryProcessReportDto {
  dispatchId?: string;
  stepId?: string;
  status?: ProcessReportStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * 工序汇报服务
 * 提供工序汇报的CRUD操作
 */
@Injectable()
export class ProcessReportService {
  constructor(
    @InjectRepository(ProcessReport)
    private reportRepository: Repository<ProcessReport>,
    @InjectRepository(WorkOrderDispatch)
    private dispatchRepository: Repository<WorkOrderDispatch>,
    @InjectRepository(ProcessStep)
    private stepRepository: Repository<ProcessStep>,
  ) {}

  /**
   * 生成汇报编号
   * 规则：HB-YYYYMMDD-XXX
   */
  private async generateReportNo(): Promise<string> {
    const today = new Date();
    const dateStr = format(today, 'yyyyMMdd');
    const prefix = `HB${dateStr}`;

    const maxReport = await this.reportRepository
      .createQueryBuilder('report')
      .where('report.report_no LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('report.report_no', 'DESC')
      .select(['report.report_no'])
      .getOne();

    let nextNumber = 1;
    if (maxReport) {
      const lastNo = maxReport.reportNo.slice(-3);
      nextNumber = parseInt(lastNo, 10) + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * 创建工序汇报
   */
  async create(data: CreateProcessReportDto): Promise<ProcessReport> {
    // 验证派工单存在
    const dispatch = await this.dispatchRepository.findOne({ where: { id: data.dispatchId } });
    if (!dispatch) {
      throw new NotFoundException('派工单不存在');
    }

    // 验证工序存在
    const step = await this.stepRepository.findOne({ where: { id: data.stepId } });
    if (!step) {
      throw new NotFoundException('工序不存在');
    }

    // 生成汇报编号
    const reportNo = await this.generateReportNo();

    // 创建汇报
    const report = this.reportRepository.create({
      reportNo,
      dispatchId: data.dispatchId,
      stepId: data.stepId,
      reportDate: new Date(data.reportDate),
      qualifiedQuantity: data.qualifiedQuantity,
      defectiveQuantity: data.defectiveQuantity,
      defectReason: data.defectReason,
      remark: data.remark,
      status: ProcessReportStatus.DRAFT,
    });

    return this.reportRepository.save(report);
  }

  /**
   * 查询工序汇报列表
   */
  async findAll(
    query: QueryProcessReportDto,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: ProcessReport[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.dispatch', 'dispatch')
      .leftJoinAndSelect('report.step', 'step')
      .where('1=1');

    if (query.dispatchId) {
      queryBuilder.andWhere('report.dispatch_id = :dispatchId', { dispatchId: query.dispatchId });
    }
    if (query.stepId) {
      queryBuilder.andWhere('report.step_id = :stepId', { stepId: query.stepId });
    }
    if (query.status) {
      queryBuilder.andWhere('report.status = :status', { status: query.status });
    }
    if (query.startDate) {
      queryBuilder.andWhere('report.report_date >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      queryBuilder.andWhere('report.report_date <= :endDate', { endDate: query.endDate });
    }
    if (query.search) {
      queryBuilder.andWhere('report.report_no LIKE :search', { search: `%${query.search}%` });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('report.created_at', 'DESC')
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * 获取工序汇报详情
   */
  async findOne(id: string): Promise<ProcessReport> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['dispatch', 'step'],
    });
    if (!report) {
      throw new NotFoundException('工序汇报不存在');
    }
    return report;
  }

  /**
   * 更新工序汇报
   */
  async update(id: string, data: UpdateProcessReportDto): Promise<ProcessReport> {
    const report = await this.findOne(id);

    if (report.status !== ProcessReportStatus.DRAFT) {
      throw new BadRequestException('只有草稿状态的汇报允许修改');
    }

    if (data.reportDate) {
      report.reportDate = new Date(data.reportDate);
    }
    if (data.qualifiedQuantity !== undefined) {
      report.qualifiedQuantity = data.qualifiedQuantity;
    }
    if (data.defectiveQuantity !== undefined) {
      report.defectiveQuantity = data.defectiveQuantity;
    }
    if (data.defectReason !== undefined) {
      report.defectReason = data.defectReason;
    }
    if (data.remark !== undefined) {
      report.remark = data.remark;
    }

    return this.reportRepository.save(report);
  }

  /**
   * 删除工序汇报
   */
  async remove(id: string): Promise<void> {
    const report = await this.findOne(id);

    if (report.status !== ProcessReportStatus.DRAFT) {
      throw new BadRequestException('只有草稿状态的汇报允许删除');
    }

    await this.reportRepository.delete(id);
  }

  /**
   * 提交工序汇报
   */
  async submit(id: string): Promise<ProcessReport> {
    const report = await this.findOne(id);

    if (report.status !== ProcessReportStatus.DRAFT) {
      throw new BadRequestException('只有草稿状态的汇报允许提交');
    }

    if (report.qualifiedQuantity <= 0 && report.defectiveQuantity <= 0) {
      throw new BadRequestException('良品数量和不良品数量至少需要录入一个');
    }

    report.status = ProcessReportStatus.SUBMITTED;
    return this.reportRepository.save(report);
  }

  /**
   * 确认工序汇报
   */
  async confirm(id: string): Promise<ProcessReport> {
    const report = await this.findOne(id);

    if (report.status !== ProcessReportStatus.SUBMITTED) {
      throw new BadRequestException('只有已提交的汇报允许确认');
    }

    report.status = ProcessReportStatus.CONFIRMED;
    return this.reportRepository.save(report);
  }
}
