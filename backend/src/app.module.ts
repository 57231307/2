import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AuthModule } from './modules/auth/auth.module';
import { BaseDataModule } from './modules/base-data/base-data.module';
import { SystemModule } from './modules/system/system.module';
import { CustomerModule } from './modules/customer/customer.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { ProductModule } from './modules/product/product.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ProductionModule } from './modules/production/production.module';
import { Product } from './modules/base-data/entities/product.entity';
import { Customer } from './modules/base-data/entities/customer.entity';
import { Supplier } from './modules/base-data/entities/supplier.entity';
import { Warehouse } from './modules/base-data/entities/warehouse.entity';
import { User } from './modules/system/entities/user.entity';
import { Role } from './modules/system/entities/role.entity';
import { Permission } from './modules/system/entities/permission.entity';
import { ProductColorVariant } from './modules/product/entities/product-color-variant.entity';
import { Warehouse as InventoryWarehouse } from './modules/inventory/entities/warehouse.entity';
import { InventoryBatch } from './modules/inventory/entities/inventory-batch.entity';
import { ProductionOrder } from './modules/production/entities/production-order.entity';
import { ProductionOrderItem } from './modules/production/entities/production-order-item.entity';
import { MaterialRequisition } from './modules/production/entities/material-requisition.entity';
import { MaterialRequisitionItem } from './modules/production/entities/material-requisition-item.entity';
import { ProductionReceipt } from './modules/production/entities/production-receipt.entity';
import { ProductionReceiptItem } from './modules/production/entities/production-receipt-item.entity';
import { SalesModule } from './modules/sales/sales.module';
import { SaleOrder, SaleOrderItem, DeliveryNote, DeliveryNoteItem, SaleReturn } from './modules/sales/entities';
import { QualityModule } from './modules/quality/quality.module';
import { QualityStandard, QualityInspection, QualityInspectionItem } from './modules/quality/entities';
import { FinanceModule } from './modules/finance/finance.module';
import { AccountReceivable, AccountPayable, Payment } from './modules/finance/entities';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { PurchaseOrder, PurchaseOrderItem } from './modules/purchase/entities';
import { GoodsReceipt, GoodsReceiptItem } from './modules/purchase/entities';
import { ColorFormulaModule } from './modules/color-formula/color-formula.module';
import { ColorFormula, ColorFormulaItem, ColorDifference } from './modules/color-formula/entities';
import { PatternModule } from './modules/pattern/pattern.module';
import { Pattern, PatternCopyright } from './modules/pattern/entities';

/**
 * 应用模块
 * 主入口模块，导入所有子模块
 */
@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // 日志模块
    WinstonModule.forRoot({
      level: 'info',
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              return `${timestamp} [${level}]: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta) : ''
              }`;
            }),
          ),
        }),
      ],
    }),
    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'fabric_erp'),
        // 连接池配置
        extra: {
          max: configService.get<number>('DB_POOL_MAX', 20),
          min: configService.get<number>('DB_POOL_MIN', 5),
        },
        // 时区配置
        timezone: 'Asia/Shanghai',
        // 自动同步
        synchronize: configService.get('NODE_ENV') !== 'production',
        // 日志配置
        logging: configService.get('NODE_ENV') !== 'production',
        entities: [
          Product,
          Customer,
          Supplier,
          Warehouse,
          User,
          Role,
          Permission,
          ProductColorVariant,
          InventoryWarehouse,
          InventoryBatch,
          ProductionOrder,
          ProductionOrderItem,
          MaterialRequisition,
          MaterialRequisitionItem,
          ProductionReceipt,
          ProductionReceiptItem,
          SaleOrder,
          SaleOrderItem,
          DeliveryNote,
          DeliveryNoteItem,
          SaleReturn,
          QualityStandard,
          QualityInspection,
          QualityInspectionItem,
          AccountReceivable,
          AccountPayable,
          Payment,
          PurchaseOrder,
          PurchaseOrderItem,
          GoodsReceipt,
          GoodsReceiptItem,
          ColorFormula,
          ColorFormulaItem,
          ColorDifference,
          Pattern,
          PatternCopyright,
        ],
      }),
      inject: [ConfigService],
    }),
    // 业务模块
    AuthModule,
    BaseDataModule,
    SystemModule,
    CustomerModule,
    SupplierModule,
    ProductModule,
    InventoryModule,
    ProductionModule,
    SalesModule,
    QualityModule,
    FinanceModule,
    PurchaseModule,
    ColorFormulaModule,
    PatternModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
