import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionOrder } from './entities/production-order.entity';
import { ProductionOrderItem } from './entities/production-order-item.entity';
import { MaterialRequisition } from './entities/material-requisition.entity';
import { MaterialRequisitionItem } from './entities/material-requisition-item.entity';
import { ProductionReceipt } from './entities/production-receipt.entity';
import { ProductionReceiptItem } from './entities/production-receipt-item.entity';
import { InventoryBatch } from '../inventory/entities/inventory-batch.entity';
import { ProductionOrderService } from './services/production-order.service';
import { MaterialRequisitionService } from './services/material-requisition.service';
import { ProductionReceiptService } from './services/production-receipt.service';
import { ProductionOrderController } from './controllers/production-order.controller';
import { MaterialRequisitionController } from './controllers/material-requisition.controller';
import { ProductionReceiptController } from './controllers/production-receipt.controller';

/**
 * 生产管理模块
 * 负责生产工单、领料单、生产入库单的管理
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionOrder,
      ProductionOrderItem,
      MaterialRequisition,
      MaterialRequisitionItem,
      ProductionReceipt,
      ProductionReceiptItem,
      InventoryBatch,
    ]),
  ],
  controllers: [
    ProductionOrderController,
    MaterialRequisitionController,
    ProductionReceiptController,
  ],
  providers: [
    ProductionOrderService,
    MaterialRequisitionService,
    ProductionReceiptService,
  ],
  exports: [
    ProductionOrderService,
    MaterialRequisitionService,
    ProductionReceiptService,
  ],
})
export class ProductionModule {}
