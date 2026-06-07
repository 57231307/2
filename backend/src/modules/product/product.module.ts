import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';
import { Product, ProductColorVariant } from './entities';

/**
 * 产品模块
 * 包含产品和颜色变体的完整功能
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductColorVariant]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}