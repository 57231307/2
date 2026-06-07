import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { InventoryBatch } from './entities/inventory-batch.entity';
import { WarehouseService, BatchService } from './services/inventory.service';
import { WarehouseController, BatchController, InventoryController } from './controllers/inventory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse, InventoryBatch])],
  providers: [WarehouseService, BatchService],
  controllers: [WarehouseController, BatchController, InventoryController],
  exports: [TypeOrmModule, WarehouseService, BatchService],
})
export class InventoryModule {}