import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SaleReturnService } from '../services/sale-return.service';
import { SaleReturn } from '../entities';
import { CreateSaleReturnDto, QuerySaleReturnDto } from '../dto';

/**
 * 销售退货控制器
 */
@ApiTags('销售退货管理')
@Controller('api/v1/sale-returns')
export class SaleReturnController {
  constructor(private readonly saleReturnService: SaleReturnService) {}

  /**
   * 创建退货单
   */
  @Post()
  @ApiOperation({ summary: '创建退货单' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createReturn(@Body() data: CreateSaleReturnDto): Promise<SaleReturn> {
    return this.saleReturnService.createReturn(data);
  }

  /**
   * 查询退货列表
   */
  @Get()
  @ApiOperation({ summary: '查询退货列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findReturns(
    @Query() query: QuerySaleReturnDto,
  ): Promise<{ data: SaleReturn[]; total: number; page: number; limit: number }> {
    return this.saleReturnService.findReturns(query);
  }

  /**
   * 获取退货详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取退货详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getReturnDetail(@Param('id') id: string): Promise<SaleReturn> {
    return this.saleReturnService.getReturnDetail(id);
  }

  /**
   * 处理退货
   */
  @Post(':id/process')
  @ApiOperation({ summary: '处理退货（增加库存）' })
  @ApiResponse({ status: 200, description: '处理成功' })
  async processReturn(
    @Param('id') id: string,
    @Body('processorId') processorId: string,
  ): Promise<SaleReturn> {
    return this.saleReturnService.processReturn(id, processorId);
  }
}
