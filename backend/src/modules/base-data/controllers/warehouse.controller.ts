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
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WarehouseService } from '../services/warehouse.service';
import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';
import { WarehouseStatus } from '../entities/warehouse.entity';
import { PaginationOptions, WarehouseFilters, PaginatedResult } from '../services/warehouse.service';
import { Warehouse } from '../entities/warehouse.entity';

@ApiTags('仓库管理')
@ApiBearerAuth()
@Controller({ path: 'warehouses', version: '1' })
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @ApiOperation({ summary: '创建仓库' })
  @ApiResponse({
    status: 201,
    description: '仓库创建成功',
    type: Warehouse,
  })
  @ApiResponse({ status: 409, description: '仓库编码已存在' })
  async create(@Body() createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    return this.warehouseService.create(createWarehouseDto);
  }

  @Get()
  @ApiOperation({ summary: '获取仓库列表（分页）' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: '排序方向', enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'code', required: false, description: '仓库编码（模糊查询）' })
  @ApiQuery({ name: 'name', required: false, description: '仓库名称（模糊查询）' })
  @ApiQuery({ name: 'type', required: false, description: '仓库类型' })
  @ApiQuery({ name: 'status', required: false, description: '仓库状态', enum: WarehouseStatus })
  @ApiQuery({ name: 'isActive', required: false, description: '是否启用' })
  @ApiResponse({
    status: 200,
    description: '获取仓库列表成功',
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
    @Query('sortOrder', new DefaultValuePipe('DESC')) sortOrder: 'ASC' | 'DESC',
    @Query('code') code?: string,
    @Query('name') name?: string,
    @Query('type') type?: string,
    @Query('status') status?: WarehouseStatus,
    @Query('isActive', new DefaultValuePipe(undefined), ParseBoolPipe) isActive?: boolean,
  ): Promise<PaginatedResult<Warehouse>> {
    const options: PaginationOptions = {
      page,
      limit: Math.min(limit, 100), // 限制最大每页数量
      sortBy,
      sortOrder,
    };

    const filters: WarehouseFilters = {
      code,
      name,
      type,
      status,
      isActive,
    };

    return this.warehouseService.findAll(options, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取仓库详情' })
  @ApiParam({ name: 'id', description: '仓库ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: '获取仓库详情成功',
    type: Warehouse,
  })
  @ApiResponse({ status: 404, description: '仓库不存在' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Warehouse> {
    return this.warehouseService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新仓库' })
  @ApiParam({ name: 'id', description: '仓库ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: '仓库更新成功',
    type: Warehouse,
  })
  @ApiResponse({ status: 404, description: '仓库不存在' })
  @ApiResponse({ status: 409, description: '仓库编码已被其他仓库使用' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    return this.warehouseService.update(id, updateWarehouseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除仓库（软删除）' })
  @ApiParam({ name: 'id', description: '仓库ID', type: 'string' })
  @ApiResponse({ status: 200, description: '仓库删除成功' })
  @ApiResponse({ status: 404, description: '仓库不存在' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.warehouseService.remove(id);
    return { message: '仓库删除成功' };
  }

  @Get('code/generate')
  @ApiOperation({ summary: '自动生成仓库编码' })
  @ApiResponse({
    status: 200,
    description: '生成仓库编码成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'WH-20240101-0001' },
      },
    },
  })
  async generateCode(): Promise<{ code: string }> {
    const code = await this.warehouseService.generateCode();
    return { code };
  }

  @Get('code/check')
  @ApiOperation({ summary: '检查仓库编码是否可用' })
  @ApiQuery({ name: 'code', required: true, description: '仓库编码' })
  @ApiQuery({ name: 'excludeId', required: false, description: '排除的仓库ID' })
  @ApiResponse({
    status: 200,
    description: '检查仓库编码是否可用',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean' },
      },
    },
  })
  async checkCode(
    @Query('code') code: string,
    @Query('excludeId', ParseUUIDPipe) excludeId?: string,
  ): Promise<{ available: boolean }> {
    const available = await this.warehouseService.isCodeAvailable(code, excludeId);
    return { available };
  }
}
