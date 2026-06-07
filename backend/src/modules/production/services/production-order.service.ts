import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ProductionOrder } from '../entities/production-order.entity';
import { ProductionOrderItem } from '../entities/production-order-item.entity';
import { ProductionOrderStatus } from '../enums/production-order-status.enum';
import { CreateProductionOrderDto, UpdateProductionOrderDto, QueryProductionOrderDto } from '../dto/production-order.dto';
import { CodeGenerator } from '../../../common/utils';

/**
 * 生产工单服务
 * 负责生产工单的增删改查及状态流转
 */
@Injectable()
export class ProductionOrderService {
  constructor(
    @InjectRepository(ProductionOrder)
    private readonly orderRepository: Repository<ProductionOrder>,
    @InjectRepository(ProductionOrderItem)
    private readonly orderItemRepository: Repository<ProductionOrderItem>,
  ) {}

  /**
   * 创建生产工单
   */
  async create(dto: CreateProductionOrderDto, userId?: string): Promise<ProductionOrder> {
    // 生成工单编号
    const orderNo = await CodeGenerator.generateOrderNo('SC');

    const order = this.orderRepository.create({
      orderNo,
      productId: dto.productId,
      colorVariantId: dto.colorVariantId,
      quantity: dto.quantity,
      unit: dto.unit || 'meter',
      plannedStartDate: dto.plannedStartDate,
      plannedEndDate: dto.plannedEndDate,
      priority: dto.priority,
      processRequirements: dto.processRequirements,
      remark: dto.remark,
      status: ProductionOrderStatus.DRAFT,
      createdBy: userId,
    });

    const savedOrder = await this.orderRepository.save(order);

    // 保存工单明细
    if (dto.items && dto.items.length > 0) {
      const items = dto.items.map((item) =>
        this.orderItemRepository.create({
          ...item,
          orderId: savedOrder.id,
          unit: item.unit || 'meter',
          createdBy: userId,
        }),
      );
      await this.orderItemRepository.save(items);
    }

    return this.findOne(savedOrder.id);
  }

  /**
   * 查询工单列表
   */
  async findAll(query: QueryProductionOrderDto): Promise<{ list: ProductionOrder[]; total: number }> {
    const where: FindOptionsWhere<ProductionOrder> = {};

    if (query.orderNo) {
      where.orderNo = query.orderNo;
    }
    if (query.productId) {
      where.productId = query.productId;
    }
    if (query.colorVariantId) {
      where.colorVariantId = query.colorVariantId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.priority) {
      where.priority = query.priority;
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [list, total] = await this.orderRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
      relations: ['items'],
    });

    return { list, total };
  }

  /**
   * 获取工单详情
   */
  async findOne(id: string): Promise<ProductionOrder> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`生产工单不存在: ${id}`);
    }

    return order;
  }

  /**
   * 更新工单
   */
  async update(id: string, dto: UpdateProductionOrderDto, userId?: string): Promise<ProductionOrder> {
    const order = await this.findOne(id);

    // 草稿状态才能更新
    if (order.status !== ProductionOrderStatus.DRAFT) {
      throw new BadRequestException('只有草稿状态的工单才能修改');
    }

    await this.orderRepository.update(id, {
      ...dto,
      updatedBy: userId,
    });

    return this.findOne(id);
  }

  /**
   * 下达工单
   */
  async release(id: string, userId?: string): Promise<ProductionOrder> {
    const order = await this.findOne(id);

    if (order.status !== ProductionOrderStatus.DRAFT) {
      throw new BadRequestException('只有草稿状态的工单才能下达');
    }

    await this.orderRepository.update(id, {
      status: ProductionOrderStatus.RELEASED,
      updatedBy: userId,
    });

    return this.findOne(id);
  }

  /**
   * 开始生产
   */
  async start(id: string, userId?: string): Promise<ProductionOrder> {
    const order = await this.findOne(id);

    if (order.status !== ProductionOrderStatus.RELEASED) {
      throw new BadRequestException('只有已下达状态的工单才能开始生产');
    }

    await this.orderRepository.update(id, {
      status: ProductionOrderStatus.IN_PROGRESS,
      actualStartDate: new Date(),
      updatedBy: userId,
    });

    return this.findOne(id);
  }

  /**
   * 完工
   */
  async complete(id: string, completedQuantity: number, userId?: string): Promise<ProductionOrder> {
    const order = await this.findOne(id);

    if (order.status !== ProductionOrderStatus.IN_PROGRESS) {
      throw new BadRequestException('只有生产中的工单才能完工');
    }

    await this.orderRepository.update(id, {
      status: ProductionOrderStatus.COMPLETED,
      completedQuantity: completedQuantity || order.quantity,
      actualEndDate: new Date(),
      updatedBy: userId,
    });

    return this.findOne(id);
  }

  /**
   * 取消工单
   */
  async cancel(id: string, userId?: string): Promise<ProductionOrder> {
    const order = await this.findOne(id);

    if (order.status === ProductionOrderStatus.COMPLETED) {
      throw new BadRequestException('已完工的工单不能取消');
    }

    await this.orderRepository.update(id, {
      status: ProductionOrderStatus.CANCELLED,
      updatedBy: userId,
    });

    return this.findOne(id);
  }

  /**
   * 添加工单明细
   */
  async addItem(orderId: string, dto: CreateProductionOrderDto, userId?: string): Promise<ProductionOrder> {
    const order = await this.findOne(orderId);

    if (order.status !== ProductionOrderStatus.DRAFT) {
      throw new BadRequestException('只有草稿状态的工单才能添加明细');
    }

    if (dto.items && dto.items.length > 0) {
      const items = dto.items.map((item) =>
        this.orderItemRepository.create({
          ...item,
          orderId: order.id,
          unit: item.unit || 'meter',
          createdBy: userId,
        }),
      );
      await this.orderItemRepository.save(items);
    }

    return this.findOne(orderId);
  }
}
