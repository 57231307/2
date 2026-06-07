import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WarehouseService, BatchService } from '../services/inventory.service';
import { Warehouse } from '../entities/warehouse.entity';
import { InventoryBatch } from '../entities/inventory-batch.entity';
import { CreateWarehouseDto, UpdateWarehouseDto, QueryWarehouseDto } from '../dto/warehouse.dto';
import { CreateBatchDto, UpdateBatchDto, QueryBatchDto } from '../dto/inventory-batch.dto';
import { InboundDto, InboundResultDto } from '../dto/inbound.dto';
import { OutboundDto, OutboundResultDto } from '../dto/outbound.dto';

@ApiTags('仓库管理')
@Controller('api/v1/warehouses')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @ApiOperation({ summary: '创建仓库' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() data: CreateWarehouseDto): Promise<Warehouse> {
    return this.warehouseService.create(data);
  }

  @Get()
  @ApiOperation({ summary: '查询仓库列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Query() query: QueryWarehouseDto,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<{ data: Warehouse[]; total: number; page: number; limit: number }> {
    return this.warehouseService.findAll(query, Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: '获取仓库详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Warehouse> {
    return this.warehouseService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新仓库' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    return this.warehouseService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除仓库' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.warehouseService.remove(id);
  }
}

@ApiTags('批次管理')
@Controller('api/v1/batches')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post()
  @ApiOperation({ summary: '创建批次' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() data: CreateBatchDto): Promise<InventoryBatch> {
    return this.batchService.createBatch(data);
  }

  @Get()
  @ApiOperation({ summary: '查询批次列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Query() query: QueryBatchDto,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<{ data: InventoryBatch[]; total: number; page: number; limit: number }> {
    return this.batchService.findBatches(query, Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: '获取批次详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<InventoryBatch> {
    return this.batchService.findBatchById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新批次' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateBatchDto,
  ): Promise<InventoryBatch> {
    return this.batchService.updateBatch(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除批次' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const batch = await this.batchService.findBatchById(id);
    batch.status = 'CLOSED' as any;
    await this.batchService.updateBatch(id, { status: 'CLOSED' as any });
  }

  @Get(':id/trace')
  @ApiOperation({ summary: '匹号追溯' })
  @ApiResponse({ status: 200, description: '追溯成功' })
  async trace(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    return this.batchService.traceRollNo(id);
  }
}

@ApiTags('库存管理')
@Controller('api/v1/inventory')
export class InventoryController {
  constructor(private readonly batchService: BatchService) {}

  @Post('inbound')
  @ApiOperation({ summary: '执行入库' })
  @ApiResponse({ status: 201, description: '入库成功' })
  async inbound(@Body() data: InboundDto): Promise<InboundResultDto> {
    return this.batchService.inbound(data);
  }

  @Post('outbound')
  @ApiOperation({ summary: '执行出库' })
  @ApiResponse({ status: 200, description: '出库成功' })
  async outbound(@Body() data: OutboundDto): Promise<OutboundResultDto> {
    return this.batchService.outbound(data);
  }

  @Get('by-product/:productId')
  @ApiOperation({ summary: '按产品查询批次' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('colorVariantId') colorVariantId?: string,
  ): Promise<InventoryBatch[]> {
    return this.batchService.findByProduct(productId, colorVariantId);
  }

  @Get('by-batch/:batchNo')
  @ApiOperation({ summary: '按缸号查询匹号列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findByBatchNo(
    @Param('batchNo') batchNo: string,
    @Query('productId', ParseUUIDPipe) productId: string,
    @Query('colorVariantId', ParseUUIDPipe) colorVariantId: string,
  ): Promise<InventoryBatch[]> {
    return this.batchService.findByBatchNo(productId, colorVariantId, batchNo);
  }

  @Post('batches/:id/generate-roll-no')
  @ApiOperation({ summary: '生成匹号' })
  @ApiResponse({ status: 200, description: '生成成功' })
  async generateRollNo(@Param('id', ParseUUIDPipe) id: string): Promise<{ rollNo: string }> {
    const batch = await this.batchService.findBatchById(id);
    const rollNo = await this.batchService.generateRollNo(batch.batchNo);
    return { rollNo };
  }

  @Get('batches/generate-batch-no')
  @ApiOperation({ summary: '生成缸号' })
  @ApiResponse({ status: 200, description: '生成成功' })
  async generateBatchNo(
    @Query('productId', ParseUUIDPipe) productId: string,
    @Query('colorVariantId') colorVariantId?: string,
  ): Promise<{ batchNo: string }> {
    const batchNo = await this.batchService.generateBatchNo(productId, colorVariantId);
    return { batchNo };
  }
}