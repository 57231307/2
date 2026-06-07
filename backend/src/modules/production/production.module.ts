import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionOrder } from './entities/production-order.entity';
import { ProductionOrderItem } from './entities/production-order-item.entity';
import { MaterialRequisition } from './entities/material-requisition.entity';
import { MaterialRequisitionItem } from './entities/material-requisition-item.entity';
import { ProductionReceipt } from './entities/production-receipt.entity';
import { ProductionReceiptItem } from './entities/production-receipt-item.entity';
import { ProcessRoute } from './entities/process-route.entity';
import { ProcessStep } from './entities/process-step.entity';
import { WorkOrderDispatch } from './entities/work-order-dispatch.entity';
import { ProcessReport } from './entities/process-report.entity';
import { InventoryBatch } from '../inventory/entities/inventory-batch.entity';
import { ProductionOrderService } from './services/production-order.service';
import { MaterialRequisitionService } from './services/material-requisition.service';
import { ProductionReceiptService } from './services/production-receipt.service';
import { ProcessRouteService } from './services/process-route.service';
import { WorkOrderDispatchService } from './services/work-order-dispatch.service';
import { ProcessReportService } from './services/process-report.service';
import { ProductionOrderController } from './controllers/production-order.controller';
import { MaterialRequisitionController } from './controllers/material-requisition.controller';
import { ProductionReceiptController } from './controllers/production-receipt.controller';
import { ProcessRouteController } from './controllers/process-route.controller';
import { WorkOrderDispatchController } from './controllers/work-order-dispatch.controller';
import { ProcessReportController } from './controllers/process-report.controller';

/**
 * 生产管理模块
 * 负责生产工单、工艺路线、派工单、工序汇报的管理
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
      ProcessRoute,
      ProcessStep,
      WorkOrderDispatch,
      ProcessReport,
      InventoryBatch,
    ]),
  ],
  controllers: [
    ProductionOrderController,
    MaterialRequisitionController,
    ProductionReceiptController,
    ProcessRouteController,
    WorkOrderDispatchController,
    ProcessReportController,
  ],
  providers: [
    ProductionOrderService,
    MaterialRequisitionService,
    ProductionReceiptService,
    ProcessRouteService,
    WorkOrderDispatchService,
    ProcessReportService,
  ],
  exports: [
    ProductionOrderService,
    MaterialRequisitionService,
    ProductionReceiptService,
    ProcessRouteService,
    WorkOrderDispatchService,
    ProcessReportService,
  ],
})
export class ProductionModule {}
