import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from '../base-data/entities/warehouse.entity';
import { InventoryBatch } from './entities/inventory-batch.entity';
import { InventoryCheck } from './entities/inventory-check.entity';
import { InventoryCheckItem } from './entities/inventory-check-item.entity';
import { InventoryTransfer } from './entities/inventory-transfer.entity';
import { InventoryTransferItem } from './entities/inventory-transfer-item.entity';
import { WarehouseService, BatchService } from './services/inventory.service';
import { InventoryCheckService } from './services/inventory-check.service';
import { InventoryTransferService } from './services/inventory-transfer.service';
import { WarehouseController, BatchController, InventoryController } from './controllers/inventory.controller';
import { InventoryCheckController } from './controllers/inventory-check.controller';
import { InventoryAlertController } from './controllers/inventory-alert.controller';
import { InventoryTransferController } from './controllers/inventory-transfer.controller';
import { ProductModule } from '../product/product.module';
import { BaseDataModule } from '../base-data/base-data.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryBatch,
      InventoryCheck,
      InventoryCheckItem,
      InventoryTransfer,
      InventoryTransferItem,
    ]),
    ProductModule,
    BaseDataModule,
  ],
  providers: [WarehouseService, BatchService, InventoryCheckService, InventoryTransferService],
  controllers: [
    WarehouseController,
    BatchController,
    InventoryController,
    InventoryCheckController,
    InventoryAlertController,
    InventoryTransferController,
  ],
  exports: [TypeOrmModule, WarehouseService, BatchService, InventoryCheckService, InventoryTransferService],
})
export class InventoryModule {}
