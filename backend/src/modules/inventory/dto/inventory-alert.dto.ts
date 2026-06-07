import { IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 库存预警查询DTO
 */
export class QueryInventoryAlertDto {
  @ApiPropertyOptional({ description: '仓库ID' })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({ description: '产品ID' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ description: '预警类型：low-stock, over-stock, expiry' })
  @IsOptional()
  alertType?: string;
}

/**
 * 库存预警项DTO
 */
export class InventoryAlertItemDto {
  @ApiProperty({ description: '批次ID' })
  batchId: string;

  @ApiProperty({ description: '批次编号' })
  batchNo: string;

  @ApiProperty({ description: '匹号' })
  rollNo: string;

  @ApiProperty({ description: '仓库ID' })
  warehouseId: string;

  @ApiProperty({ description: '仓库名称' })
  warehouseName: string;

  @ApiProperty({ description: '产品ID' })
  productId: string;

  @ApiProperty({ description: '产品名称' })
  productName: string;

  @ApiProperty({ description: '颜色变体ID' })
  colorVariantId?: string;

  @ApiProperty({ description: '颜色编号' })
  colorCode?: string;

  @ApiProperty({ description: '颜色名称' })
  colorName?: string;

  @ApiProperty({ description: '当前库存数量' })
  currentQuantity: number;

  @ApiProperty({ description: '安全库存/最高库存/效期' })
  threshold: number;

  @ApiProperty({ description: '预警差额' })
  diff: number;

  @ApiPropertyOptional({ description: '有效期' })
  expiryDate?: Date;

  @ApiProperty({ description: '距到期天数' })
  daysUntilExpiry?: number;
}

/**
 * 预警汇总DTO
 */
export class AlertSummaryDto {
  @ApiProperty({ description: '低库存预警数量' })
  lowStockCount: number;

  @ApiProperty({ description: '超储预警数量' })
  overStockCount: number;

  @ApiProperty({ description: '效期预警数量' })
  expiryCount: number;

  @ApiProperty({ description: '总预警数量' })
  totalCount: number;
}
