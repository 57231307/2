import { Controller, Get, Post, Put, Param, Query, Body } from '@nestjs/common';
import { ProductionOrderService } from '../services/production-order.service';
import { CreateProductionOrderDto, UpdateProductionOrderDto, QueryProductionOrderDto } from '../dto/production-order.dto';

/**
 * 生产工单控制器
 */
@Controller('api/v1/production-orders')
export class ProductionOrderController {
  constructor(private readonly productionOrderService: ProductionOrderService) {}

  /**
   * 创建生产工单
   */
  @Post()
  async create(@Body() dto: CreateProductionOrderDto) {
    return this.productionOrderService.create(dto);
  }

  /**
   * 查询工单列表
   */
  @Get()
  async findAll(@Query() query: QueryProductionOrderDto) {
    return this.productionOrderService.findAll(query);
  }

  /**
   * 获取工单详情
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productionOrderService.findOne(id);
  }

  /**
   * 更新工单
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductionOrderDto) {
    return this.productionOrderService.update(id, dto);
  }

  /**
   * 下达工单
   */
  @Post(':id/release')
  async release(@Param('id') id: string) {
    return this.productionOrderService.release(id);
  }

  /**
   * 开始生产
   */
  @Post(':id/start')
  async start(@Param('id') id: string) {
    return this.productionOrderService.start(id);
  }

  /**
   * 完工
   */
  @Post(':id/complete')
  async complete(@Param('id') id: string, @Body('completedQuantity') completedQuantity: number) {
    return this.productionOrderService.complete(id, completedQuantity);
  }

  /**
   * 取消工单
   */
  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.productionOrderService.cancel(id);
  }
}
