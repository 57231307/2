import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Customer } from './entities/customer.entity';
import { Supplier } from './entities/supplier.entity';
import { Warehouse } from './entities/warehouse.entity';
import { SupplierService } from './services/supplier.service';
import { SupplierController } from './controllers/supplier.controller';
import { CustomerService } from './services/customer.service';
import { CustomerController } from './controllers/customer.controller';
import { WarehouseService } from './services/warehouse.service';
import { WarehouseController } from './controllers/warehouse.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Customer, Supplier, Warehouse]),
  ],
  controllers: [SupplierController, CustomerController, WarehouseController],
  providers: [SupplierService, CustomerService, WarehouseService],
  exports: [TypeOrmModule, SupplierService, CustomerService, WarehouseService],
})
export class BaseDataModule {}
