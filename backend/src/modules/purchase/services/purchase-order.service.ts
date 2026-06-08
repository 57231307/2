import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, DataSource } from 'typeorm';
import { format } from 'date-fns';
import { PurchaseOrder } from '../entities/purchase-order.entity';
import { PurchaseOrderStatus, ApprovalStatus } from '../enums/purchase-order-status.enum';
import { PurchaseOrderItem } from '../entities/purchase-order-item.entity';
import { Supplier } from '../../base-data/entities/supplier.entity';
import { Product } from '../../product/entities/product.entity';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, QueryPurchaseOrderDto, ApprovePurchaseOrderDto } from '../dto/purchase-order.dto';

/**
 * 采购订单服务
 * 提供采购订单的CRUD和审批功能
 */
@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private purchaseOrderItemRepository: Repository<PurchaseOrderItem>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  /**
   * 生成订单编号
   * 格式：CG-YYYYMMDD-XXXX
   */
  private async generateOrderNo(): Promise<string> {
    const today = new Date();
    const dateStr = format(today, 'yyyyMMdd');
    const prefix = `CG${dateStr}`;

    // 查询当日最大序号
    const maxOrder = await this.purchaseOrderRepository
      .createQueryBuilder('order')
      .where('order.order_no LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('order.order_no', 'DESC')
      .select(['order.order_no'])
      .getOne();

    let nextNumber = 1;
    if (maxOrder) {
      const lastNo = maxOrder.orderNo.slice(-4);
      nextNumber = parseInt(lastNo, 10) + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  /**
   * 创建采购订单
   */
  async create(dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    // 校验供应商
    const supplier = await this.supplierRepository.findOne({ where: { id: dto.supplierId } });
    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }

    // 校验产品并计算金额
    let totalAmount = 0;
    const items: PurchaseOrderItem[] = [];

    for (const itemDto of dto.items) {
      const product = await this.productRepository.findOne({ where: { id: itemDto.productId } });
      if (!product) {
        throw new NotFoundException(`产品不存在: ${itemDto.productId}`);
      }

      const item = this.purchaseOrderItemRepository.create({
        productId: itemDto.productId,
        productName: product.name,
        productCode: product.code,
        colorVariantId: itemDto.colorVariantId,
        colorName: itemDto.colorVariantId ? '自定义颜色' : null,
        quantity: itemDto.quantity,
        unit: itemDto.unit || '米',
        unitPrice: itemDto.unitPrice,
        amount: itemDto.quantity * itemDto.unitPrice,
        remark: itemDto.remark,
      });

      items.push(item);
      totalAmount += itemDto.quantity * itemDto.unitPrice;
    }

    // 生成订单编号
    const orderNo = await this.generateOrderNo();

    // 创建订单
    const order = this.purchaseOrderRepository.create({
      orderNo,
      supplierId: dto.supplierId,
      supplierName: supplier.name,
      orderDate: new Date(dto.orderDate),
      expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : null,
      totalAmount,
      paidAmount: 0,
      status: PurchaseOrderStatus.PENDING,
      approvalStatus: ApprovalStatus.DRAFT,
      contactPerson: dto.contactPerson,
      contactPhone: dto.contactPhone,
      deliveryAddress: dto.deliveryAddress,
      remark: dto.remark,
      items,
    });

    return this.purchaseOrderRepository.save(order);
  }

  /**
   * 查询采购订单列表
   */
  async findAll(
    query: QueryPurchaseOrderDto,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: PurchaseOrder[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.purchaseOrderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .orderBy('order.created_at', 'DESC');

    if (query.search) {
      queryBuilder.andWhere(
        '(order.order_no LIKE :search OR order.supplier_name LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.supplierId) {
      queryBuilder.andWhere('order.supplier_id = :supplierId', { supplierId: query.supplierId });
    }

    if (query.status) {
      queryBuilder.andWhere('order.status = :status', { status: query.status });
    }

    if (query.approvalStatus) {
      queryBuilder.andWhere('order.approval_status = :approvalStatus', { approvalStatus: query.approvalStatus });
    }

    if (query.orderDateFrom) {
      queryBuilder.andWhere('order.order_date >= :orderDateFrom', { orderDateFrom: query.orderDateFrom });
    }

    if (query.orderDateTo) {
      queryBuilder.andWhere('order.order_date <= :orderDateTo', { orderDateTo: query.orderDateTo });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * 获取采购订单详情
   */
  async findOne(id: string): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('采购订单不存在');
    }

    return order;
  }

  /**
   * 更新采购订单
   * 仅允许更新草稿状态的订单
   */
  async update(id: string, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const order = await this.findOne(id);

    // 仅允许更新草稿状态的订单
    if (order.approvalStatus !== ApprovalStatus.DRAFT) {
      throw new BadRequestException('仅允许更新草稿状态的订单');
    }

    // 更新供应商信息
    if (dto.supplierId) {
      const supplier = await this.supplierRepository.findOne({ where: { id: dto.supplierId } });
      if (!supplier) {
        throw new NotFoundException('供应商不存在');
      }
      order.supplierId = dto.supplierId;
      order.supplierName = supplier.name;
    }

    // 更新基本信息
    if (dto.orderDate) {
      order.orderDate = new Date(dto.orderDate);
    }
    if (dto.expectedDate) {
      order.expectedDate = new Date(dto.expectedDate);
    }
    if (dto.contactPerson !== undefined) order.contactPerson = dto.contactPerson;
    if (dto.contactPhone !== undefined) order.contactPhone = dto.contactPhone;
    if (dto.deliveryAddress !== undefined) order.deliveryAddress = dto.deliveryAddress;
    if (dto.remark !== undefined) order.remark = dto.remark;

    // 更新明细
    if (dto.items && dto.items.length > 0) {
      // 删除原有明细
      await this.purchaseOrderItemRepository.delete({ orderId: id });

      // 重新计算总金额
      let totalAmount = 0;
      const items: PurchaseOrderItem[] = [];

      for (const itemDto of dto.items) {
        const product = await this.productRepository.findOne({ where: { id: itemDto.productId } });
        if (!product) {
          throw new NotFoundException(`产品不存在: ${itemDto.productId}`);
        }

        const item = this.purchaseOrderItemRepository.create({
          orderId: id,
          productId: itemDto.productId,
          productName: product.name,
          productCode: product.code,
          colorVariantId: itemDto.colorVariantId,
          colorName: itemDto.colorVariantId ? '自定义颜色' : null,
          quantity: itemDto.quantity,
          unit: itemDto.unit || '米',
          unitPrice: itemDto.unitPrice,
          amount: itemDto.quantity * itemDto.unitPrice,
        });

        items.push(item);
        totalAmount += itemDto.quantity * itemDto.unitPrice;
      }

      order.items = items;
      order.totalAmount = totalAmount;
    }

    return this.purchaseOrderRepository.save(order);
  }

  /**
   * 提交审批
   * 将订单状态从草稿改为待审批
   */
  async submitForApproval(id: string): Promise<PurchaseOrder> {
    const order = await this.findOne(id);

    if (order.approvalStatus !== ApprovalStatus.DRAFT) {
      throw new BadRequestException('仅允许提交草稿状态的订单');
    }

    if (!order.items || order.items.length === 0) {
      throw new BadRequestException('订单必须包含明细');
    }

    order.approvalStatus = ApprovalStatus.PENDING;
    order.status = PurchaseOrderStatus.PENDING;

    return this.purchaseOrderRepository.save(order);
  }

  /**
   * 审批订单
   */
  async approve(id: string, userId: string, dto: ApprovePurchaseOrderDto): Promise<PurchaseOrder> {
    const order = await this.findOne(id);

    if (order.approvalStatus !== ApprovalStatus.PENDING) {
      throw new BadRequestException('仅允许审批待审批状态的订单');
    }

    order.approvalStatus = ApprovalStatus.APPROVED;
    order.approvalStatus = ApprovalStatus.APPROVED;
    order.status = PurchaseOrderStatus.APPROVED;
    order.approverId = userId;
    order.approvalTime = new Date();
    order.approvalRemark = dto.remark;

    return this.purchaseOrderRepository.save(order);
  }

  /**
   * 拒绝审批
   */
  async reject(id: string, userId: string, dto: ApprovePurchaseOrderDto): Promise<PurchaseOrder> {
    const order = await this.findOne(id);

    if (order.approvalStatus !== ApprovalStatus.PENDING) {
      throw new BadRequestException('仅允许拒绝待审批状态的订单');
    }

    order.approvalStatus = ApprovalStatus.REJECTED;
    order.status = PurchaseOrderStatus.CANCELLED;
    order.approverId = userId;
    order.approvalTime = new Date();
    order.approvalRemark = dto.remark;

    return this.purchaseOrderRepository.save(order);
  }

  /**
   * 取消订单
   */
  async cancel(id: string): Promise<PurchaseOrder> {
    const order = await this.findOne(id);

    if (order.status === PurchaseOrderStatus.COMPLETED) {
      throw new BadRequestException('已完成订单不允许取消');
    }

    if (order.status === PurchaseOrderStatus.CANCELLED) {
      throw new BadRequestException('订单已取消');
    }

    order.status = PurchaseOrderStatus.CANCELLED;
    order.approvalStatus = ApprovalStatus.DRAFT;

    return this.purchaseOrderRepository.save(order);
  }

  /**
   * 更新订单状态（当有入库时调用）
   */
  async updateStatusAfterReceipt(id: string): Promise<void> {
    const order = await this.findOne(id);

    // 检查所有明细的入库情况
    const items = await this.purchaseOrderItemRepository.find({ where: { orderId: id } });

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
    }

    await this.purchaseOrderRepository.save(order);
  }

  /**
   * 更新订单明细的已入库数量
   */
  async updateItemReceivedQuantity(orderItemId: string, receivedQuantity: number): Promise<void> {
    const item = await this.purchaseOrderItemRepository.findOne({ where: { id: orderItemId } });
    if (item) {
      item.receivedQuantity = receivedQuantity;
      await this.purchaseOrderItemRepository.save(item);
    }
  }
}
