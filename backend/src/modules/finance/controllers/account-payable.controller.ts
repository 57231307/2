/**
 * 应付款控制器
 * 提供应付款的RESTful API
 */
import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AccountPayableService } from '../services/account-payable.service';
import { GeneratePayableDto, QueryPayableDto, RecordPayablePaymentDto, ReconcileDto } from '../dto';

/**
 * 应付款控制器
 */
@Controller('api/v1/account-payables')
export class AccountPayableController {
  constructor(private readonly payableService: AccountPayableService) {}

  /**
   * 生成应付
   * POST /api/v1/account-payables/generate
   */
  @Post('generate')
  async generate(@Body() data: GeneratePayableDto) {
    const result = await this.payableService.generateFromReceipt(data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 查询应付列表
   * GET /api/v1/account-payables
   */
  @Get()
  async findAll(@Query() query: QueryPayableDto) {
    const result = await this.payableService.findPayables(query);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * 获取应付详情
   * GET /api/v1/account-payables/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.payableService.getPayableDetail(id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 付款登记
   * POST /api/v1/account-payables/:id/payment
   */
  @Post(':id/payment')
  async recordPayment(@Param('id') id: string, @Body() data: RecordPayablePaymentDto) {
    const result = await this.payableService.recordPayment(id, data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 核销应付
   * POST /api/v1/account-payables/:id/reconcile
   */
  @Post(':id/reconcile')
  async reconcile(@Param('id') id: string, @Body() data: ReconcileDto) {
    const result = await this.payableService.reconcile(id, data);
    return {
      success: true,
      data: result,
    };
  }
}
