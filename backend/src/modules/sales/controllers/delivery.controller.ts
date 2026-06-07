import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DeliveryService } from '../services/delivery.service';
import { DeliveryNote } from '../entities';
import { CreateDeliveryNoteDto, QueryDeliveryNoteDto, SelectBatchDto } from '../dto';
import { InventoryBatch } from '../../inventory/entities/inventory-batch.entity';

/**
 * 发货管理控制器
 */
@ApiTags('发货管理')
@Controller('api/v1/delivery-notes')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  /**
   * 创建发货单
   */
  @Post()
  @ApiOperation({ summary: '创建发货单' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createDeliveryNote(@Body() data: CreateDeliveryNoteDto): Promise<DeliveryNote> {
    return this.deliveryService.createDeliveryNote(data);
  }

  /**
   * 查询发货单列表
   */
  @Get()
  @ApiOperation({ summary: '查询发货单列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findDeliveryNotes(
    @Query() query: QueryDeliveryNoteDto,
  ): Promise<{ data: DeliveryNote[]; total: number; page: number; limit: number }> {
    return this.deliveryService.findDeliveryNotes(query);
  }

  /**
   * 获取发货单详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取发货单详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDeliveryNoteDetail(@Param('id') id: string): Promise<DeliveryNote> {
    return this.deliveryService.getDeliveryNoteDetail(id);
  }

  /**
   * 确认发货
   */
  @Post(':id/confirm')
  @ApiOperation({ summary: '确认发货（扣减库存）' })
  @ApiResponse({ status: 200, description: '确认成功' })
  async confirmDelivery(@Param('id') id: string): Promise<DeliveryNote> {
    return this.deliveryService.confirmDelivery(id);
  }

  /**
   * 获取可选批次
   */
  @Get(':id/available-batches')
  @ApiOperation({ summary: '获取可选批次（用于选择匹号）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getAvailableBatches(
    @Param('id') orderItemId: string,
    @Query() query: SelectBatchDto,
  ): Promise<InventoryBatch[]> {
    return this.deliveryService.getAvailableBatches(orderItemId, query.quantity);
  }
}
