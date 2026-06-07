import { Controller, Get, Post, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InventoryTransferService } from '../services/inventory-transfer.service';
import { InventoryTransfer } from '../entities/inventory-transfer.entity';
import { CreateTransferDto, QueryTransferDto, CancelTransferDto } from '../dto/inventory-transfer.dto';

@ApiTags('库存调拨')
@Controller('api/v1/inventory-transfers')
export class InventoryTransferController {
  constructor(private readonly transferService: InventoryTransferService) {}

  @Post()
  @ApiOperation({ summary: '创建调拨单' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() data: CreateTransferDto): Promise<InventoryTransfer> {
    return this.transferService.create(data);
  }

  @Get()
  @ApiOperation({ summary: '查询调拨单列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Query() query: QueryTransferDto,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<{ data: InventoryTransfer[]; total: number; page: number; limit: number }> {
    return this.transferService.findAll(query, Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: '获取调拨单详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<InventoryTransfer> {
    return this.transferService.findOne(id);
  }

  @Post(':id/dispatch')
  @ApiOperation({ summary: '调出确认' })
  @ApiResponse({ status: 200, description: '调出成功' })
  @ApiQuery({ name: 'operator', required: false, description: '操作人' })
  @ApiQuery({ name: 'remark', required: false, description: '备注' })
  async dispatch(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('operator') operator?: string,
    @Query('remark') remark?: string,
  ): Promise<InventoryTransfer> {
    return this.transferService.dispatch(id, operator, remark);
  }

  @Post(':id/receive')
  @ApiOperation({ summary: '调入确认' })
  @ApiResponse({ status: 200, description: '收货成功' })
  @ApiQuery({ name: 'operator', required: false, description: '操作人' })
  @ApiQuery({ name: 'remark', required: false, description: '备注' })
  async receive(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('operator') operator?: string,
    @Query('remark') remark?: string,
  ): Promise<InventoryTransfer> {
    return this.transferService.receive(id, operator, remark);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '取消调拨单' })
  @ApiResponse({ status: 200, description: '取消成功' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: CancelTransferDto,
  ): Promise<InventoryTransfer> {
    return this.transferService.cancel(id, data);
  }
}
