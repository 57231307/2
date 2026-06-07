import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { SupplierEvaluationService } from '../services/supplier-evaluation.service';
import { CreateSupplierEvaluationDto, UpdateSupplierEvaluationDto, QuerySupplierEvaluationDto } from '../dto/supplier-evaluation.dto';

/**
 * 供应商评估控制器
 */
@Controller('api/v1/supplier-evaluations')
export class SupplierEvaluationController {
  constructor(private readonly evaluationService: SupplierEvaluationService) {}

  /**
   * 创建供应商评估
   */
  @Post()
  async create(@Body() dto: CreateSupplierEvaluationDto) {
    return this.evaluationService.create(dto);
  }

  /**
   * 查询供应商评估列表
   */
  @Get()
  async findAll(
    @Query() query: QuerySupplierEvaluationDto,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.evaluationService.findAll(query, parseInt(page, 10), parseInt(limit, 10));
  }

  /**
   * 获取供应商评估详情
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.evaluationService.findOne(id);
  }

  /**
   * 更新供应商评估
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSupplierEvaluationDto) {
    return this.evaluationService.update(id, dto);
  }

  /**
   * 获取供应商的评分记录
   */
  @Get('supplier/:supplierId')
  async getSupplierScores(@Param('supplierId') supplierId: string) {
    return this.evaluationService.getSupplierScores(supplierId);
  }

  /**
   * 获取供应商的平均评分
   */
  @Get('supplier/:supplierId/average')
  async getSupplierAverageScores(@Param('supplierId') supplierId: string) {
    return this.evaluationService.getSupplierAverageScores(supplierId);
  }
}
