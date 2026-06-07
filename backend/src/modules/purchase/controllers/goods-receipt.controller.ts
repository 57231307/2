import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { GoodsReceiptService } from '../services/goods-receipt.service';
import { CreateGoodsReceiptDto, CreateGoodsReceiptItemWithRollDto, QueryGoodsReceiptDto, GenerateBatchDto } from '../dto/goods-receipt.dto';

/**
 * 采购入库控制器
 * 核心功能：入库生成缸号匹号
 */
@Controller('api/v1/goods-receipts')
export class GoodsReceiptController {
  constructor(private readonly goodsReceiptService: GoodsReceiptService) {}

  /**
   * 创建入库单
   */
  @Post()
  async create(@Body() dto: CreateGoodsReceiptDto) {
    return this.goodsReceiptService.createReceipt(dto);
  }

  /**
   * 查询入库单列表
   */
  @Get()
  async findAll(
    @Query() query: QueryGoodsReceiptDto,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.goodsReceiptService.findReceipts(query, parseInt(page, 10), parseInt(limit, 10));
  }

  /**
   * 获取入库单详情
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.goodsReceiptService.findReceiptById(id);
  }

  /**
   * 添加入库明细（包含匹号）- 核心功能
   */
  @Post(':id/items')
  async addItem(
    @Param('id') id: string,
    @Body() dto: CreateGoodsReceiptItemWithRollDto,
  ) {
    return this.goodsReceiptService.addItemWithRoll(id, dto);
  }

  /**
   * 生成批次 - 核心功能！
   * 为入库单生成缸号匹号
   */
  @Post(':id/generate-batches')
  async generateBatches(
    @Param('id') id: string,
    @Body() dto: GenerateBatchDto,
  ) {
    return this.goodsReceiptService.generateBatchesForReceipt(id, dto);
  }

  /**
   * 为单个入库明细生成批次
   */
  @Post(':id/items/:itemId/generate-batch')
  async generateBatchForItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() body: { locationCode?: string; gramWeight?: number; width?: number },
  ) {
    return this.goodsReceiptService.generateBatchForItem(
      itemId,
      body.locationCode,
      body.gramWeight,
      body.width,
    );
  }

  /**
   * 确认入库
   */
  @Post(':id/confirm')
  async confirmReceipt(@Param('id') id: string) {
    return this.goodsReceiptService.confirmReceipt(id);
  }

  /**
   * 批次追溯
   */
  @Get('batches/:batchId/trace')
  async traceBatch(@Param('batchId') batchId: string) {
    return this.goodsReceiptService.traceBatchSource(batchId);
  }
}
