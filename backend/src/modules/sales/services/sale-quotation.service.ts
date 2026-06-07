import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { SaleQuotation, SaleQuotationItem } from '../entities';
import { QuotationStatus, OrderStatus } from '../enums';
import { CreateSaleQuotationDto, UpdateSaleQuotationDto, QuerySaleQuotationDto } from '../dto';
import { ProductColorVariant } from '../../product/entities/product-color-variant.entity';
import { SaleOrder, SaleOrderItem } from '../entities';

/**
 * 销售报价单服务
 */
@Injectable()
export class SaleQuotationService {
  constructor(
    @InjectRepository(SaleQuotation)
    private saleQuotationRepository: Repository<SaleQuotation>,
    @InjectRepository(SaleQuotationItem)
    private saleQuotationItemRepository: Repository<SaleQuotationItem>,
    @InjectRepository(ProductColorVariant)
    private colorVariantRepository: Repository<ProductColorVariant>,
    @InjectRepository(SaleOrder)
    private saleOrderRepository: Repository<SaleOrder>,
    @InjectRepository(SaleOrderItem)
    private saleOrderItemRepository: Repository<SaleOrderItem>,
    private dataSource: DataSource,
  ) {}

  /**
   * 创建报价单
   */
  async create(data: CreateSaleQuotationDto): Promise<SaleQuotation> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 生成报价单编号
      const quotationNo = await this.generateQuotationNo();

      // 计算报价单总金额
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

      // 计算折后价
      const discountRate = data.discountRate || 1;
      const finalAmount = totalAmount * discountRate;

      // 创建报价单
      const quotation = queryRunner.manager.create(SaleQuotation, {
        quotationNo,
        customerId: data.customerId,
        quotationDate: new Date(data.quotationDate),
        validUntil: new Date(data.validUntil),
        totalAmount,
        discountRate,
        finalAmount,
        salespersonId: data.salespersonId,
        remark: data.remark,
        status: QuotationStatus.草稿,
      });

      const savedQuotation = await queryRunner.manager.save(quotation);

      // 创建报价单明细
      for (const itemData of itemsData) {
        const item = queryRunner.manager.create(SaleQuotationItem, {
          ...itemData,
          quotationId: savedQuotation.id,
        });
        await queryRunner.manager.save(item);
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedQuotation.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 查询报价单列表
   */
  async findAll(query: QuerySaleQuotationDto): Promise<{ data: SaleQuotation[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, search, customerId, status, startDate, endDate } = query;

    const queryBuilder = this.saleQuotationRepository
      .createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.items', 'items')
      .leftJoinAndSelect('quotation.customer', 'customer')
      .orderBy('quotation.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      queryBuilder.andWhere(
        '(quotation.quotationNo LIKE :search OR customer.name LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (customerId) {
      queryBuilder.andWhere('quotation.customerId = :customerId', { customerId });
    }

    if (status) {
      queryBuilder.andWhere('quotation.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('quotation.quotationDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('quotation.quotationDate <= :endDate', { endDate });
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total, page, limit };
  }

  /**
   * 获取报价单详情
   */
  async findOne(id: string): Promise<SaleQuotation> {
    const quotation = await this.saleQuotationRepository.findOne({
      where: { id },
      relations: ['items', 'customer'],
    });

    if (!quotation) {
      throw new NotFoundException('报价单不存在');
    }

    return quotation;
  }

  /**
   * 更新报价单
   * 注意：只有草稿状态的报价单可以修改
   */
  async update(id: string, data: UpdateSaleQuotationDto): Promise<SaleQuotation> {
    const quotation = await this.findOne(id);

    if (quotation.status !== QuotationStatus.草稿) {
      throw new BadRequestException('只有草稿状态的报价单可以修改');
    }

    // 更新报价单基本信息
    if (data.quotationDate) {
      quotation.quotationDate = new Date(data.quotationDate);
    }
    if (data.validUntil) {
      quotation.validUntil = new Date(data.validUntil);
    }
    if (data.discountRate !== undefined) {
      quotation.discountRate = data.discountRate;
    }
    if (data.remark !== undefined) {
      quotation.remark = data.remark;
    }

    // 如果有更新明细
    if (data.items && data.items.length > 0) {
      // 删除旧明细
      await this.saleQuotationItemRepository.delete({ quotationId: id });

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

        const newItem = this.saleQuotationItemRepository.create({
          quotationId: id,
          productId: item.productId,
          colorVariantId: item.colorVariantId,
          quantity: item.quantity,
          unit: item.unit || 'meter',
          unitPrice,
          amount,
          remark: item.remark,
        });

        await this.saleQuotationItemRepository.save(newItem);
      }

      quotation.totalAmount = totalAmount;
      quotation.finalAmount = totalAmount * quotation.discountRate;
    } else {
      // 只更新折扣率时重新计算折后价
      quotation.finalAmount = quotation.totalAmount * quotation.discountRate;
    }

    await this.saleQuotationRepository.save(quotation);
    return this.findOne(id);
  }

  /**
   * 确认报价单
   */
  async confirm(id: string): Promise<SaleQuotation> {
    const quotation = await this.findOne(id);

    if (quotation.status !== QuotationStatus.草稿) {
      throw new BadRequestException('只有草稿状态的报价单可以确认');
    }

    // 检查是否已过期
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (quotation.validUntil < today) {
      quotation.status = QuotationStatus.已过期;
    } else {
      quotation.status = QuotationStatus.已确认;
    }

    await this.saleQuotationRepository.save(quotation);
    return this.findOne(id);
  }

  /**
   * 报价单转订单
   */
  async convertToOrder(id: string): Promise<SaleOrder> {
    const quotation = await this.findOne(id);

    if (quotation.status !== QuotationStatus.已确认) {
      throw new BadRequestException('只有已确认的报价单可以转订单');
    }

    // 检查是否已过期
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (quotation.validUntil < today) {
      quotation.status = QuotationStatus.已过期;
      await this.saleQuotationRepository.save(quotation);
      throw new BadRequestException('报价单已过期，无法转订单');
    }

    // 生成订单编号
    const orderNo = await this.generateOrderNo();

    // 创建销售订单
    const order = this.saleOrderRepository.create({
      orderNo,
      customerId: quotation.customerId,
      orderDate: new Date(),
      totalAmount: quotation.finalAmount,
      salespersonId: quotation.salespersonId,
      remark: `由报价单${quotation.quotationNo}转化`,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.saleOrderRepository.save(order);

    // 创建订单明细
    for (const quotationItem of quotation.items) {
      const orderItem = this.saleOrderItemRepository.create({
        orderId: (savedOrder as SaleOrder).id,
        productId: quotationItem.productId,
        colorVariantId: quotationItem.colorVariantId,
        quantity: quotationItem.quantity,
        unit: quotationItem.unit,
        unitPrice: quotationItem.unitPrice,
        amount: quotationItem.amount,
      });
      await this.saleOrderItemRepository.save(orderItem);
    }

    // 更新报价单状态为已转订单
    quotation.status = QuotationStatus.已转订单;
    await this.saleQuotationRepository.save(quotation);

    return savedOrder as SaleOrder;
  }

  /**
   * 取消报价单
   */
  async cancel(id: string): Promise<SaleQuotation> {
    const quotation = await this.findOne(id);

    if (quotation.status === QuotationStatus.已转订单) {
      throw new BadRequestException('已转订单的报价单不能取消');
    }

    quotation.status = QuotationStatus.已过期;
    await this.saleQuotationRepository.save(quotation);
    return this.findOne(id);
  }

  /**
   * 生成报价单编号
   * 格式：SQ + 日期(YYYYMMDD) + 序号(4位)
   */
  private async generateQuotationNo(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `SQ${dateStr}`;

    const count = await this.saleQuotationRepository.count({
      where: { quotationNo: Like(`${prefix}%`) },
    });

    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}${seq}`;
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
