import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Customer } from './entities/customer.entity';
import { Supplier } from './entities/supplier.entity';
import { Warehouse } from './entities/warehouse.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Customer, Supplier, Warehouse]),
  ],
  exports: [TypeOrmModule],
})
export class BaseDataModule {}
