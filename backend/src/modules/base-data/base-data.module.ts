import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Customer } from './entities/customer.entity';
import { Supplier } from './entities/supplier.entity';
import { Warehouse } from './entities/warehouse.entity';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { CustomerService } from './services/customer.service';
import { CustomerController } from './controllers/customer.controller';
import { SupplierService } from './services/supplier.service';
import { SupplierController } from './controllers/supplier.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Customer, Supplier, Warehouse])],
  providers: [ProductService, CustomerService, SupplierService],
  controllers: [ProductController, CustomerController, SupplierController],
  exports: [TypeOrmModule, ProductService, CustomerService, SupplierService],
})
export class BaseDataModule {}
