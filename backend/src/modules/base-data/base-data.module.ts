import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Customer } from './entities/customer.entity';
import { CustomerContact } from './entities/customer-contact.entity';
import { Supplier } from './entities/supplier.entity';
import { Warehouse } from './entities/warehouse.entity';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { CustomerService } from './services/customer.service';
import { CustomerController } from './controllers/customer.controller';
import { CustomerContactService } from './services/customer-contact.service';
import { CustomerContactController } from './controllers/customer-contact.controller';
import { SupplierService } from './services/supplier.service';
import { SupplierController } from './controllers/supplier.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Customer, CustomerContact, Supplier, Warehouse])],
  providers: [ProductService, CustomerService, CustomerContactService, SupplierService],
  controllers: [ProductController, CustomerController, CustomerContactController, SupplierController],
  exports: [TypeOrmModule, ProductService, CustomerService, CustomerContactService, SupplierService],
})
export class BaseDataModule {}
