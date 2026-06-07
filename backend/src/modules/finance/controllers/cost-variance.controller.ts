/**
 * 成本差异分析控制器
 */
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CostVarianceService, CreateCostVarianceDto, QueryCostVarianceDto } from '../services/cost-variance.service';

/**
 * 成本差异分析控制器
 */
@Controller('api/v1/cost-variances')
export class CostVarianceController {
  constructor(private readonly costVarianceService: CostVarianceService) {}

  /**
   * 创建成本差异分析
   */
  @Post()
  async create(@Body() dto: CreateCostVarianceDto) {
    return this.costVarianceService.create(dto);
  }

  /**
   * 查询成本差异分析列表
   */
  @Get()
  async findAll(
    @Query() query: QueryCostVarianceDto,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.costVarianceService.findAll(query, parseInt(page, 10), parseInt(limit, 10));
  }

  /**
   * 获取分析详情
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.costVarianceService.findOne(id);
  }

  /**
   * 按订单查询差异分析
   */
  @Get('by-order/:orderId')
  async findByOrder(@Param('orderId') orderId: string) {
    return this.costVarianceService.findByOrderId(orderId);
  }

  /**
   * 按工单查询差异分析
   */
  @Get('by-work-order/:workOrderId')
  async findByWorkOrder(@Param('workOrderId') workOrderId: string) {
    return this.costVarianceService.findByWorkOrderId(workOrderId);
  }

  /**
   * 更新成本差异分析
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateCostVarianceDto>) {
    return this.costVarianceService.update(id, dto);
  }

  /**
   * 删除成本差异分析
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.costVarianceService.remove(id);
  }
}
