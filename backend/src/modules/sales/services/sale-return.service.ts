import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { SaleReturn, DeliveryNote, DeliveryNoteItem, SaleOrder, SaleOrderItem } from '../entities';
import { InventoryBatch } from '../../inventory/entities/inventory-batch.entity';
import { CreateSaleReturnDto, QuerySaleReturnDto } from '../dto';

/**
 * 销售退货服务
 */
@Injectable()
export class SaleReturnService {
  constructor(
    @InjectRepository(SaleReturn)
    private saleReturnRepository: Repository<SaleReturn>,
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
   * 创建退货单
   */
  async createReturn(data: CreateSaleReturnDto): Promise<SaleReturn> {
    // 验证发货单存在
    const deliveryNote = await this.deliveryNoteRepository.findOne({
      where: { id: data.deliveryNoteId },
    });

    if (!deliveryNote) {
      throw new NotFoundException('发货单不存在');
    }

    const saleReturn = this.saleReturnRepository.create({
      returnNo: await this.generateReturnNo(),
      deliveryNoteId: data.deliveryNoteId,
      orderId: deliveryNote.orderId,
      returnDate: new Date(data.returnDate),
      returnReason: data.returnReason,
      refundAmount: data.refundAmount || 0,
      remark: data.remark,
      returnStatus: 'PROCESSING',
    });

    return this.saleReturnRepository.save(saleReturn);
  }

  /**
   * 查询退货列表
   */
  async findReturns(
    query: QuerySaleReturnDto,
  ): Promise<{ data: SaleReturn[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, search, deliveryNoteId, orderId, returnStatus, startDate, endDate } = query;

    const queryBuilder = this.saleReturnRepository
      .createQueryBuilder('return')
      .leftJoinAndSelect('return.deliveryNote', 'deliveryNote')
      .leftJoinAndSelect('return.order', 'order')
      .leftJoinAndSelect('order.customer', 'customer')
      .orderBy('return.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      queryBuilder.andWhere(
        '(return.returnNo LIKE :search OR order.orderNo LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (deliveryNoteId) {
      queryBuilder.andWhere('return.deliveryNoteId = :deliveryNoteId', { deliveryNoteId });
    }

    if (orderId) {
      queryBuilder.andWhere('return.orderId = :orderId', { orderId });
    }

    if (returnStatus) {
      queryBuilder.andWhere('return.returnStatus = :returnStatus', { returnStatus });
    }

    if (startDate) {
      queryBuilder.andWhere('return.returnDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('return.returnDate <= :endDate', { endDate });
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total, page, limit };
  }

  /**
   * 获取退货详情
   */
  async getReturnDetail(id: string): Promise<SaleReturn> {
    const saleReturn = await this.saleReturnRepository.findOne({
      where: { id },
      relations: ['deliveryNote', 'deliveryNote.items', 'order', 'order.customer'],
    });

    if (!saleReturn) {
      throw new NotFoundException('退货单不存在');
    }

    return saleReturn;
  }

  /**
   * 处理退货（增加库存）
   * 核心业务：库存增加 + 更新订单明细已退货数量
   */
  async processReturn(id: string, processorId: string): Promise<SaleReturn> {
    const saleReturn = await this.getReturnDetail(id);

    if (saleReturn.returnStatus === 'COMPLETED') {
      throw new BadRequestException('退货已处理完成');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 获取发货单明细
      const deliveryNoteItems = await this.deliveryNoteItemRepository.find({
        where: { noteId: saleReturn.deliveryNoteId },
      });

      // 处理每个发货明细对应的退货（这里简化处理，实际应该传入具体退货明细）
      for (const item of deliveryNoteItems) {
        // 查找批次并增加库存
        const batch = await this.inventoryBatchRepository.findOne({
          where: { id: item.batchId },
        });

        if (batch) {
          batch.quantity += item.quantity;
          await queryRunner.manager.save(batch);
        }

        // 更新订单明细的已退货数量
        const orderItem = await this.saleOrderItemRepository.findOne({
          where: { id: item.orderItemId },
        });

        if (orderItem) {
          orderItem.returnedQuantity += item.quantity;
          await queryRunner.manager.save(orderItem);
        }
      }

      // 更新退货单状态
      saleReturn.returnStatus = 'COMPLETED';
      saleReturn.processedAt = new Date();
      saleReturn.processorId = processorId;
      await queryRunner.manager.save(saleReturn);

      await queryRunner.commitTransaction();
      return this.getReturnDetail(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 生成退货单编号
   * 格式：SR + 日期(YYYYMMDD) + 序号(4位)
   */
  private async generateReturnNo(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `SR${dateStr}`;

    const count = await this.saleReturnRepository.count({
      where: { returnNo: Like(`${prefix}%`) },
    });

    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}${seq}`;
  }
}
