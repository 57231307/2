import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseDataModule } from './modules/base-data/base-data.module';
import { SystemModule } from './modules/system/system.module';
import { Product } from './modules/base-data/entities/product.entity';
import { Customer } from './modules/base-data/entities/customer.entity';
import { Supplier } from './modules/base-data/entities/supplier.entity';
import { Warehouse } from './modules/base-data/entities/warehouse.entity';
import { User } from './modules/system/entities/user.entity';
import { Role } from './modules/system/entities/role.entity';
import { Permission } from './modules/system/entities/permission.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'fabric_erp'),
        entities: [Product, Customer, Supplier, Warehouse, User, Role, Permission],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    BaseDataModule,
    SystemModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
