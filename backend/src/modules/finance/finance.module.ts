/**
 * 财务模块
 * 提供应收、应付和收付款的完整功能
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { 
  AccountReceivableController, 
  AccountPayableController, 
  PaymentController,
  CostAccountingController,
  CostVarianceController,
  FinancialReportController
} from './controllers';
import { 
  AccountReceivableService, 
  AccountPayableService, 
  PaymentService,
  CostAccountingService,
  CostVarianceService,
  FinancialReportService
} from './services';
import { AccountReceivable, AccountPayable, Payment, CostVariance } from './entities';
import { ProductionOrder } from '../production/entities/production-order.entity';
import { ProductionReceipt, ProductionReceiptItem } from '../production/entities';
import { MaterialRequisition } from '../production/entities/material-requisition.entity';
import { MaterialRequisitionItem } from '../production/entities/material-requisition-item.entity';
import { GoodsReceipt, GoodsReceiptItem } from '../purchase/entities';
import { InventoryBatch } from '../inventory/entities/inventory-batch.entity';
import { SaleOrder, SaleOrderItem } from '../sales/entities';
import { PurchaseOrder, PurchaseOrderItem } from '../purchase/entities';

/**
 * 财务模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountReceivable, 
      AccountPayable, 
      Payment,
      CostVariance,
      ProductionOrder,
      ProductionReceipt,
      ProductionReceiptItem,
      MaterialRequisition,
      MaterialRequisitionItem,
      GoodsReceipt,
      GoodsReceiptItem,
      InventoryBatch,
      SaleOrder,
      SaleOrderItem,
      PurchaseOrder,
      PurchaseOrderItem,
    ]),
  ],
  controllers: [
    AccountReceivableController, 
    AccountPayableController, 
    PaymentController,
    CostAccountingController,
    CostVarianceController,
    FinancialReportController
  ],
  providers: [
    AccountReceivableService, 
    AccountPayableService, 
    PaymentService,
    CostAccountingService,
    CostVarianceService,
    FinancialReportService
  ],
  exports: [
    AccountReceivableService, 
    AccountPayableService, 
    PaymentService,
    CostAccountingService,
    CostVarianceService,
    FinancialReportService
  ],
})
export class FinanceModule {}
