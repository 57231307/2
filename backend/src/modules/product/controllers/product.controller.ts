import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { 
  CreateProductDto, 
  UpdateProductDto, 
  QueryProductDto,
  CreateColorVariantDto,
  UpdateColorVariantDto,
} from '../dto';

/**
 * 产品控制器
 * 提供产品和颜色变体的RESTful API
 */
@Controller('api/v1/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ========== 产品API ==========

  /**
   * 创建产品
   * POST /api/v1/products
   */
  @Post()
  async create(@Body() data: CreateProductDto) {
    const result = await this.productService.create(data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 查询产品列表（分页）
   * GET /api/v1/products
   */
  @Get()
  async findAll(@Query() query: QueryProductDto) {
    const result = await this.productService.findAll(query);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * 获取产品详情（包含颜色变体列表）
   * GET /api/v1/products/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.productService.findOne(id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 更新产品
   * PUT /api/v1/products/:id
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateProductDto) {
    const result = await this.productService.update(id, data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 删除产品（软删除）
   * DELETE /api/v1/products/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.productService.remove(id);
    return {
      success: true,
    };
  }

  // ========== 颜色变体API ==========

  /**
   * 创建颜色变体
   * POST /api/v1/products/:productId/variants
   */
  @Post(':productId/variants')
  async createVariant(
    @Param('productId') productId: string,
    @Body() data: CreateColorVariantDto,
  ) {
    const result = await this.productService.createVariant(productId, data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取产品的颜色变体列表
   * GET /api/v1/products/:productId/variants
   */
  @Get(':productId/variants')
  async findVariants(@Param('productId') productId: string) {
    const result = await this.productService.findVariantsByProduct(productId);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取颜色变体详情
   * GET /api/v1/products/:productId/variants/:id
   */
  @Get(':productId/variants/:id')
  async findVariant(
    @Param('productId') productId: string,
    @Param('id') id: string,
  ) {
    const result = await this.productService.findVariantById(id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 更新颜色变体
   * PUT /api/v1/products/:productId/variants/:id
   */
  @Put(':productId/variants/:id')
  async updateVariant(
    @Param('productId') productId: string,
    @Param('id') id: string,
    @Body() data: UpdateColorVariantDto,
  ) {
    const result = await this.productService.updateVariant(id, data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 删除颜色变体
   * DELETE /api/v1/products/:productId/variants/:id
   */
  @Delete(':productId/variants/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeVariant(
    @Param('productId') productId: string,
    @Param('id') id: string,
  ) {
    await this.productService.removeVariant(id);
    return {
      success: true,
    };
  }

  /**
   * 获取颜色变体价格（用于订单）
   * GET /api/v1/products/:productId/variants/:id/price
   */
  @Get(':productId/variants/:id/price')
  async getVariantPrice(
    @Param('productId') productId: string,
    @Param('id') id: string,
  ) {
    const result = await this.productService.getVariantPrice(id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 设置默认颜色变体
   * PUT /api/v1/products/:productId/variants/:id/default
   */
  @Put(':productId/variants/:id/default')
  async setDefaultVariant(
    @Param('productId') productId: string,
    @Param('id') id: string,
  ) {
    await this.productService.setDefaultVariant(productId, id);
    return {
      success: true,
    };
  }
}