import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrderController, GoodsReceiptController, SupplierEvaluationController, PurchaseInquiryController } from './controllers';
import { PurchaseOrderService, GoodsReceiptService, SupplierEvaluationService, PurchaseInquiryService } from './services';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { GoodsReceipt } from './entities/goods-receipt.entity';
import { GoodsReceiptItem } from './entities/goods-receipt-item.entity';
import { SupplierEvaluation, SupplierEvaluationItem } from './entities';
import { PurchaseInquiry, PurchaseInquiryItem } from './entities';
import { Supplier } from '../base-data/entities/supplier.entity';
import { Product } from '../base-data/entities/product.entity';
import { InventoryBatch } from '../inventory/entities/inventory-batch.entity';
import { Warehouse } from '../inventory/entities/warehouse.entity';

/**
 * 采购模块
 * 包含采购订单、采购入库、供应商评估和询价单功能
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      // 采购订单
      PurchaseOrder,
      PurchaseOrderItem,
      // 采购入库
      GoodsReceipt,
      GoodsReceiptItem,
      // 供应商评估
      SupplierEvaluation,
      SupplierEvaluationItem,
      // 询价单
      PurchaseInquiry,
      PurchaseInquiryItem,
      // 基础数据
      Supplier,
      Product,
      // 库存
      InventoryBatch,
      Warehouse,
    ]),
  ],
  controllers: [
    PurchaseOrderController,
    GoodsReceiptController,
    SupplierEvaluationController,
    PurchaseInquiryController,
  ],
  providers: [
    PurchaseOrderService,
    GoodsReceiptService,
    SupplierEvaluationService,
    PurchaseInquiryService,
  ],
  exports: [
    PurchaseOrderService,
    GoodsReceiptService,
    SupplierEvaluationService,
    PurchaseInquiryService,
  ],
})
export class PurchaseModule {}
