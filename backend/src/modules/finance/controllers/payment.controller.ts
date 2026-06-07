/**
 * 收付款控制器
 * 提供收付款记录的RESTful API
 */
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto, QueryPaymentDto } from '../dto';

/**
 * 收付款控制器
 */
@Controller('api/v1/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * 创建收付款
   * POST /api/v1/payments
   */
  @Post()
  async create(@Body() data: CreatePaymentDto) {
    const result = await this.paymentService.createPayment(data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 查询收付款列表
   * GET /api/v1/payments
   */
  @Get()
  async findAll(@Query() query: QueryPaymentDto) {
    const result = await this.paymentService.findPayments(query);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * 获取收付款详情
   * GET /api/v1/payments/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.paymentService.getPaymentDetail(id);
    return {
      success: true,
      data: result,
    };
  }
}
