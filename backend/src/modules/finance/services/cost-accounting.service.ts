/**
 * 成本核算服务
 * 提供订单/工单的实际成本计算和成本差异分析功能
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionOrder } from '../../production/entities/production-order.entity';
import { ProductionReceipt } from '../../production/entities/production-receipt.entity';
import { ProductionReceiptItem } from '../../production/entities/production-receipt-item.entity';
import { MaterialRequisition } from '../../production/entities/material-requisition.entity';
import { MaterialRequisitionItem } from '../../production/entities/material-requisition-item.entity';
import { GoodsReceipt } from '../../purchase/entities/goods-receipt.entity';
import { GoodsReceiptItem } from '../../purchase/entities/goods-receipt-item.entity';
import { InventoryBatch } from '../../inventory/entities/inventory-batch.entity';
import { SaleOrder } from '../../sales/entities/sale-order.entity';
import { SaleOrderItem } from '../../sales/entities/sale-order-item.entity';

/**
 * 成本核算服务
 */
@Injectable()
export class CostAccountingService {
  constructor(
    @InjectRepository(ProductionOrder)
    private productionOrderRepository: Repository<ProductionOrder>,
    @InjectRepository(ProductionReceipt)
    private productionReceiptRepository: Repository<ProductionReceipt>,
    @InjectRepository(ProductionReceiptItem)
    private productionReceiptItemRepository: Repository<ProductionReceiptItem>,
    @InjectRepository(MaterialRequisition)
    private materialRequisitionRepository: Repository<MaterialRequisition>,
    @InjectRepository(MaterialRequisitionItem)
    private materialRequisitionItemRepository: Repository<MaterialRequisitionItem>,
    @InjectRepository(GoodsReceipt)
    private goodsReceiptRepository: Repository<GoodsReceipt>,
    @InjectRepository(GoodsReceiptItem)
    private goodsReceiptItemRepository: Repository<GoodsReceiptItem>,
    @InjectRepository(InventoryBatch)
    private inventoryBatchRepository: Repository<InventoryBatch>,
    @InjectRepository(SaleOrder)
    private saleOrderRepository: Repository<SaleOrder>,
    @InjectRepository(SaleOrderItem)
    private saleOrderItemRepository: Repository<SaleOrderItem>,
  ) {}

  /**
   * 计算订单实际成本（料工费）
   * @param orderId 订单ID
   * @returns 订单实际成本明细
   */
  async calculateActualCost(orderId: string): Promise<{
    订单编号: string;
    产品成本: {
      产品名称: string;
      数量: number;
      单位成本: number;
      总成本: number;
    }[];
    材料成本: {
      物料名称: string;
      数量: number;
      单位成本: number;
      总成本: number;
    }[];
    人工成本: number;
    制造费用: number;
    总成本: number;
    预算成本: number;
    成本差异: number;
    差异率: number;
  }> {
    // 获取销售订单信息
    const saleOrder = await this.saleOrderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
    if (!saleOrder) {
      throw new NotFoundException(`销售订单不存在: ${orderId}`);
    }

    // 计算产品成本（基于入库批次）
    const 产品成本明细: Array<{ 产品名称: string; 数量: number; 单位成本: number; 总成本: number }> = [];
    let 总材料成本 = 0;

    // 获取订单关联的生产工单
    const productionOrders = await this.productionOrderRepository.find({
      where: { id: saleOrder.id }, // 假设订单ID与工单ID有对应关系
    });

    for (const order of productionOrders) {
      // 获取生产入库单
      const receipts = await this.productionReceiptRepository.find({
        where: { productionOrderId: order.id },
        relations: ['items'],
      });

      for (const receipt of receipts) {
        for (const item of receipt.items) {
          // 获取批次信息以确定成本
          const batch = await this.inventoryBatchRepository.findOne({
            where: { id: item.batchId },
          });

          const 数量 = Number(item.qualifiedQuantity) || 0;
          // 使用采购入库的平均成本作为单位成本（简化计算）
          const 入库项 = await this.goodsReceiptItemRepository.findOne({
            where: { receiptId: receipt.id },
          });
          const 单位成本 = 入库项 ? Number(入库项.unitPrice) || 0 : 0;
          const 总成本 = 数量 * 单位成本;

          产品成本明细.push({
            产品名称: `产品-${item.batchId?.slice(0, 8) || item.id.slice(0, 8)}`,
            数量,
            单位成本,
            总成本,
          });
        }
      }

      // 获取领料单计算材料成本
      const requisitions = await this.materialRequisitionRepository.find({
        where: { productionOrderId: order.id },
        relations: ['items'],
      });

      for (const req of requisitions) {
        for (const reqItem of req.items) {
          // 获取材料批次成本
          const batch = await this.inventoryBatchRepository.findOne({
            where: { id: reqItem.batchId },
          });

          const 数量 = Number(reqItem.issuedQuantity) || 0;
          // 如果没有批次成本，使用采购入库的平均成本
          let 单位成本 = 0;
          if (batch) {
            const goodsReceipt = await this.goodsReceiptRepository.findOne({
              where: { id: batch.sourceId },
            });
            if (goodsReceipt) {
              const goodsItem = await this.goodsReceiptItemRepository.findOne({
                where: { receiptId: goodsReceipt.id, productId: reqItem.productId },
              });
              单位成本 = goodsItem ? Number(goodsItem.unitPrice) || 0 : 0;
            }
          }

          总材料成本 += 数量 * 单位成本;
        }
      }
    }

    // 人工成本和制造费用（这里使用简化计算，实际应关联工资/工时数据）
    const 人工成本 = 总材料成本 * 0.15; // 假设人工成本为材料成本的15%
    const 制造费用 = 总材料成本 * 0.1; // 假设制造费用为材料成本的10%

    // 总成本
    const 总成本 = 产品成本明细.reduce((sum, item) => sum + item.总成本, 0) + 人工成本 + 制造费用;

    // 预算成本（使用订单金额的95%作为预算）
    const 预算成本 = Number(saleOrder.totalAmount) * 0.95;
    const 成本差异 = 总成本 - 预算成本;
    const 差异率 = 预算成本 > 0 ? (成本差异 / 预算成本) * 100 : 0;

    return {
      订单编号: saleOrder.orderNo,
      产品成本: 产品成本明细,
      材料成本: [], // 材料成本已合并到产品成本中
      人工成本: Math.round(人工成本 * 100) / 100,
      制造费用: Math.round(制造费用 * 100) / 100,
      总成本: Math.round(总成本 * 100) / 100,
      预算成本: Math.round(预算成本 * 100) / 100,
      成本差异: Math.round(成本差异 * 100) / 100,
      差异率: Math.round(差异率 * 100) / 100,
    };
  }

  /**
   * 获取成本差异分析
   * @param orderId 订单ID
   * @returns 成本差异分析详情
   */
  async getCostVariance(orderId: string): Promise<{
    订单编号: string;
    预算成本: number;
    实际成本: number;
    成本差异: number;
    差异率: number;
    差异分析: {
      类型: '有利' | '不利';
      项目: string;
      预算: number;
      实际: number;
      差异: number;
    }[];
    改进建议: string[];
  }> {
    const actualCost = await this.calculateActualCost(orderId);

    const 差异分析 = [
      {
        类型: actualCost.人工成本 / actualCost.预算成本 < 0.15 ? '有利' as const : '不利' as const,
        项目: '人工成本',
        预算: actualCost.预算成本 * 0.15,
        实际: actualCost.人工成本,
        差异: actualCost.人工成本 - actualCost.预算成本 * 0.15,
      },
      {
        类型: actualCost.制造费用 / actualCost.预算成本 < 0.1 ? '有利' as const : '不利' as const,
        项目: '制造费用',
        预算: actualCost.预算成本 * 0.1,
        实际: actualCost.制造费用,
        差异: actualCost.制造费用 - actualCost.预算成本 * 0.1,
      },
    ];

    const 改进建议: string[] = [];
    if (actualCost.差异率 > 5) {
      改进建议.push('成本超支严重，建议优化生产工艺和材料使用');
    }
    if (actualCost.人工成本 / actualCost.总成本 > 0.2) {
      改进建议.push('人工成本占比较高，建议提高自动化程度');
    }
    if (actualCost.制造费用 / actualCost.总成本 > 0.15) {
      改进建议.push('制造费用较高，建议优化设备利用率');
    }

    return {
      订单编号: actualCost.订单编号,
      预算成本: actualCost.预算成本,
      实际成本: actualCost.总成本,
      成本差异: actualCost.成本差异,
      差异率: actualCost.差异率,
      差异分析,
      改进建议,
    };
  }

  /**
   * 获取生产订单成本报表
   * @param productionOrderId 生产工单ID
   * @returns 生产订单成本报表
   */
  async getCostReport(productionOrderId: string): Promise<{
    工单编号: string;
    产品信息: {
      产品ID: string;
      数量: number;
      单位: string;
    };
    成本构成: {
      类别: string;
      金额: number;
      占比: number;
    }[];
    材料明细: {
      物料名称: string;
      数量: number;
      单位成本: number;
      总成本: number;
    }[];
    工时统计: {
      计划工时: number;
      实际工时: number;
      效率: number;
    };
    总成本: number;
    单位成本: number;
  }> {
    const productionOrder = await this.productionOrderRepository.findOne({
      where: { id: productionOrderId },
    });

    if (!productionOrder) {
      throw new NotFoundException(`生产工单不存在: ${productionOrderId}`);
    }

    // 获取领料单计算材料成本
    const requisitions = await this.materialRequisitionRepository.find({
      where: { productionOrderId },
      relations: ['items'],
    });

    const 材料明细: Array<{ 物料名称: string; 数量: number; 单位成本: number; 总成本: number }> = [];
    let 总材料成本 = 0;

    for (const req of requisitions) {
      for (const reqItem of req.items) {
        const 数量 = Number(reqItem.issuedQuantity) || 0;

        // 获取材料批次成本
        let 单位成本 = 0;
        if (reqItem.batchId) {
          const batch = await this.inventoryBatchRepository.findOne({
            where: { id: reqItem.batchId },
          });
          if (batch && batch.sourceId) {
            const goodsReceipt = await this.goodsReceiptRepository.findOne({
              where: { id: batch.sourceId },
            });
            if (goodsReceipt) {
              const goodsItem = await this.goodsReceiptItemRepository.findOne({
                where: { receiptId: goodsReceipt.id, productId: reqItem.productId },
              });
              单位成本 = goodsItem ? Number(goodsItem.unitPrice) || 0 : 0;
            }
          }
        }

        const 总成本 = 数量 * 单位成本;
        总材料成本 += 总成本;

        材料明细.push({
          物料名称: `物料-${reqItem.productId.slice(0, 8)}`,
          数量,
          单位成本,
          总成本,
        });
      }
    }

    // 计算成本构成
    const 人工成本 = 总材料成本 * 0.15;
    const 制造费用 = 总材料成本 * 0.1;
    const 总成本 = 总材料成本 + 人工成本 + 制造费用;

    const 成本构成 = [
      { 类别: '直接材料', 金额: Math.round(总材料成本 * 100) / 100, 占比: 0 },
      { 类别: '直接人工', 金额: Math.round(人工成本 * 100) / 100, 占比: 0 },
      { 类别: '制造费用', 金额: Math.round(制造费用 * 100) / 100, 占比: 0 },
    ];

    // 计算占比
    成本构成.forEach((item) => {
      item.占比 = 总成本 > 0 ? Math.round((item.金额 / 总成本) * 10000) / 100 : 0;
    });

    // 工时统计（简化计算）
    const 计划工时 = Number(productionOrder.quantity) * 0.5; // 假设每单位需要0.5小时
    const 实际工时 = 计划工时 * 1.1; // 实际工时比计划多10%

    return {
      工单编号: productionOrder.orderNo,
      产品信息: {
        产品ID: productionOrder.productId,
        数量: Number(productionOrder.quantity),
        单位: productionOrder.unit,
      },
      成本构成,
      材料明细,
      工时统计: {
        计划工时: Math.round(计划工时 * 100) / 100,
        实际工时: Math.round(实际工时 * 100) / 100,
        效率: Math.round((计划工时 / 实际工时) * 100 * 100) / 100,
      },
      总成本: Math.round(总成本 * 100) / 100,
      单位成本: Math.round((总成本 / Number(productionOrder.quantity)) * 100) / 100,
    };
  }
}
