import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { format } from 'date-fns';
import { GoodsReceipt } from '../entities/goods-receipt.entity';
import { GoodsReceiptItem } from '../entities/goods-receipt-item.entity';
import { PurchaseOrder } from '../entities/purchase-order.entity';
import { PurchaseOrderItem } from '../entities/purchase-order-item.entity';
import { ReceiptStatus } from '../enums/receipt-status.enum';
import { PurchaseOrderStatus } from '../enums/purchase-order-status.enum';
import { InventoryBatch } from '../../inventory/entities/inventory-batch.entity';
import { BatchSourceType, BatchStatus, QualityStatus } from '../../inventory/enums';
import { Warehouse } from '../../base-data/entities/warehouse.entity';
import { CreateGoodsReceiptDto, CreateGoodsReceiptItemWithRollDto, QueryGoodsReceiptDto, GenerateBatchDto } from '../dto/goods-receipt.dto';

/**
 * 采购入库服务
 * 核心功能：入库生成缸号匹号
 */
@Injectable()
export class GoodsReceiptService {
  constructor(
    @InjectRepository(GoodsReceipt)
    private goodsReceiptRepository: Repository<GoodsReceipt>,
    @InjectRepository(GoodsReceiptItem)
    private goodsReceiptItemRepository: Repository<GoodsReceiptItem>,
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private purchaseOrderItemRepository: Repository<PurchaseOrderItem>,
    @InjectRepository(InventoryBatch)
    private inventoryBatchRepository: Repository<InventoryBatch>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    private dataSource: DataSource,
  ) {}

  /**
   * 生成入库单编号
   * 格式：RK-YYYYMMDD-XXXX
   */
  private async generateReceiptNo(): Promise<string> {
    const today = new Date();
    const dateStr = format(today, 'yyyyMMdd');
    const prefix = `RK${dateStr}`;

    const maxReceipt = await this.goodsReceiptRepository
      .createQueryBuilder('receipt')
      .where('receipt.receipt_no LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('receipt.receipt_no', 'DESC')
      .select(['receipt.receipt_no'])
      .getOne();

    let nextNumber = 1;
    if (maxReceipt) {
      const lastNo = maxReceipt.receiptNo.slice(-4);
      nextNumber = parseInt(lastNo, 10) + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  /**
   * 生成缸号
   * 格式：GD-YYYYMMDD-XXX
   */
  private async generateBatchNo(productId: string, colorVariantId?: string): Promise<string> {
    const today = new Date();
    const dateStr = format(today, 'yyyyMMdd');
    const prefix = `GD${dateStr}`;

    const queryBuilder = this.inventoryBatchRepository
      .createQueryBuilder('batch')
      .where('batch.product_id = :productId', { productId })
      .andWhere('batch.batch_no LIKE :prefix', { prefix: `${prefix}%` });

    if (colorVariantId) {
      queryBuilder.andWhere('batch.color_variant_id = :colorVariantId', { colorVariantId });
    }

    queryBuilder.orderBy('batch.batch_no', 'DESC').select(['batch.batch_no']);

    const maxBatch = await queryBuilder.getOne();

    let nextNumber = 1;
    if (maxBatch) {
      const lastNo = maxBatch.batchNo.slice(-3);
      nextNumber = parseInt(lastNo, 10) + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * 生成匹号
   * 格式：P-XXX
   */
  private async generateRollNo(batchNo: string): Promise<string> {
    const maxRoll = await this.inventoryBatchRepository
      .createQueryBuilder('batch')
      .where('batch.batch_no = :batchNo', { batchNo })
      .orderBy('batch.roll_no', 'DESC')
      .select(['batch.roll_no'])
      .getOne();

    let nextNumber = 1;
    if (maxRoll) {
      const currentNo = parseInt(maxRoll.rollNo.replace('P', ''), 10);
      nextNumber = currentNo + 1;
    }

    return `P${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * 创建入库单
   */
  async createReceipt(dto: CreateGoodsReceiptDto): Promise<GoodsReceipt> {
    // 校验采购订单
    const order = await this.purchaseOrderRepository.findOne({
      where: { id: dto.orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('采购订单不存在');
    }

    if (order.status === PurchaseOrderStatus.CANCELLED) {
      throw new BadRequestException('采购订单已取消');
    }

    if (order.approvalStatus !== 'APPROVED') {
      throw new BadRequestException('采购订单未审批通过');
    }

    // 校验仓库
    const warehouse = await this.warehouseRepository.findOne({ where: { id: dto.warehouseId } });
    if (!warehouse) {
      throw new NotFoundException('仓库不存在');
    }

    // 生成入库单编号
    const receiptNo = await this.generateReceiptNo();

    // 创建入库单
    const receipt = this.goodsReceiptRepository.create({
      receiptNo,
      orderId: dto.orderId,
      orderNo: order.orderNo,
      supplierId: order.supplierId,
      supplierName: order.supplierName,
      receiptDate: new Date(dto.receiptDate),
      warehouseId: dto.warehouseId,
      warehouseName: warehouse.name,
      receiptType: dto.receiptType || 'PURCHASE',
      handlerId: dto.handlerId,
      handlerName: dto.handlerName,
      status: ReceiptStatus.PENDING,
      remark: dto.remark,
    });

    const savedReceipt = await this.goodsReceiptRepository.save(receipt);

    // 创建入库明细
    if (dto.items && dto.items.length > 0) {
      const items: GoodsReceiptItem[] = [];
      let totalQuantity = 0;

      for (const itemDto of dto.items) {
        const orderItem = order.items.find((i) => i.id === itemDto.orderItemId);
        if (!orderItem) {
          throw new NotFoundException(`采购订单明细不存在: ${itemDto.orderItemId}`);
        }

        const item = this.goodsReceiptItemRepository.create({
          receiptId: savedReceipt.id,
          orderItemId: itemDto.orderItemId,
          productId: itemDto.productId,
          productName: orderItem.productName,
          colorVariantId: itemDto.colorVariantId,
          colorName: orderItem.colorName,
          quantity: itemDto.quantity,
          qualifiedQuantity: 0,
          unqualifiedQuantity: 0,
          unit: itemDto.unit || orderItem.unit,
          unitPrice: itemDto.unitPrice || orderItem.unitPrice,
          warehouseId: dto.warehouseId,
          batchGenerated: false,
        });

        items.push(item);
        totalQuantity += itemDto.quantity;
      }

      savedReceipt.items = items;
      savedReceipt.totalQuantity = totalQuantity;
      await this.goodsReceiptRepository.save(savedReceipt);
    }

    return savedReceipt;
  }

  /**
   * 查询入库单列表
   */
  async findReceipts(
    query: QueryGoodsReceiptDto,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: GoodsReceipt[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.goodsReceiptRepository
      .createQueryBuilder('receipt')
      .leftJoinAndSelect('receipt.items', 'items')
      .orderBy('receipt.created_at', 'DESC');

    if (query.search) {
      queryBuilder.andWhere(
        '(receipt.receipt_no LIKE :search OR receipt.order_no LIKE :search OR receipt.supplier_name LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.orderId) {
      queryBuilder.andWhere('receipt.order_id = :orderId', { orderId: query.orderId });
    }

    if (query.supplierId) {
      queryBuilder.andWhere('receipt.supplier_id = :supplierId', { supplierId: query.supplierId });
    }

    if (query.warehouseId) {
      queryBuilder.andWhere('receipt.warehouse_id = :warehouseId', { warehouseId: query.warehouseId });
    }

    if (query.status) {
      queryBuilder.andWhere('receipt.status = :status', { status: query.status });
    }

    if (query.receiptDateFrom) {
      queryBuilder.andWhere('receipt.receipt_date >= :receiptDateFrom', { receiptDateFrom: query.receiptDateFrom });
    }

    if (query.receiptDateTo) {
      queryBuilder.andWhere('receipt.receipt_date <= :receiptDateTo', { receiptDateTo: query.receiptDateTo });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * 获取入库单详情
   */
  async findReceiptById(id: string): Promise<GoodsReceipt> {
    const receipt = await this.goodsReceiptRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!receipt) {
      throw new NotFoundException('入库单不存在');
    }

    return receipt;
  }

  /**
   * 添加入库明细（包含匹号）- 核心功能
   */
  async addItemWithRoll(id: string, dto: CreateGoodsReceiptItemWithRollDto): Promise<GoodsReceiptItem> {
    const receipt = await this.findReceiptById(id);

    if (receipt.status !== ReceiptStatus.PENDING) {
      throw new BadRequestException('仅允许对待确认状态的入库单添加入库明细');
    }

    // 校验采购订单明细
    const orderItem = await this.purchaseOrderItemRepository.findOne({ where: { id: dto.orderItemId } });
    if (!orderItem) {
      throw new NotFoundException('采购订单明细不存在');
    }

    // 创建入库明细
    const item = this.goodsReceiptItemRepository.create({
      receiptId: id,
      orderItemId: dto.orderItemId,
      productId: dto.productId,
      productName: orderItem.productName,
      colorVariantId: dto.colorVariantId,
      colorName: orderItem.colorName,
      quantity: dto.quantity,
      qualifiedQuantity: 0,
      unqualifiedQuantity: 0,
      unit: dto.unit || orderItem.unit,
      unitPrice: dto.unitPrice || orderItem.unitPrice,
      warehouseId: receipt.warehouseId,
      batchGenerated: false,
    });

    const savedItem = await this.goodsReceiptItemRepository.save(item);

    // 更新入库单总数量
    await this.updateReceiptTotalQuantity(id);

    return savedItem;
  }

  /**
   * 为入库项生成缸号匹号 - 核心功能！
   * 每入库一匹布，生成一个批次记录
   */
  async generateBatchForItem(itemId: string, locationCode?: string, gramWeight?: number, width?: number): Promise<InventoryBatch> {
    const item = await this.goodsReceiptItemRepository.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException('入库明细不存在');
    }

    if (item.batchGenerated) {
      throw new BadRequestException('该入库明细已生成批次');
    }

    // 生成缸号（按产品+颜色生成）
    const batchNo = await this.generateBatchNo(item.productId, item.colorVariantId);

    // 生成匹号（同一缸号内递增）
    const rollNo = await this.generateRollNo(batchNo);

    // 创建批次记录
    const batch = this.inventoryBatchRepository.create({
      batchNo,
      rollNo,
      productId: item.productId,
      colorVariantId: item.colorVariantId,
      warehouseId: item.warehouseId,
      locationCode,
      quantity: item.quantity,
      unit: item.unit,
      productionDate: new Date(),
      sourceType: BatchSourceType.PURCHASE,
      sourceId: item.receiptId,
      sourceNo: '',
      qualityStatus: QualityStatus.PASSED,
      gramWeight,
      width,
      status: BatchStatus.ACTIVE,
    });

    const savedBatch = await this.inventoryBatchRepository.save(batch);

    // 更新入库明细的缸号匹号
    item.batchNo = batchNo;
    item.rollNo = rollNo;
    item.batchGenerated = true;
    await this.goodsReceiptItemRepository.save(item);

    return savedBatch;
  }

  /**
   * 批量生成批次（为入库单的所有明细生成批次）
   */
  async generateBatchesForReceipt(receiptId: string, dto: GenerateBatchDto): Promise<InventoryBatch[]> {
    const receipt = await this.findReceiptById(receiptId);

    if (receipt.status !== ReceiptStatus.PENDING) {
      throw new BadRequestException('仅允许对待确认状态的入库单生成批次');
    }

    // 获取需要生成批次的明细
    let items: GoodsReceiptItem[];
    if (dto.itemIds && dto.itemIds.length > 0) {
      items = await this.goodsReceiptItemRepository.find({
        where: { receiptId, id: dto.itemIds as any },
      });
    } else {
      items = await this.goodsReceiptItemRepository.find({
        where: { receiptId, batchGenerated: false },
      });
    }

    if (items.length === 0) {
      throw new BadRequestException('没有需要生成批次的入库明细');
    }

    const batches: InventoryBatch[] = [];

    // 按产品+颜色分组，同组使用同一个缸号
    const groupedItems = new Map<string, GoodsReceiptItem[]>();
    for (const item of items) {
      const key = `${item.productId}-${item.colorVariantId || 'default'}`;
      if (!groupedItems.has(key)) {
        groupedItems.set(key, []);
      }
      groupedItems.get(key)!.push(item);
    }

    // 为每组生成缸号
    for (const [key, groupItems] of groupedItems) {
      // 生成缸号
      const firstItem = groupItems[0];
      const batchNo = await this.generateBatchNo(firstItem.productId, firstItem.colorVariantId);

      for (const item of groupItems) {
        // 生成匹号
        const rollNo = await this.generateRollNo(batchNo);

        // 创建批次
        const batch = this.inventoryBatchRepository.create({
          batchNo,
          rollNo,
          productId: item.productId,
          colorVariantId: item.colorVariantId,
          warehouseId: item.warehouseId,
          quantity: item.quantity,
          unit: item.unit,
          productionDate: new Date(),
          sourceType: BatchSourceType.PURCHASE,
          sourceId: receiptId,
          sourceNo: receipt.receiptNo,
          qualityStatus: QualityStatus.PASSED,
          status: BatchStatus.ACTIVE,
        });

        const savedBatch = await this.inventoryBatchRepository.save(batch);
        batches.push(savedBatch);

        // 更新入库明细
        item.batchNo = batchNo;
        item.rollNo = rollNo;
        item.batchGenerated = true;
        await this.goodsReceiptItemRepository.save(item);
      }
    }

    return batches;
  }

  /**
   * 确认入库
   * 生成批次后确认入库，更新库存
   */
  async confirmReceipt(id: string): Promise<GoodsReceipt> {
    const receipt = await this.findReceiptById(id);

    if (receipt.status !== ReceiptStatus.PENDING) {
      throw new BadRequestException('仅允许确认待确认状态的入库单');
    }

    // 检查是否所有明细都已生成批次
    const items = await this.goodsReceiptItemRepository.find({ where: { receiptId: id } });
    const unGeneratedItems = items.filter((item) => !item.batchGenerated);

    if (unGeneratedItems.length > 0) {
      throw new BadRequestException(`还有 ${unGeneratedItems.length} 条入库明细未生成批次`);
    }

    // 更新入库单状态
    receipt.status = ReceiptStatus.QUALIFIED;
    const savedReceipt = await this.goodsReceiptRepository.save(receipt);

    // 更新采购订单的已入库数量
    for (const item of items) {
      await this.purchaseOrderItemRepository.query(
        `UPDATE purchase_order_items 
         SET received_quantity = received_quantity + $1 
         WHERE id = $2`,
        [item.quantity, item.orderItemId],
      );
    }

    // 更新采购订单状态
    await this.updatePurchaseOrderStatus(receipt.orderId);

    return savedReceipt;
  }

  /**
   * 更新采购订单状态
   */
  private async updatePurchaseOrderStatus(orderId: string): Promise<void> {
    const order = await this.purchaseOrderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) return;

    const items = await this.purchaseOrderItemRepository.find({ where: { orderId } });

    let allReceived = true;
    let partialReceived = false;

    for (const item of items) {
      if (item.receivedQuantity >= item.quantity) {
        // 完全入库
      } else if (item.receivedQuantity > 0) {
        partialReceived = true;
      } else {
        allReceived = false;
      }
    }

    if (allReceived) {
      order.status = PurchaseOrderStatus.COMPLETED;
    } else if (partialReceived) {
      order.status = PurchaseOrderStatus.IN_PROGRESS;
    } else {
      order.status = PurchaseOrderStatus.APPROVED;
    }

    await this.purchaseOrderRepository.save(order);
  }

  /**
   * 更新入库单总数量
   */
  private async updateReceiptTotalQuantity(receiptId: string): Promise<void> {
    const result = await this.goodsReceiptItemRepository
      .createQueryBuilder('item')
      .select('SUM(item.quantity)', 'total')
      .where('item.receipt_id = :receiptId', { receiptId })
      .getRawOne();

    await this.goodsReceiptRepository.update(receiptId, {
      totalQuantity: parseFloat(result.total) || 0,
    });
  }

  /**
   * 批次追溯 - 根据批次ID追溯来源
   */
  async traceBatchSource(batchId: string): Promise<any> {
    const batch = await this.inventoryBatchRepository.findOne({ where: { id: batchId } });
    if (!batch) {
      throw new NotFoundException('批次不存在');
    }

    if (batch.sourceType !== BatchSourceType.PURCHASE) {
      throw new BadRequestException('该批次不是采购来源');
    }

    const receipt = await this.findReceiptById(batch.sourceId);

    return {
      batch: {
        id: batch.id,
        batchNo: batch.batchNo,
        rollNo: batch.rollNo,
        productId: batch.productId,
        colorVariantId: batch.colorVariantId,
        quantity: batch.quantity,
        qualityStatus: batch.qualityStatus,
      },
      goodsReceipt: {
        id: receipt.id,
        receiptNo: receipt.receiptNo,
        receiptDate: receipt.receiptDate,
        supplierName: receipt.supplierName,
        warehouseName: receipt.warehouseName,
      },
      purchaseOrder: {
        id: receipt.orderId,
        orderNo: receipt.orderNo,
      },
    };
  }
}
