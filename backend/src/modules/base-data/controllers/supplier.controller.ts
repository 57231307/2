import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SupplierService } from '../services/supplier.service';
import { Supplier } from '../entities/supplier.entity';
import { CreateSupplierDto } from '../services/dto/create-supplier.dto';
import { UpdateSupplierDto } from '../services/dto/update-supplier.dto';
import { QuerySupplierDto } from '../services/dto/query-supplier.dto';

@ApiTags('供应商管理')
@Controller('api/v1/suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @ApiOperation({ summary: '创建供应商' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() data: CreateSupplierDto): Promise<Supplier> {
    return this.supplierService.create(data);
  }

  @Get()
  @ApiOperation({ summary: '获取供应商列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: QuerySupplierDto): Promise<{ data: Supplier[]; total: number; page: number; limit: number }> {
    return this.supplierService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取供应商详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string): Promise<Supplier> {
    return this.supplierService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新供应商' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Param('id') id: string, @Body() data: UpdateSupplierDto): Promise<Supplier> {
    return this.supplierService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除供应商' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.supplierService.remove(id);
  }
}
