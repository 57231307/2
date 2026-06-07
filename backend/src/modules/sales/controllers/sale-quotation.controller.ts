import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SaleQuotationService } from '../services/sale-quotation.service';
import { SaleQuotation, SaleOrder } from '../entities';
import { CreateSaleQuotationDto, UpdateSaleQuotationDto, QuerySaleQuotationDto } from '../dto';

/**
 * 销售报价单控制器
 */
@ApiTags('销售报价单管理')
@Controller('api/v1/sale-quotations')
export class SaleQuotationController {
  constructor(private readonly saleQuotationService: SaleQuotationService) {}

  /**
   * 创建报价单
   */
  @Post()
  @ApiOperation({ summary: '创建报价单' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() data: CreateSaleQuotationDto): Promise<SaleQuotation> {
    return this.saleQuotationService.create(data);
  }

  /**
   * 查询报价单列表
   */
  @Get()
  @ApiOperation({ summary: '查询报价单列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Query() query: QuerySaleQuotationDto): Promise<{ data: SaleQuotation[]; total: number; page: number; limit: number }> {
    return this.saleQuotationService.findAll(query);
  }

  /**
   * 获取报价单详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取报价单详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string): Promise<SaleQuotation> {
    return this.saleQuotationService.findOne(id);
  }

  /**
   * 更新报价单
   */
  @Put(':id')
  @ApiOperation({ summary: '更新报价单' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Param('id') id: string, @Body() data: UpdateSaleQuotationDto): Promise<SaleQuotation> {
    return this.saleQuotationService.update(id, data);
  }

  /**
   * 确认报价单
   */
  @Post(':id/confirm')
  @ApiOperation({ summary: '确认报价单' })
  @ApiResponse({ status: 200, description: '确认成功' })
  async confirm(@Param('id') id: string): Promise<SaleQuotation> {
    return this.saleQuotationService.confirm(id);
  }

  /**
   * 报价单转订单
   */
  @Post(':id/convert-to-order')
  @ApiOperation({ summary: '报价单转订单' })
  @ApiResponse({ status: 201, description: '转化成功' })
  async convertToOrder(@Param('id') id: string): Promise<SaleOrder> {
    return this.saleQuotationService.convertToOrder(id);
  }

  /**
   * 取消报价单
   */
  @Post(':id/cancel')
  @ApiOperation({ summary: '取消报价单' })
  @ApiResponse({ status: 200, description: '取消成功' })
  async cancel(@Param('id') id: string): Promise<SaleQuotation> {
    return this.saleQuotationService.cancel(id);
  }
}
