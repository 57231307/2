import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { format } from 'date-fns';
import { InventoryTransfer, TransferStatus } from '../entities/inventory-transfer.entity';
import { InventoryTransferItem } from '../entities/inventory-transfer-item.entity';
import { InventoryBatch } from '../entities/inventory-batch.entity';
import { BatchStatus } from '../enums/batch-status.enum';
import { Warehouse } from '../entities/warehouse.entity';
import { CreateTransferDto, QueryTransferDto, CancelTransferDto, TransferResponseDto, TransferItemResponseDto } from '../dto/inventory-transfer.dto';

/**
 * 库存调拨服务
 * 提供调拨单的完整生命周期管理
 */
@Injectable()
export class InventoryTransferService {
  constructor(
    @InjectRepository(InventoryTransfer)
    private transferRepository: Repository<InventoryTransfer>,
    @InjectRepository(InventoryTransferItem)
    private transferItemRepository: Repository<InventoryTransferItem>,
    @InjectRepository(InventoryBatch)
    private batchRepository: Repository<InventoryBatch>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
  ) {}

  /**
   * 创建调拨单
   */
  async create(data: CreateTransferDto): Promise<InventoryTransfer> {
    // 验证源仓库存在
    const sourceWarehouse = await this.warehouseRepository.findOne({
      where: { id: data.sourceWarehouseId },
    });
    if (!sourceWarehouse) {
      throw new NotFoundException('源仓库不存在');
    }

    // 验证目标仓库存在
    const targetWarehouse = await this.warehouseRepository.findOne({
      where: { id: data.targetWarehouseId },
    });
    if (!targetWarehouse) {
      throw new NotFoundException('目标仓库不存在');
    }

    // 生成调拨单号
    const transferNo = await this.generateTransferNo();

    // 创建调拨单
    const transfer = this.transferRepository.create({
      transferNo,
      sourceWarehouseId: data.sourceWarehouseId,
      targetWarehouseId: data.targetWarehouseId,
      transferDate: data.transferDate ? new Date(data.transferDate) : new Date(),
      managerId: data.managerId,
      managerName: data.managerName,
      remark: data.remark,
      status: TransferStatus.PENDING,
    });

    const savedTransfer = await this.transferRepository.save(transfer);

    // 创建调拨明细
    for (const item of data.items) {
      // 验证批次存在
      const batch = await this.batchRepository.findOne({ where: { id: item.batchId } });
      if (!batch) {
        throw new NotFoundException(`批次 ${item.batchId} 不存在`);
      }

      // 验证批次在源仓库中
      if (batch.warehouseId !== data.sourceWarehouseId) {
        throw new BadRequestException(`批次不在源仓库中`);
      }

      // 验证库存足够
      if (batch.quantity < item.quantity) {
        throw new BadRequestException(`批次 ${batch.batchNo} 库存不足`);
      }

      const transferItem = this.transferItemRepository.create({
        transferId: savedTransfer.id,
        batchId: batch.id,
        batchNo: batch.batchNo,
        rollNo: batch.rollNo,
        colorVariantId: batch.colorVariantId,
        transferQuantity: item.quantity,
        unit: batch.unit,
        dispatchedQuantity: 0,
        receivedQuantity: 0,
        targetWarehouseId: data.targetWarehouseId,
      });

      await this.transferItemRepository.save(transferItem);
    }

    return this.findOne(savedTransfer.id);
  }

  /**
   * 查询调拨单列表
   */
  async findAll(
    query: QueryTransferDto,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: InventoryTransfer[]; total: number; page: number; limit: number }> {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.warehouseId) {
      where.sourceWarehouseId = query.warehouseId;
    }

    if (query.startDate || query.endDate) {
      where.transferDate = {};
      if (query.startDate) {
        where.transferDate.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.transferDate.lte = new Date(query.endDate);
      }
    }

    const [data, total] = await this.transferRepository.findAndCount({
      where,
      relations: ['sourceWarehouse', 'targetWarehouse'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * 获取调拨单详情
   */
  async findOne(id: string): Promise<InventoryTransfer> {
    const transfer = await this.transferRepository.findOne({
      where: { id },
      relations: ['sourceWarehouse', 'targetWarehouse', 'items'],
    });

    if (!transfer) {
      throw new NotFoundException('调拨单不存在');
    }

    return transfer;
  }

  /**
   * 调出确认
   * 扣减源仓库的批次库存
   */
  async dispatch(id: string, operator?: string, remark?: string): Promise<InventoryTransfer> {
    const transfer = await this.findOne(id);

    if (transfer.status !== TransferStatus.PENDING) {
      throw new BadRequestException('调拨单状态不允许调出');
    }

    // 扣减源仓库的批次库存
    for (const item of transfer.items) {
      const batch = await this.batchRepository.findOne({ where: { id: item.batchId } });

      if (!batch) {
        throw new NotFoundException(`批次 ${item.batchId} 不存在`);
      }

      if (batch.quantity < item.transferQuantity) {
        throw new BadRequestException(`批次 ${batch.batchNo} 库存不足`);
      }

      // 扣减库存
      batch.quantity = Number(batch.quantity) - Number(item.transferQuantity);
      await this.batchRepository.save(batch);

      // 更新明细的已调出数量
      item.dispatchedQuantity = item.transferQuantity;
      await this.transferItemRepository.save(item);
    }

    // 更新调拨单状态
    transfer.status = TransferStatus.DISPATCHED;
    transfer.dispatchTime = new Date();
    transfer.dispatcher = operator;

    if (remark) {
      transfer.remark = transfer.remark ? `${transfer.remark}\n${remark}` : remark;
    }

    return this.transferRepository.save(transfer);
  }

  /**
   * 调入确认
   * 在目标仓库创建新批次
   */
  async receive(id: string, operator?: string, remark?: string): Promise<InventoryTransfer> {
    const transfer = await this.findOne(id);

    if (transfer.status !== TransferStatus.DISPATCHED) {
      throw new BadRequestException('调拨单状态不允许收货');
    }

    // 在目标仓库创建新批次
    for (const item of transfer.items) {
      // 获取原始批次信息
      const sourceBatch = await this.batchRepository.findOne({ where: { id: item.batchId } });

      if (!sourceBatch) {
        throw new NotFoundException(`批次 ${item.batchId} 不存在`);
      }

      // 创建新批次（复制源批次信息，但更改仓库和数量）
      const newBatch = this.batchRepository.create({
        batchNo: sourceBatch.batchNo,
        rollNo: sourceBatch.rollNo,
        productId: sourceBatch.productId,
        colorVariantId: sourceBatch.colorVariantId,
        warehouseId: transfer.targetWarehouseId,
        locationCode: null,
        quantity: item.transferQuantity,
        unit: sourceBatch.unit,
        productionDate: sourceBatch.productionDate,
        sourceType: sourceBatch.sourceType,
        sourceId: transfer.id,
        sourceNo: transfer.transferNo,
        qualityStatus: sourceBatch.qualityStatus,
        status: BatchStatus.ACTIVE,
        gramWeight: sourceBatch.gramWeight,
        width: sourceBatch.width,
        expiryDate: sourceBatch.expiryDate,
        remark: `调拨自 ${transfer.sourceWarehouse?.name || transfer.sourceWarehouseId}`,
      });

      await this.batchRepository.save(newBatch);

      // 更新明细的已收货数量
      item.receivedQuantity = item.transferQuantity;
      await this.transferItemRepository.save(item);
    }

    // 更新调拨单状态
    transfer.status = TransferStatus.RECEIVED;
    transfer.receiveTime = new Date();
    transfer.receiver = operator;

    if (remark) {
      transfer.remark = transfer.remark ? `${transfer.remark}\n${remark}` : remark;
    }

    return this.transferRepository.save(transfer);
  }

  /**
   * 取消调拨单
   */
  async cancel(id: string, data: CancelTransferDto): Promise<InventoryTransfer> {
    const transfer = await this.findOne(id);

    if (![TransferStatus.PENDING, TransferStatus.PARTIAL].includes(transfer.status)) {
      throw new BadRequestException('调拨单状态不允许取消');
    }

    // 如果有已调出的批次，需要还原库存
    for (const item of transfer.items) {
      if (item.dispatchedQuantity > 0) {
        const batch = await this.batchRepository.findOne({ where: { id: item.batchId } });
        if (batch) {
          batch.quantity = Number(batch.quantity) + Number(item.dispatchedQuantity);
          await this.batchRepository.save(batch);
        }
      }
    }

    // 更新调拨单状态
    transfer.status = TransferStatus.CANCELLED;
    transfer.cancelReason = data.cancelReason;

    if (data.remark) {
      transfer.remark = transfer.remark ? `${transfer.remark}\n${data.remark}` : data.remark;
    }

    return this.transferRepository.save(transfer);
  }

  /**
   * 生成调拨单号
   * 格式：DB-YYYYMMDD-XXXX
   */
  private async generateTransferNo(): Promise<string> {
    const today = new Date();
    const dateStr = format(today, 'yyyyMMdd');
    const prefix = `DB${dateStr}`;

    // 查询当日最大序号
    const maxTransfer = await this.transferRepository
      .createQueryBuilder('transfer')
      .where('transfer.transfer_no LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('transfer.transfer_no', 'DESC')
      .select(['transfer.transferNo'])
      .getOne();

    let nextNumber = 1;
    if (maxTransfer) {
      const lastNo = maxTransfer.transferNo.slice(-4);
      nextNumber = parseInt(lastNo, 10) + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }
}
