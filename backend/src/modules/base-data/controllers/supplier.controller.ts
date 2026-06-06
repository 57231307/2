import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
import { SupplierService, PaginatedResult } from '../services/supplier.service';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { Supplier, SupplierStatus } from '../entities/supplier.entity';

@ApiTags('供应商管理')
@Controller({ path: 'suppliers', version: '1' })
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @ApiOperation({ summary: '创建供应商' })
  @ApiResponse({ status: 201, description: '供应商创建成功' })
  @ApiResponse({ status: 409, description: '供应商编码已存在' })
  async create(@Body() createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    return this.supplierService.create(createSupplierDto);
  }

  @Get()
  @ApiOperation({ summary: '获取供应商列表（分页）' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: '排序方向', enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'keyword', required: false, description: '搜索关键词（匹配名称）' })
  @ApiQuery({ name: 'type', required: false, description: '供应商类型' })
  @ApiQuery({ name: 'status', required: false, description: '供应商状态', enum: SupplierStatus })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('sortOrder', new DefaultValuePipe('DESC')) sortOrder: 'ASC' | 'DESC',
    @Query('keyword') keyword?: string,
    @Query('type') type?: string,
    @Query('status') status?: SupplierStatus,
  ): Promise<PaginatedResult<Supplier>> {
    return this.supplierService.findAll(
      { page, limit, sortBy, sortOrder },
      { keyword, type, status },
    );
  }

  @Get('code')
  @ApiOperation({ summary: '生成供应商编码' })
  @ApiResponse({ status: 200, description: '编码生成成功' })
  async generateCode(): Promise<{ code: string }> {
    const code = await this.supplierService.generateCode();
    return { code };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取供应商详情' })
  @ApiParam({ name: 'id', description: '供应商ID', type: 'string' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '供应商不存在' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Supplier> {
    return this.supplierService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新供应商' })
  @ApiParam({ name: 'id', description: '供应商ID', type: 'string' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '供应商不存在' })
  @ApiResponse({ status: 409, description: '供应商编码已被使用' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    return this.supplierService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除供应商（软删除）' })
  @ApiParam({ name: 'id', description: '供应商ID', type: 'string' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '供应商不存在' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.supplierService.remove(id);
    return { message: '供应商删除成功' };
  }
}
