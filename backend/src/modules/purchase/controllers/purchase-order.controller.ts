import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, QueryPurchaseOrderDto, ApprovePurchaseOrderDto } from '../dto/purchase-order.dto';

/**
 * 采购订单控制器
 */
@Controller('api/v1/purchase-orders')
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  /**
   * 创建采购订单
   */
  @Post()
  async create(@Body() dto: CreatePurchaseOrderDto) {
    return this.purchaseOrderService.create(dto);
  }

  /**
   * 查询采购订单列表
   */
  @Get()
  async findAll(
    @Query() query: QueryPurchaseOrderDto,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.purchaseOrderService.findAll(query, parseInt(page, 10), parseInt(limit, 10));
  }

  /**
   * 获取采购订单详情
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.purchaseOrderService.findOne(id);
  }

  /**
   * 更新采购订单
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.purchaseOrderService.update(id, dto);
  }

  /**
   * 提交审批
   */
  @Post(':id/submit')
  async submitForApproval(@Param('id') id: string) {
    return this.purchaseOrderService.submitForApproval(id);
  }

  /**
   * 审批通过
   */
  @Post(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body() dto: ApprovePurchaseOrderDto,
  ) {
    return this.purchaseOrderService.approve(id, '', dto);
  }

  /**
   * 审批拒绝
   */
  @Post(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body() dto: ApprovePurchaseOrderDto,
  ) {
    return this.purchaseOrderService.reject(id, '', dto);
  }

  /**
   * 取消订单
   */
  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.purchaseOrderService.cancel(id);
  }
}
