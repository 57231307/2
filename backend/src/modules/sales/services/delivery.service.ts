import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { DeliveryNote, DeliveryNoteItem, SaleOrder, SaleOrderItem } from '../entities';
import { DeliveryStatus, OrderStatus } from '../enums';
import { CreateDeliveryNoteDto, QueryDeliveryNoteDto, SelectBatchDto } from '../dto';
import { InventoryBatch } from '../../inventory/entities/inventory-batch.entity';

/**
 * 发货服务
 */
@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(DeliveryNote)
    private deliveryNoteRepository: Repository<DeliveryNote>,
    @InjectRepository(DeliveryNoteItem)
    private deliveryNoteItemRepository: Repository<DeliveryNoteItem>,
    @InjectRepository(SaleOrder)
    private saleOrderRepository: Repository<SaleOrder>,
    @InjectRepository(SaleOrderItem)
    private saleOrderItemRepository: Repository<SaleOrderItem>,
    @InjectRepository(InventoryBatch)
    private inventoryBatchRepository: Repository<InventoryBatch>,
    private dataSource: DataSource,
  ) {}

  /**
   * 创建发货单
   */
  async createDeliveryNote(data: CreateDeliveryNoteDto): Promise<DeliveryNote> {
    // 验证订单存在且已审批
    const order = await this.saleOrderRepository.findOne({
      where: { id: data.orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== OrderStatus.APPROVED && order.status !== OrderStatus.IN_PROGRESS) {
      throw new BadRequestException('只有已审批的订单可以发货');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 生成发货单编号
      const noteNo = await this.generateNoteNo();

      // 创建发货单
      const deliveryNote = queryRunner.manager.create(DeliveryNote, {
        noteNo,
        orderId: data.orderId,
        deliveryDate: new Date(data.deliveryDate),
        logisticsCompany: data.logisticsCompany,
        trackingNo: data.trackingNo,
        shipperName: data.shipperName,
        shipperPhone: data.shipperPhone,
        receiverName: data.receiverName || order.receiverName,
        receiverPhone: data.receiverPhone || order.receiverPhone,
        receiverAddress: data.receiverAddress || order.receiverAddress,
        remark: data.remark,
        status: DeliveryStatus.PENDING,
      });

      const savedNote = await queryRunner.manager.save(deliveryNote);

      // 创建发货明细并校验匹号唯一性
      for (const item of data.items) {
        // 检查批次是否存在（根据batchId查询）
        const existingBatch = await this.inventoryBatchRepository.findOne({
          where: { id: item.batchId, rollNo: item.rollNo },
        });

        if (!existingBatch) {
          throw new NotFoundException(`批次${item.batchId}的匹号${item.rollNo}不存在`);
        }

        const deliveryNoteItem = queryRunner.manager.create(DeliveryNoteItem, {
          noteId: savedNote.id,
          orderItemId: item.orderItemId,
          batchId: item.batchId,
          rollNo: item.rollNo,
          quantity: item.quantity,
          unit: item.unit || 'meter',
          remark: item.remark,
        });

        await queryRunner.manager.save(deliveryNoteItem);
      }

      await queryRunner.commitTransaction();
      return this.getDeliveryNoteDetail(savedNote.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 查询发货单列表
   */
  async findDeliveryNotes(
    query: QueryDeliveryNoteDto,
  ): Promise<{ data: DeliveryNote[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, search, orderId, status, startDate, endDate } = query;

    const queryBuilder = this.deliveryNoteRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.items', 'items')
      .leftJoinAndSelect('note.order', 'order')
      .leftJoinAndSelect('order.customer', 'customer')
      .orderBy('note.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      queryBuilder.andWhere(
        '(note.noteNo LIKE :search OR order.orderNo LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (orderId) {
      queryBuilder.andWhere('note.orderId = :orderId', { orderId });
    }

    if (status) {
      queryBuilder.andWhere('note.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('note.deliveryDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('note.deliveryDate <= :endDate', { endDate });
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total, page, limit };
  }

  /**
   * 获取发货单详情
   */
  async getDeliveryNoteDetail(id: string): Promise<DeliveryNote> {
    const note = await this.deliveryNoteRepository.findOne({
      where: { id },
      relations: ['items', 'order', 'order.customer'],
    });

    if (!note) {
      throw new NotFoundException('发货单不存在');
    }

    return note;
  }

  /**
   * 确认发货（扣减库存）
   * 核心业务：匹号唯一性检查 + 库存扣减
   */
  async confirmDelivery(id: string): Promise<DeliveryNote> {
    const note = await this.getDeliveryNoteDetail(id);

    if (note.status !== DeliveryStatus.PENDING) {
      throw new BadRequestException('只有待发货的发货单可以确认');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 遍历每个发货明细，检查库存并扣减
      for (const item of note.items) {
        // 查询批次库存
        const batch = await this.inventoryBatchRepository.findOne({
          where: { id: item.batchId },
        });

        if (!batch) {
          throw new NotFoundException(`批次${item.batchId}不存在`);
        }

        if (batch.quantity < item.quantity) {
          throw new BadRequestException(
            `批次${batch.batchNo}的匹号${item.rollNo}库存不足，当前库存${batch.quantity}，需要${item.quantity}`,
          );
        }

        // 检查匹号是否已被使用（同一缸号内匹号唯一）
        const existingDelivery = await this.deliveryNoteItemRepository
          .createQueryBuilder('item')
          .leftJoin('item.deliveryNote', 'note')
          .where('item.batchId = :batchId', { batchId: item.batchId })
          .andWhere('item.rollNo = :rollNo', { rollNo: item.rollNo })
          .andWhere('note.status = :status', { status: DeliveryStatus.SHIPPED })
          .andWhere('item.id != :excludeId', { excludeId: item.id })
          .getOne();

        if (existingDelivery) {
          throw new BadRequestException(
            `批次${batch.batchNo}的匹号${item.rollNo}已被其他发货单使用`,
          );
        }

        // 扣减库存
        batch.quantity -= item.quantity;
        await queryRunner.manager.save(batch);

        // 更新订单明细的已发货数量
        const orderItem = await this.saleOrderItemRepository.findOne({
          where: { id: item.orderItemId },
        });

        if (orderItem) {
          orderItem.shippedQuantity += item.quantity;
          await queryRunner.manager.save(orderItem);
        }
      }

      // 更新发货单状态
      note.status = DeliveryStatus.SHIPPED;
      note.shippedAt = new Date();
      await queryRunner.manager.save(note);

      // 检查订单是否所有明细都已发货完，更新订单状态
      const order = await this.saleOrderRepository.findOne({
        where: { id: note.orderId },
        relations: ['items'],
      });

      if (order) {
        const allShipped = order.items.every((item) => {
          const shipped = Number(item.shippedQuantity) || 0;
          return shipped >= Number(item.quantity);
        });

        if (allShipped) {
          order.status = OrderStatus.COMPLETED;
        } else {
          order.status = OrderStatus.IN_PROGRESS;
        }

        await queryRunner.manager.save(order);
      }

      await queryRunner.commitTransaction();
      return this.getDeliveryNoteDetail(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取可选批次（用于选择匹号）
   * 根据订单明细获取可选的库存批次
   */
  async getAvailableBatches(orderItemId: string, quantity: number): Promise<InventoryBatch[]> {
    const orderItem = await this.saleOrderItemRepository.findOne({
      where: { id: orderItemId },
    });

    if (!orderItem) {
      throw new NotFoundException('订单明细不存在');
    }

    // 查询该颜色变体在仓库中的批次库存
    const batches = await this.inventoryBatchRepository.find({
      where: {
        colorVariantId: orderItem.colorVariantId,
      },
    });

    // 过滤出有库存的批次
    return batches.filter((batch) => Number(batch.quantity) >= quantity);
  }

  /**
   * 生成发货单编号
   * 格式：DN + 日期(YYYYMMDD) + 序号(4位)
   */
  private async generateNoteNo(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `DN${dateStr}`;

    const count = await this.deliveryNoteRepository.count({
      where: { noteNo: Like(`${prefix}%`) },
    });

    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}${seq}`;
  }
}
