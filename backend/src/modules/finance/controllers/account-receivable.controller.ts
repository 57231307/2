/**
 * 应收款控制器
 * 提供应收款的RESTful API
 */
import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AccountReceivableService } from '../services/account-receivable.service';
import { GenerateReceivableDto, QueryReceivableDto, RecordReceivablePaymentDto, ReconcileDto } from '../dto';

/**
 * 应收款控制器
 */
@Controller('api/v1/account-receivables')
export class AccountReceivableController {
  constructor(private readonly receivableService: AccountReceivableService) {}

  /**
   * 生成应收
   * POST /api/v1/account-receivables/generate
   */
  @Post('generate')
  async generate(@Body() data: GenerateReceivableDto) {
    const result = await this.receivableService.generateFromDelivery(data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 查询应收列表
   * GET /api/v1/account-receivables
   */
  @Get()
  async findAll(@Query() query: QueryReceivableDto) {
    const result = await this.receivableService.findReceivables(query);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * 获取应收详情
   * GET /api/v1/account-receivables/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.receivableService.getReceivableDetail(id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 收款登记
   * POST /api/v1/account-receivables/:id/payment
   */
  @Post(':id/payment')
  async recordPayment(@Param('id') id: string, @Body() data: RecordReceivablePaymentDto) {
    const result = await this.receivableService.recordPayment(id, data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 核销应收
   * POST /api/v1/account-receivables/:id/reconcile
   */
  @Post(':id/reconcile')
  async reconcile(@Param('id') id: string, @Body() data: ReconcileDto) {
    const result = await this.receivableService.reconcile(id, data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取应收款账龄报表
   * GET /api/v1/account-receivables/aging-report
   */
  @Get('aging-report')
  async getAgingReport(@Query('customerId') customerId?: string) {
    const result = await this.receivableService.getAgingReport(customerId);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取逾期预警列表
   * GET /api/v1/account-receivables/overdue-alerts
   */
  @Get('overdue-alerts')
  async getOverdueAlerts() {
    const result = await this.receivableService.getOverdueAlerts();
    return {
      success: true,
      data: result,
    };
  }
}
