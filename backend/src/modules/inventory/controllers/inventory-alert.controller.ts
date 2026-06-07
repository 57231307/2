import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BatchService } from '../services/inventory.service';
import { InventoryAlertItemDto, AlertSummaryDto } from '../dto/inventory-alert.dto';

@ApiTags('库存预警')
@Controller('api/v1/inventory-alerts')
export class InventoryAlertController {
  constructor(private readonly batchService: BatchService) {}

  @Get('low-stock')
  @ApiOperation({ summary: '获取低库存预警列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getLowStockAlerts(
    @Query('warehouseId') warehouseId?: string,
  ): Promise<InventoryAlertItemDto[]> {
    return this.batchService.getLowStockAlerts(warehouseId);
  }

  @Get('over-stock')
  @ApiOperation({ summary: '获取超储预警列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getOverStockAlerts(
    @Query('warehouseId') warehouseId?: string,
  ): Promise<InventoryAlertItemDto[]> {
    return this.batchService.getOverStockAlerts(warehouseId);
  }

  @Get('expiry')
  @ApiOperation({ summary: '获取效期预警列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getExpiryAlerts(
    @Query('warehouseId') warehouseId?: string,
  ): Promise<InventoryAlertItemDto[]> {
    return this.batchService.getExpiryAlerts(warehouseId);
  }

  @Get('summary')
  @ApiOperation({ summary: '获取预警汇总' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getAlertSummary(
    @Query('warehouseId') warehouseId?: string,
  ): Promise<AlertSummaryDto> {
    return this.batchService.getAlertSummary(warehouseId);
  }
}
