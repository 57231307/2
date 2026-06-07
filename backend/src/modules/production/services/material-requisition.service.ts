import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { MaterialRequisition } from '../entities/material-requisition.entity';
import { MaterialRequisitionItem } from '../entities/material-requisition-item.entity';
import { InventoryBatch } from '../../inventory/entities/inventory-batch.entity';
import { RequisitionStatus } from '../enums/requisition-status.enum';
import { CreateMaterialRequisitionDto, AddRequisitionItemDto, ConfirmRequisitionDto, QueryMaterialRequisitionDto } from '../dto/material-requisition.dto';
import { CodeGenerator } from '../../../common/utils';

/**
 * 领料单服务
 * 负责领料单的增删改查及确认领料（扣减库存）
 */
@Injectable()
export class MaterialRequisitionService {
  constructor(
    @InjectRepository(MaterialRequisition)
    private readonly requisitionRepository: Repository<MaterialRequisition>,
    @InjectRepository(MaterialRequisitionItem)
    private readonly requisitionItemRepository: Repository<MaterialRequisitionItem>,
    @InjectRepository(InventoryBatch)
    private readonly batchRepository: Repository<InventoryBatch>,
  ) {}

  /**
   * 创建领料单
   */
  async createRequisition(dto: CreateMaterialRequisitionDto, userId?: string): Promise<MaterialRequisition> {
    const requisitionNo = await CodeGenerator.generateOrderNo('LL');

    const requisition = this.requisitionRepository.create({
      requisitionNo,
      productionOrderId: dto.productionOrderId,
      requisitionDate: dto.requisitionDate,
      warehouseId: dto.warehouseId,
      requesterName: dto.requesterName,
      remark: dto.remark,
      status: RequisitionStatus.PENDING,
      createdBy: userId,
    });

    const savedRequisition = await this.requisitionRepository.save(requisition);

    // 保存领料明细
    if (dto.items && dto.items.length > 0) {
      const items = dto.items.map((item) =>
        this.requisitionItemRepository.create({
          ...item,
          requisitionId: savedRequisition.id,
          unit: item.unit || 'meter',
          createdBy: userId,
        }),
      );
      await this.requisitionItemRepository.save(items);
    }

    return this.findOne(savedRequisition.id);
  }

  /**
   * 查询领料单列表
   */
  async findRequisitions(query: QueryMaterialRequisitionDto): Promise<{ list: MaterialRequisition[]; total: number }> {
    const where: FindOptionsWhere<MaterialRequisition> = {};

    if (query.requisitionNo) {
      where.requisitionNo = query.requisitionNo;
    }
    if (query.productionOrderId) {
      where.productionOrderId = query.productionOrderId;
    }
    if (query.warehouseId) {
      where.warehouseId = query.warehouseId;
    }
    if (query.status) {
      where.status = query.status;
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [list, total] = await this.requisitionRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
      relations: ['items'],
    });

    return { list, total };
  }

  /**
   * 获取领料单详情
   */
  async findOne(id: string): Promise<MaterialRequisition> {
    const requisition = await this.requisitionRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!requisition) {
      throw new NotFoundException(`领料单不存在: ${id}`);
    }

    return requisition;
  }

  /**
   * 添加领料明细
   */
  async addRequisitionItem(id: string, dto: AddRequisitionItemDto, userId?: string): Promise<MaterialRequisition> {
    const requisition = await this.findOne(id);

    if (requisition.status !== RequisitionStatus.PENDING) {
      throw new BadRequestException('只有待领料状态的领料单才能添加明细');
    }

    const item = this.requisitionItemRepository.create({
      ...dto,
      requisitionId: requisition.id,
      unit: dto.unit || 'meter',
      createdBy: userId,
    });

    await this.requisitionItemRepository.save(item);

    return this.findOne(id);
  }

  /**
   * 确认领料 - 扣减批次库存
   */
  async confirmIssue(id: string, dto: ConfirmRequisitionDto, userId?: string): Promise<MaterialRequisition> {
    const requisition = await this.findOne(id);

    if (requisition.status !== RequisitionStatus.PENDING) {
      throw new BadRequestException('只有待领料状态的领料单才能确认领料');
    }

    // 扣减每个明细项对应的批次库存
    for (const item of requisition.items) {
      if (item.batchId) {
        const batch = await this.batchRepository.findOne({ where: { id: item.batchId } });
        if (!batch) {
          throw new NotFoundException(`批次不存在: ${item.batchId}`);
        }

        // 扣减库存
        const newQuantity = Number(batch.quantity) - Number(item.requestedQuantity);
        if (newQuantity < 0) {
          throw new BadRequestException(`批次 ${batch.batchNo} 库存不足`);
        }

        await this.batchRepository.update(item.batchId, {
          quantity: newQuantity,
          updatedBy: userId,
        });

        // 更新已发料数量
        await this.requisitionItemRepository.update(item.id, {
          issuedQuantity: item.requestedQuantity,
          updatedBy: userId,
        });
      }
    }

    // 更新领料单状态
    await this.requisitionRepository.update(id, {
      status: RequisitionStatus.ISSUED,
      approverName: dto.approverName,
      approvedAt: new Date(),
      updatedBy: userId,
    });

    return this.findOne(id);
  }

  /**
   * 取消领料单
   */
  async cancelRequisition(id: string, userId?: string): Promise<MaterialRequisition> {
    const requisition = await this.findOne(id);

    if (requisition.status === RequisitionStatus.ISSUED) {
      throw new BadRequestException('已领料的领料单不能取消');
    }

    await this.requisitionRepository.update(id, {
      status: RequisitionStatus.PENDING,
      updatedBy: userId,
    });

    return this.findOne(id);
  }
}
