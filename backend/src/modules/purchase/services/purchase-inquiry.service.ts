import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { format } from 'date-fns';
import { PurchaseInquiry, InquiryStatus } from '../entities/purchase-inquiry.entity';
import { PurchaseInquiryItem } from '../entities/purchase-inquiry-item.entity';
import { Supplier } from '../../base-data/entities/supplier.entity';
import {
  CreatePurchaseInquiryDto,
  UpdatePurchaseInquiryDto,
  QueryPurchaseInquiryDto,
  CompareInquiriesDto,
} from '../dto/purchase-inquiry.dto';

/**
 * 询价单服务
 * 提供询价单的CRUD操作和对比功能
 */
@Injectable()
export class PurchaseInquiryService {
  constructor(
    @InjectRepository(PurchaseInquiry)
    private inquiryRepository: Repository<PurchaseInquiry>,
    @InjectRepository(PurchaseInquiryItem)
    private inquiryItemRepository: Repository<PurchaseInquiryItem>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  /**
   * 生成询价单号
   * 规则：XJ-YYYYMMDD-XXX
   */
  private async generateInquiryNo(): Promise<string> {
    const today = new Date();
    const dateStr = format(today, 'yyyyMMdd');
    const prefix = `XJ${dateStr}`;

    const maxInquiry = await this.inquiryRepository
      .createQueryBuilder('inquiry')
      .where('inquiry.inquiry_no LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('inquiry.inquiry_no', 'DESC')
      .select(['inquiry.inquiry_no'])
      .getOne();

    let nextNumber = 1;
    if (maxInquiry) {
      const lastNo = maxInquiry.inquiryNo.slice(-3);
      nextNumber = parseInt(lastNo, 10) + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * 创建询价单
   */
  async create(data: CreatePurchaseInquiryDto): Promise<PurchaseInquiry> {
    // 验证供应商存在
    const supplier = await this.supplierRepository.findOne({ where: { id: data.supplierId } });
    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }

    // 生成询价单号
    const inquiryNo = await this.generateInquiryNo();

    // 计算总金额
    let totalAmount = 0;
    const items = data.items.map((item) => {
      const subtotal = Number(item.quantity) * Number(item.quotedPrice || item.expectedPrice || 0);
      totalAmount += subtotal;
      return {
        ...item,
        inquiryId: '', // 临时设置，稍后更新
        subtotal,
      };
    });

    // 创建询价单
    const inquiry = this.inquiryRepository.create({
      inquiryNo,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      inquiryDate: new Date(data.inquiryDate),
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      contactPerson: data.contactPerson,
      contactPhone: data.contactPhone,
      remark: data.remark,
      totalAmount,
      status: InquiryStatus.DRAFT,
    });

    const savedInquiry = await this.inquiryRepository.save(inquiry);

    // 创建明细
    const savedItems = await Promise.all(
      items.map((item) => {
        const inquiryItem = this.inquiryItemRepository.create({
          ...item,
          inquiryId: savedInquiry.id,
        });
        return this.inquiryItemRepository.save(inquiryItem);
      }),
    );

    return this.findOne(savedInquiry.id);
  }

  /**
   * 查询询价单列表
   */
  async findAll(
    query: QueryPurchaseInquiryDto,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: PurchaseInquiry[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.inquiryRepository
      .createQueryBuilder('inquiry')
      .leftJoinAndSelect('inquiry.items', 'items')
      .where('1=1');

    if (query.supplierId) {
      queryBuilder.andWhere('inquiry.supplier_id = :supplierId', { supplierId: query.supplierId });
    }
    if (query.status) {
      queryBuilder.andWhere('inquiry.status = :status', { status: query.status });
    }
    if (query.startDate) {
      queryBuilder.andWhere('inquiry.inquiry_date >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      queryBuilder.andWhere('inquiry.inquiry_date <= :endDate', { endDate: query.endDate });
    }
    if (query.search) {
      queryBuilder.andWhere('inquiry.inquiry_no LIKE :search', { search: `%${query.search}%` });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('inquiry.created_at', 'DESC')
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * 获取询价单详情
   */
  async findOne(id: string): Promise<PurchaseInquiry> {
    const inquiry = await this.inquiryRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!inquiry) {
      throw new NotFoundException('询价单不存在');
    }
    return inquiry;
  }

  /**
   * 更新询价单
   */
  async update(id: string, data: UpdatePurchaseInquiryDto): Promise<PurchaseInquiry> {
    const inquiry = await this.findOne(id);

    if (inquiry.status !== InquiryStatus.DRAFT) {
      throw new Error('只有草稿状态的询价单允许修改');
    }

    if (data.inquiryDate) {
      inquiry.inquiryDate = new Date(data.inquiryDate);
    }
    if (data.validUntil) {
      inquiry.validUntil = new Date(data.validUntil);
    }
    if (data.contactPerson !== undefined) {
      inquiry.contactPerson = data.contactPerson;
    }
    if (data.contactPhone !== undefined) {
      inquiry.contactPhone = data.contactPhone;
    }
    if (data.remark !== undefined) {
      inquiry.remark = data.remark;
    }

    // 如果更新了明细
    if (data.items && data.items.length > 0) {
      // 删除旧明细
      await this.inquiryItemRepository.delete({ inquiryId: id });

      // 创建新明细
      let totalAmount = 0;
      const newItems = await Promise.all(
        data.items.map((item) => {
          const subtotal = Number(item.quantity) * Number(item.quotedPrice || item.expectedPrice || 0);
          totalAmount += subtotal;
          const inquiryItem = this.inquiryItemRepository.create({
            ...item,
            inquiryId: id,
            subtotal,
          });
          return this.inquiryItemRepository.save(inquiryItem);
        }),
      );

      inquiry.totalAmount = totalAmount;
    }

    return this.inquiryRepository.save(inquiry);
  }

  /**
   * 删除询价单
   */
  async remove(id: string): Promise<void> {
    const inquiry = await this.findOne(id);

    if (inquiry.status !== InquiryStatus.DRAFT) {
      throw new Error('只有草稿状态的询价单允许删除');
    }

    // 删除明细
    await this.inquiryItemRepository.delete({ inquiryId: id });

    // 删除询价单
    await this.inquiryRepository.delete(id);
  }

  /**
   * 对比多个询价单
   */
  async compare(data: CompareInquiriesDto): Promise<{
    inquiries: PurchaseInquiry[];
    comparison: {
      productId: string;
      productName: string;
      colorVariantId: string;
      colorName: string;
      items: {
        inquiryId: string;
        quantity: number;
        quotedPrice: number;
        subtotal: number;
      }[];
    }[];
    summary: {
      inquiryId: string;
      totalAmount: number;
      lowestPriceCount: number;
    }[];
  }> {
    const { inquiryIds } = data;

    if (inquiryIds.length < 2) {
      throw new Error('对比至少需要2个询价单');
    }

    // 获取所有询价单
    const inquiries = await Promise.all(
      inquiryIds.map((id) => this.findOne(id)),
    );

    // 构建对比数据
    const productMap = new Map<string, any>();

    for (const inquiry of inquiries) {
      for (const item of inquiry.items) {
        const key = `${item.productId}-${item.colorVariantId || 'default'}`;
        if (!productMap.has(key)) {
          productMap.set(key, {
            productId: item.productId,
            productName: item.productName,
            colorVariantId: item.colorVariantId,
            colorName: item.colorName,
            items: [],
          });
        }
        productMap.get(key).items.push({
          inquiryId: inquiry.id,
          quantity: Number(item.quantity),
          quotedPrice: Number(item.quotedPrice || item.expectedPrice),
          subtotal: Number(item.subtotal),
        });
      }
    }

    const comparison = Array.from(productMap.values());

    // 统计汇总
    const summary = inquiries.map((inquiry) => {
      let lowestPriceCount = 0;

      for (const comp of comparison) {
        const myItem = comp.items.find((i) => i.inquiryId === inquiry.id);
        if (myItem) {
          const lowestPrice = Math.min(...comp.items.map((i) => i.quotedPrice));
          if (myItem.quotedPrice === lowestPrice) {
            lowestPriceCount++;
          }
        }
      }

      return {
        inquiryId: inquiry.id,
        inquiryNo: inquiry.inquiryNo,
        supplierName: inquiry.supplierName,
        totalAmount: Number(inquiry.totalAmount),
        lowestPriceCount,
      };
    });

    return { inquiries, comparison, summary };
  }

  /**
   * 更新询价单状态
   */
  async updateStatus(id: string, status: InquiryStatus): Promise<PurchaseInquiry> {
    const inquiry = await this.findOne(id);
    inquiry.status = status;
    return this.inquiryRepository.save(inquiry);
  }
}
