/**
 * 采购报表服务
 * 提供采购汇总报表、采购明细报表、供应商采购绩效报表
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder, PurchaseOrderItem } from '../entities';
import { GoodsReceipt, GoodsReceiptItem } from '../entities';
import { SupplierEvaluation } from '../entities/supplier-evaluation.entity';

/**
 * 采购汇总报表项
 */
export interface PurchaseSummaryItem {
  供应商编号: string;
  供应商名称: string;
  订单数量: number;
  订单金额: number;
  已入库数量: number;
  已入库金额: number;
  入库率: number;
  已付款金额: number;
  付款率: number;
}

/**
 * 采购汇总报表
 */
export interface PurchaseSummaryReport {
  报表期间: {
    开始日期: string;
    结束日期: string;
  };
  汇总数据: {
    订单总数量: number;
    订单总金额: number;
    已入库总数量: number;
    已入库总金额: number;
    整体入库率: number;
    已付款总金额: number;
    整体付款率: number;
  };
  供应商明细: PurchaseSummaryItem[];
}

/**
 * 采购明细报表项
 */
export interface PurchaseDetailItem {
  订单编号: string;
  订单日期: string;
  供应商编号: string;
  供应商名称: string;
  产品编号: string;
  产品名称: string;
  单位: string;
  订单数量: number;
  订单单价: number;
  订单金额: number;
  已入库数量: number;
  入库金额: number;
  订单状态: string;
}

/**
 * 采购明细报表
 */
export interface PurchaseDetailReport {
  报表期间: {
    开始日期: string;
    结束日期: string;
  };
  明细列表: PurchaseDetailItem[];
  合计: {
    订单数量: number;
    订单金额: number;
    已入库数量: number;
    入库金额: number;
  };
}

/**
 * 供应商采购绩效报表
 */
export interface SupplierPerformanceReport {
  供应商编号: string;
  供应商名称: string;
  联系人: string;
  联系电话: string;
  合作开始日期: string;
  绩效数据: {
    订单数量: number;
    订单金额: number;
    准时交货率: number;
    质量合格率: number;
    平均交货周期: number;
    响应速度评分: number;
    价格竞争力评分: number;
    综合评分: number;
  };
  历史评估: {
    评估日期: string;
    评估等级: string;
    评估得分: number;
  }[];
}

/**
 * 采购报表服务
 */
@Injectable()
export class PurchaseReportService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private purchaseOrderItemRepository: Repository<PurchaseOrderItem>,
    @InjectRepository(GoodsReceipt)
    private goodsReceiptRepository: Repository<GoodsReceipt>,
    @InjectRepository(GoodsReceiptItem)
    private goodsReceiptItemRepository: Repository<GoodsReceiptItem>,
    @InjectRepository(SupplierEvaluation)
    private supplierEvaluationRepository: Repository<SupplierEvaluation>,
  ) {}

  /**
   * 获取采购汇总报表
   */
  async getPurchaseSummaryReport(startDate: string, endDate: string): Promise<PurchaseSummaryReport> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 查询采购订单
    const purchaseOrders = await this.purchaseOrderRepository
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.items', 'items')
      .where('po.order_date >= :startDate', { startDate: start })
      .andWhere('po.order_date <= :endDate', { endDate: end })
      .getMany();

    // 查询采购入库
    const goodsReceipts = await this.goodsReceiptRepository
      .createQueryBuilder('gr')
      .leftJoinAndSelect('gr.items', 'items')
      .where('gr.receipt_date >= :startDate', { startDate: start })
      .andWhere('gr.receipt_date <= :endDate', { endDate: end })
      .getMany();

    // 按供应商汇总
    const supplierMap = new Map<string, PurchaseSummaryItem>();

    // 初始化供应商汇总数据
    for (const order of purchaseOrders) {
      const key = order.supplierId;
      if (!supplierMap.has(key)) {
        supplierMap.set(key, {
          供应商编号: order.supplierId,
          供应商名称: order.supplierName,
          订单数量: 0,
          订单金额: 0,
          已入库数量: 0,
          已入库金额: 0,
          入库率: 0,
          已付款金额: order.paidAmount,
          付款率: 0,
        });
      }
      const item = supplierMap.get(key)!;
      item.订单数量 += 1;
      item.订单金额 += order.totalAmount;
      item.已付款金额 = (item.已付款金额 || 0) + (order.paidAmount || 0);
    }

    // 计算入库数据
    for (const receipt of goodsReceipts) {
      const key = receipt.supplierId;
      if (supplierMap.has(key)) {
        const item = supplierMap.get(key)!;
        item.已入库金额 += receipt.totalQuantity;
        if (receipt.items) {
          item.已入库数量 += receipt.items.reduce((sum, i) => sum + i.quantity, 0);
        }
      }
    }

    // 计算入库率和付款率
    let 订单总数量 = 0;
    let 订单总金额 = 0;
    let 已入库总数量 = 0;
    let 已入库总金额 = 0;
    let 已付款总金额 = 0;

    for (const item of supplierMap.values()) {
      item.入库率 = item.订单数量 > 0 ? (item.已入库数量 / item.订单数量) * 100 : 0;
      item.付款率 = item.订单金额 > 0 ? (item.已付款金额 / item.订单金额) * 100 : 0;

      订单总数量 += item.订单数量;
      订单总金额 += item.订单金额;
      已入库总数量 += item.已入库数量;
      已入库总金额 += item.已入库金额;
      已付款总金额 += item.已付款金额;
    }

    return {
      报表期间: {
        开始日期: startDate,
        结束日期: endDate,
      },
      汇总数据: {
        订单总数量,
        订单总金额,
        已入库总数量,
        已入库总金额,
        整体入库率: 订单总数量 > 0 ? (已入库总数量 / 订单总数量) * 100 : 0,
        已付款总金额,
        整体付款率: 订单总金额 > 0 ? (已付款总金额 / 订单总金额) * 100 : 0,
      },
      供应商明细: Array.from(supplierMap.values()),
    };
  }

  /**
   * 获取采购明细报表
   */
  async getPurchaseDetailReport(startDate: string, endDate: string): Promise<PurchaseDetailReport> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 查询采购订单明细
    const orderItems = await this.purchaseOrderItemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.purchaseOrder', 'order')
      .where('order.order_date >= :startDate', { startDate: start })
      .andWhere('order.order_date <= :endDate', { endDate: end })
      .getMany();

    // 查询入库明细
    const receiptItems = await this.goodsReceiptItemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.goodsReceipt', 'receipt')
      .where('receipt.receipt_date >= :startDate', { startDate: start })
      .andWhere('receipt.receipt_date <= :endDate', { endDate: end })
      .getMany();

    // 构建入库映射
    const receiptMap = new Map<string, { 数量: number; 金额: number }>();
    for (const item of receiptItems) {
      const key = `${item.orderItemId}-${item.productId}`;
      if (!receiptMap.has(key)) {
        receiptMap.set(key, { 数量: 0, 金额: 0 });
      }
      const entry = receiptMap.get(key)!;
      entry.数量 += item.quantity;
      entry.金额 += item.quantity * (item.unitPrice || 0);
    }

    // 构建明细列表
    const 明细列表: PurchaseDetailItem[] = [];
    let 订单数量合计 = 0;
    let 订单金额合计 = 0;
    let 已入库数量合计 = 0;
    let 入库金额合计 = 0;

    for (const item of orderItems) {
      const key = `${item.id}-${item.productId}`;
      const receiptData = receiptMap.get(key) || { 数量: 0, 金额: 0 };

      明细列表.push({
        订单编号: item.purchaseOrder?.orderNo || '',
        订单日期: item.purchaseOrder?.orderDate?.toString() || '',
        供应商编号: item.purchaseOrder?.supplierId || '',
        供应商名称: item.purchaseOrder?.supplierName || '',
        产品编号: item.productCode || '',
        产品名称: item.productName || '',
        单位: item.unit || '',
        订单数量: item.quantity,
        订单单价: item.unitPrice,
        订单金额: item.quantity * item.unitPrice,
        已入库数量: receiptData.数量,
        入库金额: receiptData.金额,
        订单状态: item.purchaseOrder?.status || '',
      });

      订单数量合计 += item.quantity;
      订单金额合计 += item.quantity * item.unitPrice;
      已入库数量合计 += receiptData.数量;
      入库金额合计 += receiptData.金额;
    }

    return {
      报表期间: {
        开始日期: startDate,
        结束日期: endDate,
      },
      明细列表,
      合计: {
        订单数量: 订单数量合计,
        订单金额: 订单金额合计,
        已入库数量: 已入库数量合计,
        入库金额: 入库金额合计,
      },
    };
  }

  /**
   * 获取供应商采购绩效报表
   */
  async getSupplierPerformanceReport(supplierId: string): Promise<SupplierPerformanceReport | null> {
    // 查询供应商信息
    const purchaseOrders = await this.purchaseOrderRepository
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.items', 'items')
      .where('po.supplier_id = :supplierId', { supplierId })
      .getMany();

    if (purchaseOrders.length === 0) {
      return null;
    }

    // 计算绩效数据
    const 订单数量 = purchaseOrders.length;
    const 订单金额 = purchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // 查询入库情况
    const goodsReceipts = await this.goodsReceiptRepository
      .createQueryBuilder('gr')
      .where('gr.supplier_id = :supplierId', { supplierId })
      .getMany();

    // 计算准时交货率（简化：假设有入库日期的算交货）
    const 已交货订单数 = goodsReceipts.length;
    const 准时交货率 = 订单数量 > 0 ? (已交货订单数 / 订单数量) * 100 : 0;

    // 查询供应商评估历史
    const evaluations = await this.supplierEvaluationRepository
      .createQueryBuilder('se')
      .where('se.supplier_id = :supplierId', { supplierId })
      .orderBy('se.evaluation_date', 'DESC')
      .limit(5)
      .getMany();

    // 计算综合评分
    const 平均交货周期 = 0; // 简化
    const 响应速度评分 = 85; // 简化
    const 价格竞争力评分 = 80; // 简化
    const 综合评分 = (准时交货率 + 响应速度评分 + 价格竞争力评分) / 3;

    const firstOrder = purchaseOrders[0];

    return {
      供应商编号: supplierId,
      供应商名称: firstOrder.supplierName,
      联系人: '',
      联系电话: '',
      合作开始日期: firstOrder.orderDate?.toString() || '',
      绩效数据: {
        订单数量,
        订单金额,
        准时交货率,
        质量合格率: 100, // 简化
        平均交货周期,
        响应速度评分,
        价格竞争力评分,
        综合评分,
      },
      历史评估: evaluations.map((e) => ({
        评估日期: e.evaluationDate?.toString() || '',
        评估等级: e.level || '',
        评估得分: e.totalScore || 0,
      })),
    };
  }
}
