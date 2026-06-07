import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, Like } from 'typeorm';
import { SaleOrder, SaleOrderItem } from '../entities';
import { OrderStatus, ApprovalStatus } from '../enums';
import { CreateSaleOrderDto, UpdateSaleOrderDto, QuerySaleOrderDto, ApprovalDto } from '../dto';
import { ProductColorVariant } from '../../product/entities/product-color-variant.entity';

/**
 * 销售订单服务
 */
@Injectable()
export class SaleOrderService {
  constructor(
    @InjectRepository(SaleOrder)
    private saleOrderRepository: Repository<SaleOrder>,
    @InjectRepository(SaleOrderItem)
    private saleOrderItemRepository: Repository<SaleOrderItem>,
    @InjectRepository(ProductColorVariant)
    private colorVariantRepository: Repository<ProductColorVariant>,
    private dataSource: DataSource,
  ) {}

  /**
   * 创建销售订单
   */
  async create(data: CreateSaleOrderDto): Promise<SaleOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 生成订单编号
      const orderNo = await this.generateOrderNo();

      // 计算订单总金额
      let totalAmount = 0;
      const itemsData: any[] = [];

      for (const item of data.items) {
        // 获取颜色变体价格
        const colorVariant = await this.colorVariantRepository.findOne({
          where: { id: item.colorVariantId },
        });

        if (!colorVariant) {
          throw new NotFoundException(`颜色变体${item.colorVariantId}不存在`);
        }

        const unitPrice = item.unitPrice || colorVariant.salePrice;
        const amount = unitPrice * item.quantity;
        totalAmount += amount;

        itemsData.push({
          productId: item.productId,
          colorVariantId: item.colorVariantId,
          quantity: item.quantity,
          unit: item.unit || 'meter',
          unitPrice,
          amount,
          remark: item.remark,
        });
      }

      // 创建订单
      const order = queryRunner.manager.create(SaleOrder, {
        orderNo,
        customerId: data.customerId,
        orderDate: new Date(data.orderDate),
        expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null,
        totalAmount,
        salespersonId: data.salespersonId,
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
        receiverAddress: data.receiverAddress,
        remark: data.remark,
        status: OrderStatus.PENDING,
        approvalStatus: ApprovalStatus.PENDING,
      });

      const savedOrder = await queryRunner.manager.save(order);

      // 创建订单明细
      for (const itemData of itemsData) {
        const item = queryRunner.manager.create(SaleOrderItem, {
          ...itemData,
          orderId: savedOrder.id,
        });
        await queryRunner.manager.save(item);
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 查询订单列表
   */
  async findAll(query: QuerySaleOrderDto): Promise<{ data: SaleOrder[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, search, customerId, status, approvalStatus, startDate, endDate } = query;

    const queryBuilder = this.saleOrderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.customer', 'customer')
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      queryBuilder.andWhere(
        '(order.orderNo LIKE :search OR customer.name LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (customerId) {
      queryBuilder.andWhere('order.customerId = :customerId', { customerId });
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (approvalStatus) {
      queryBuilder.andWhere('order.approvalStatus = :approvalStatus', { approvalStatus });
    }

    if (startDate) {
      queryBuilder.andWhere('order.orderDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('order.orderDate <= :endDate', { endDate });
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total, page, limit };
  }

  /**
   * 获取订单详情
   */
  async findOne(id: string): Promise<SaleOrder> {
    const order = await this.saleOrderRepository.findOne({
      where: { id },
      relations: ['items', 'customer'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  /**
   * 更新订单
   * 注意：已审批的订单不允许修改
   */
  async update(id: string, data: UpdateSaleOrderDto): Promise<SaleOrder> {
    const order = await this.findOne(id);

    if (order.approvalStatus === ApprovalStatus.APPROVED) {
      throw new BadRequestException('已审批的订单不允许修改');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('只有待处理的订单可以修改');
    }

    // 更新订单基本信息
    if (data.expectedDeliveryDate) {
      order.expectedDeliveryDate = new Date(data.expectedDeliveryDate);
    }
    if (data.receiverName !== undefined) order.receiverName = data.receiverName;
    if (data.receiverPhone !== undefined) order.receiverPhone = data.receiverPhone;
    if (data.receiverAddress !== undefined) order.receiverAddress = data.receiverAddress;
    if (data.remark !== undefined) order.remark = data.remark;

    // 如果有更新明细
    if (data.items && data.items.length > 0) {
      // 删除旧明细
      await this.saleOrderItemRepository.delete({ orderId: id });

      // 重新计算总金额
      let totalAmount = 0;
      for (const item of data.items) {
        const colorVariant = await this.colorVariantRepository.findOne({
          where: { id: item.colorVariantId },
        });

        if (!colorVariant) {
          throw new NotFoundException(`颜色变体${item.colorVariantId}不存在`);
        }

        const unitPrice = item.unitPrice || colorVariant.salePrice;
        const amount = unitPrice * item.quantity;
        totalAmount += amount;

        const newItem = this.saleOrderItemRepository.create({
          orderId: id,
          productId: item.productId,
          colorVariantId: item.colorVariantId,
          quantity: item.quantity,
          unit: item.unit || 'meter',
          unitPrice,
          amount,
          remark: item.remark,
        });

        await this.saleOrderItemRepository.save(newItem);
      }

      order.totalAmount = totalAmount;
    }

    await this.saleOrderRepository.save(order);
    return this.findOne(id);
  }

  /**
   * 提交审批
   */
  async submitForApproval(id: string): Promise<SaleOrder> {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('只有待处理的订单可以提交审批');
    }

    if (order.approvalStatus === ApprovalStatus.APPROVED) {
      throw new BadRequestException('订单已审批');
    }

    order.approvalStatus = ApprovalStatus.PENDING;
    await this.saleOrderRepository.save(order);
    return this.findOne(id);
  }

  /**
   * 审批通过
   */
  async approve(id: string, approverId: string, data?: ApprovalDto): Promise<SaleOrder> {
    const order = await this.findOne(id);

    if (order.approvalStatus !== ApprovalStatus.PENDING) {
      throw new BadRequestException('只有待审批的订单可以审批');
    }

    order.approvalStatus = ApprovalStatus.APPROVED;
    order.approverId = approverId;
    order.approvalTime = new Date();
    order.approvalRemark = data?.remark;
    order.status = OrderStatus.APPROVED;

    await this.saleOrderRepository.save(order);
    return this.findOne(id);
  }

  /**
   * 审批驳回
   */
  async reject(id: string, approverId: string, data?: ApprovalDto): Promise<SaleOrder> {
    const order = await this.findOne(id);

    if (order.approvalStatus !== ApprovalStatus.PENDING) {
      throw new BadRequestException('只有待审批的订单可以驳回');
    }

    order.approvalStatus = ApprovalStatus.REJECTED;
    order.approverId = approverId;
    order.approvalTime = new Date();
    order.approvalRemark = data?.remark;

    await this.saleOrderRepository.save(order);
    return this.findOne(id);
  }

  /**
   * 取消订单
   */
  async cancel(id: string): Promise<SaleOrder> {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('已完成的订单不能取消');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('订单已取消');
    }

    order.status = OrderStatus.CANCELLED;
    await this.saleOrderRepository.save(order);
    return this.findOne(id);
  }

  /**
   * 生成订单编号
   * 格式：SO + 日期(YYYYMMDD) + 序号(4位)
   */
  private async generateOrderNo(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `SO${dateStr}`;

    const count = await this.saleOrderRepository.count({
      where: { orderNo: Like(`${prefix}%`) },
    });

    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}${seq}`;
  }
}
