import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { WorkOrderDispatch } from '../entities/work-order-dispatch.entity';
import { DispatchStatus } from '../enums/process-route-status.enum';
import {
  CreateWorkOrderDispatchDto,
  UpdateWorkOrderDispatchDto,
  QueryWorkOrderDispatchDto,
  CompleteDispatchDto,
} from '../dto/work-order-dispatch.dto';
import { CodeGenerator } from '../../../common/utils';

/**
 * 派工服务
 * 负责工序派工的增删改查及状态流转
 */
@Injectable()
export class WorkOrderDispatchService {
  constructor(
    @InjectRepository(WorkOrderDispatch)
    private readonly dispatchRepository: Repository<WorkOrderDispatch>,
  ) {}

  /**
   * 创建派工单
   */
  async create(dto: CreateWorkOrderDispatchDto, userId?: string): Promise<WorkOrderDispatch> {
    // 生成派工单编号
    const dispatchNo = await CodeGenerator.generateOrderNo('PG');

    const dispatch = this.dispatchRepository.create({
      dispatchNo,
      productionOrderId: dto.productionOrderId,
      stepId: dto.stepId,
      quantity: dto.quantity,
      dispatchDate: dto.dispatchDate,
      workerGroup: dto.workerGroup,
      status: DispatchStatus["待派工"],
      goodQuantity: 0,
      defectQuantity: 0,
      notes: dto.notes,
      createdBy: userId,
    });

    const savedDispatch = await this.dispatchRepository.save(dispatch);

    return this.findOne(savedDispatch.id);
  }

  /**
   * 查询派工单列表
   */
  async findAll(query: QueryWorkOrderDispatchDto): Promise<{ list: WorkOrderDispatch[]; total: number }> {
    const where: FindOptionsWhere<WorkOrderDispatch> = {};

    if (query.dispatchNo) {
      where.dispatchNo = query.dispatchNo;
    }
    if (query.productionOrderId) {
      where.productionOrderId = query.productionOrderId;
    }
    if (query.stepId) {
      where.stepId = query.stepId;
    }
    if (query.status) {
      where.status = query.status;
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [list, total] = await this.dispatchRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    return { list, total };
  }

  /**
   * 获取派工单详情
   */
  async findOne(id: string): Promise<WorkOrderDispatch> {
    const dispatch = await this.dispatchRepository.findOne({
      where: { id },
    });

    if (!dispatch) {
      throw new NotFoundException(`派工单不存在: ${id}`);
    }

    return dispatch;
  }

  /**
   * 更新派工单
   */
  async update(id: string, dto: UpdateWorkOrderDispatchDto, userId?: string): Promise<WorkOrderDispatch> {
    const dispatch = await this.findOne(id);

    // 只有待派工状态才能更新
    if (dispatch.status !== DispatchStatus["待派工"]) {
      throw new BadRequestException('只有待派工状态的派工单才能修改');
    }

    await this.dispatchRepository.update(id, {
      ...dto,
      updatedBy: userId,
    });

    return this.findOne(id);
  }

  /**
   * 确认派工
   */
  async dispatch(id: string, userId?: string): Promise<WorkOrderDispatch> {
    const dispatch = await this.findOne(id);

    if (dispatch.status !== DispatchStatus["待派工"]) {
      throw new BadRequestException('只有待派工状态的派工单才能确认派工');
    }

    await this.dispatchRepository.update(id, {
      status: DispatchStatus["已派工"],
      updatedBy: userId,
    });

    return this.findOne(id);
  }

  /**
   * 开始生产
   */
  async start(id: string, userId?: string): Promise<WorkOrderDispatch> {
    const dispatch = await this.findOne(id);

    if (dispatch.status !== DispatchStatus["已派工"]) {
      throw new BadRequestException('只有已派工状态的派工单才能开始生产');
    }

    await this.dispatchRepository.update(id, {
      status: DispatchStatus["生产中"],
      startTime: new Date(),
      updatedBy: userId,
    });

    return this.findOne(id);
  }

  /**
   * 完成生产
   */
  async complete(id: string, dto: CompleteDispatchDto, userId?: string): Promise<WorkOrderDispatch> {
    const dispatch = await this.findOne(id);

    if (dispatch.status !== DispatchStatus["生产中"]) {
      throw new BadRequestException('只有生产中的派工单才能完成生产');
    }

    await this.dispatchRepository.update(id, {
      status: DispatchStatus["已完成"],
      goodQuantity: dto.goodQuantity,
      defectQuantity: dto.defectQuantity || 0,
      actualHours: dto.actualHours,
      endTime: new Date(),
      notes: dto.notes || dispatch.notes,
      updatedBy: userId,
    });

    return this.findOne(id);
  }

  /**
   * 取消派工
   */
  async cancel(id: string, userId?: string): Promise<WorkOrderDispatch> {
    const dispatch = await this.findOne(id);

    if (dispatch.status === DispatchStatus["已完成"]) {
      throw new BadRequestException('已完成的派工单不能取消');
    }

    if (dispatch.status === DispatchStatus["已取消"]) {
      throw new BadRequestException('该派工单已经是取消状态');
    }

    await this.dispatchRepository.update(id, {
      status: DispatchStatus["已取消"],
      updatedBy: userId,
    });

    return this.findOne(id);
  }
}
