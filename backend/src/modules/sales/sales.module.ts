import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleOrder, SaleOrderItem, DeliveryNote, DeliveryNoteItem, SaleReturn, SaleQuotation, SaleQuotationItem } from './entities';
import { SaleOrderService, DeliveryService, SaleReturnService, SaleQuotationService } from './services';
import { SaleOrderController, DeliveryController, SaleReturnController, SaleQuotationController } from './controllers';
import { ProductColorVariant } from '../product/entities/product-color-variant.entity';
import { InventoryBatch } from '../inventory/entities/inventory-batch.entity';

/**
 * 销售模块
 * 包含销售订单、发退货管理、报价单管理等核心功能
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
      SaleQuotation,
      SaleQuotationItem,
      // 依赖模块实体
      ProductColorVariant,
      InventoryBatch,
    ]),
  ],
  controllers: [
    SaleOrderController,
    DeliveryController,
    SaleReturnController,
    SaleQuotationController,
  ],
  providers: [
    SaleOrderService,
    DeliveryService,
    SaleReturnService,
    SaleQuotationService,
  ],
  exports: [
    SaleOrderService,
    DeliveryService,
    SaleReturnService,
    SaleQuotationService,
  ],
})
export class SalesModule {}
