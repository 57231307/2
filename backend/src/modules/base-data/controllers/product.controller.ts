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
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductType, ProductStatus } from '../entities/product.entity';

/**
 * 产品查询参数 DTO
 */
class ProductQueryDto {
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @Query('page', new DefaultValuePipe(1), ParseIntPipe)
  page: number;

  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量', example: 10 })
  @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
  pageSize: number;

  @ApiQuery({ name: 'type', required: false, description: '产品类型', enum: ProductType })
  @Query('type')
  type?: ProductType;

  @ApiQuery({ name: 'status', required: false, description: '产品状态', enum: ProductStatus })
  @Query('status')
  status?: ProductStatus;

  @ApiQuery({ name: 'keyword', required: false, description: '关键词搜索（名称/编码/规格）' })
  @Query('keyword')
  keyword?: string;

  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段', example: 'createdAt' })
  @Query('sortBy')
  sortBy?: string;

  @ApiQuery({ name: 'sortOrder', required: false, description: '排序方向', enum: ['ASC', 'DESC'] })
  @Query('sortOrder')
  sortOrder?: 'ASC' | 'DESC';
}

@ApiTags('产品管理')
@Controller({ path: 'products', version: '1' })
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建产品' })
  @ApiResponse({ status: 201, description: '产品创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '产品编码已存在' })
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productService.create(createProductDto);
    return {
      message: '产品创建成功',
      data: product,
    };
  }

  @Get()
  @ApiOperation({ summary: '获取产品列表（分页）' })
  @ApiResponse({ status: 200, description: '获取产品列表成功' })
  async findAll(@Query() query: ProductQueryDto) {
    const result = await this.productService.findAll({
      page: query.page,
      pageSize: query.pageSize,
      type: query.type,
      status: query.status,
      keyword: query.keyword,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      message: '获取产品列表成功',
      data: result.items,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取产品详情' })
  @ApiParam({ name: 'id', description: '产品ID' })
  @ApiResponse({ status: 200, description: '获取产品详情成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const product = await this.productService.findOne(id);
    return {
      message: '获取产品详情成功',
      data: product,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新产品' })
  @ApiParam({ name: 'id', description: '产品ID' })
  @ApiResponse({ status: 200, description: '产品更新成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  @ApiResponse({ status: 409, description: '产品编码已存在' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productService.update(id, updateProductDto);
    return {
      message: '产品更新成功',
      data: product,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除产品（软删除）' })
  @ApiParam({ name: 'id', description: '产品ID' })
  @ApiResponse({ status: 200, description: '产品删除成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.productService.remove(id);
    return {
      message: '产品删除成功',
    };
  }
}
