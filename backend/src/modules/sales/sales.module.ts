import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleOrder, SaleOrderItem, DeliveryNote, DeliveryNoteItem, SaleReturn } from './entities';
import { SaleOrderService, DeliveryService, SaleReturnService } from './services';
import { SaleOrderController, DeliveryController, SaleReturnController } from './controllers';
import { ProductColorVariant } from '../product/entities/product-color-variant.entity';
import { InventoryBatch } from '../inventory/entities/inventory-batch.entity';

/**
 * 销售模块
 * 包含销售订单、发退货管理等核心功能
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      // 销售相关实体
      SaleOrder,
      SaleOrderItem,
      DeliveryNote,
      DeliveryNoteItem,
      SaleReturn,
      // 依赖模块实体
      ProductColorVariant,
      InventoryBatch,
    ]),
  ],
  controllers: [
    SaleOrderController,
    DeliveryController,
    SaleReturnController,
  ],
  providers: [
    SaleOrderService,
    DeliveryService,
    SaleReturnService,
  ],
  exports: [
    SaleOrderService,
    DeliveryService,
    SaleReturnService,
  ],
})
export class SalesModule {}
