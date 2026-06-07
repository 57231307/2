/**
 * 成本核算控制器
 * 提供成本计算和差异分析的RESTful API
 */
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CostAccountingService } from '../services/cost-accounting.service';

/**
 * 成本核算控制器
 */
@Controller('api/v1/cost-accounting')
export class CostAccountingController {
  constructor(private readonly costAccountingService: CostAccountingService) {}

  /**
   * 计算实际成本
   * POST /api/v1/cost-accounting/calculate
   */
  @Post('calculate')
  async calculateActualCost(@Body() body: { orderId: string }) {
    const result = await this.costAccountingService.calculateActualCost(body.orderId);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取成本差异分析
   * GET /api/v1/cost-accounting/variance/:orderId
   */
  @Get('variance/:orderId')
  async getCostVariance(@Param('orderId') orderId: string) {
    const result = await this.costAccountingService.getCostVariance(orderId);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取生产成本报表
   * GET /api/v1/cost-accounting/report/:productionOrderId
   */
  @Get('report/:productionOrderId')
  async getCostReport(@Param('productionOrderId') productionOrderId: string) {
    const result = await this.costAccountingService.getCostReport(productionOrderId);
    return {
      success: true,
      data: result,
    };
  }
}
