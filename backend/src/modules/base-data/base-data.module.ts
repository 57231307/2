import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerContact } from './entities/customer-contact.entity';
import { Supplier } from './entities/supplier.entity';
import { Warehouse } from './entities/warehouse.entity';
import { CustomerService } from './services/customer.service';
import { CustomerController } from './controllers/customer.controller';
import { CustomerContactService } from './services/customer-contact.service';
import { CustomerContactController } from './controllers/customer-contact.controller';
import { SupplierService } from './services/supplier.service';
import { SupplierController } from './controllers/supplier.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, CustomerContact, Supplier, Warehouse])],
  providers: [CustomerService, CustomerContactService, SupplierService],
  controllers: [CustomerController, CustomerContactController, SupplierController],
  exports: [TypeOrmModule, CustomerService, CustomerContactService, SupplierService],
})
export class BaseDataModule {}
