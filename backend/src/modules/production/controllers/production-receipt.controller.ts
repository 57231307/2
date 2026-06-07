import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ProductionReceiptService } from '../services/production-receipt.service';
import { CreateProductionReceiptDto, GenerateBatchDto, ConfirmReceiptDto, QueryProductionReceiptDto } from '../dto/production-receipt.dto';

/**
 * 生产入库控制器
 */
@Controller('api/v1/production-receipts')
export class ProductionReceiptController {
  constructor(private readonly productionReceiptService: ProductionReceiptService) {}

  /**
   * 创建生产入库单
   */
  @Post()
  async createReceipt(@Body() dto: CreateProductionReceiptDto) {
    return this.productionReceiptService.createReceipt(dto);
  }

  /**
   * 查询生产入库单列表
   */
  @Get()
  async findReceipts(@Query() query: QueryProductionReceiptDto) {
    return this.productionReceiptService.findReceipts(query);
  }

  /**
   * 获取生产入库单详情
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productionReceiptService.findOne(id);
  }

  /**
   * 生成缸号匹号
   */
  @Post(':id/generate-batches')
  async generateBatches(@Param('id') id: string, @Body() dto: GenerateBatchDto) {
    return this.productionReceiptService.generateBatchForReceipt(id, dto);
  }

  /**
   * 确认入库
   */
  @Post(':id/confirm')
  async confirmReceipt(@Param('id') id: string, @Body() dto: ConfirmReceiptDto) {
    return this.productionReceiptService.confirmReceipt(id, dto);
  }

  /**
   * 取消入库单
   */
  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.productionReceiptService.cancelReceipt(id);
  }
}
