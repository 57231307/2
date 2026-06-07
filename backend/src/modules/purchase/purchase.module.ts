import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrderController, GoodsReceiptController } from './controllers';
import { PurchaseOrderService, GoodsReceiptService } from './services';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { GoodsReceipt } from './entities/goods-receipt.entity';
import { GoodsReceiptItem } from './entities/goods-receipt-item.entity';
import { Supplier } from '../base-data/entities/supplier.entity';
import { Product } from '../base-data/entities/product.entity';
import { InventoryBatch } from '../inventory/entities/inventory-batch.entity';
import { Warehouse } from '../inventory/entities/warehouse.entity';

/**
 * 采购模块
 * 包含采购订单和采购入库功能
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
  ],
  providers: [
    PurchaseOrderService,
    GoodsReceiptService,
  ],
  exports: [
    PurchaseOrderService,
    GoodsReceiptService,
  ],
})
export class PurchaseModule {}
