import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SaleOrderService } from '../services/sale-order.service';
import { SaleOrder } from '../entities';
import { CreateSaleOrderDto, UpdateSaleOrderDto, QuerySaleOrderDto, ApprovalDto } from '../dto';

/**
 * 销售订单控制器
 */
@ApiTags('销售订单管理')
@Controller('api/v1/sales-orders')
export class SaleOrderController {
  constructor(private readonly saleOrderService: SaleOrderService) {}

  /**
   * 创建销售订单
   */
  @Post()
  @ApiOperation({ summary: '创建销售订单' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() data: CreateSaleOrderDto): Promise<SaleOrder> {
    return this.saleOrderService.create(data);
  }

  /**
   * 查询订单列表
   */
  @Get()
  @ApiOperation({ summary: '查询订单列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Query() query: QuerySaleOrderDto): Promise<{ data: SaleOrder[]; total: number; page: number; limit: number }> {
    return this.saleOrderService.findAll(query);
  }

  /**
   * 获取订单详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string): Promise<SaleOrder> {
    return this.saleOrderService.findOne(id);
  }

  /**
   * 更新订单
   */
  @Put(':id')
  @ApiOperation({ summary: '更新订单' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Param('id') id: string, @Body() data: UpdateSaleOrderDto): Promise<SaleOrder> {
    return this.saleOrderService.update(id, data);
  }

  /**
   * 提交审批
   */
  @Post(':id/submit')
  @ApiOperation({ summary: '提交订单审批' })
  @ApiResponse({ status: 200, description: '提交成功' })
  async submitForApproval(@Param('id') id: string): Promise<SaleOrder> {
    return this.saleOrderService.submitForApproval(id);
  }

  /**
   * 审批通过
   */
  @Post(':id/approve')
  @ApiOperation({ summary: '审批通过' })
  @ApiResponse({ status: 200, description: '审批成功' })
  async approve(
    @Param('id') id: string,
    @Body('approverId') approverId: string,
    @Body() data?: ApprovalDto,
  ): Promise<SaleOrder> {
    return this.saleOrderService.approve(id, approverId, data);
  }

  /**
   * 审批驳回
   */
  @Post(':id/reject')
  @ApiOperation({ summary: '审批驳回' })
  @ApiResponse({ status: 200, description: '驳回成功' })
  async reject(
    @Param('id') id: string,
    @Body('approverId') approverId: string,
    @Body() data?: ApprovalDto,
  ): Promise<SaleOrder> {
    return this.saleOrderService.reject(id, approverId, data);
  }

  /**
   * 取消订单
   */
  @Post(':id/cancel')
  @ApiOperation({ summary: '取消订单' })
  @ApiResponse({ status: 200, description: '取消成功' })
  async cancel(@Param('id') id: string): Promise<SaleOrder> {
    return this.saleOrderService.cancel(id);
  }
}
