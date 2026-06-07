import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsUUID, MaxLength, Min, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 出库明细DTO
 */
export class OutboundItemDto {
  @ApiProperty({ description: '批次ID' })
  @IsUUID()
  batchId: string;

  @ApiProperty({ description: '出库数量' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;
}

/**
 * 出库DTO
 */
export class OutboundDto {
  @ApiProperty({ description: '产品ID' })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({ description: '颜色变体ID' })
  @IsOptional()
  @IsUUID()
  colorVariantId?: string;

  @ApiProperty({ description: '目标仓库ID（调拨出库时必填）' })
  @IsOptional()
  @IsUUID()
  targetWarehouseId?: string;

  @ApiProperty({ description: '来源类型：TRANSFER/RETURN/ADJUSTMENT' })
  @IsString()
  sourceType: string;

  @ApiPropertyOptional({ description: '来源单据ID' })
  @IsOptional()
  @IsUUID()
  sourceId?: string;

  @ApiPropertyOptional({ description: '来源单据号' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sourceNo?: string;

  @ApiProperty({ description: '出库明细', type: [OutboundItemDto] })
  @IsArray()
  items: OutboundItemDto[];

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 出库响应DTO
 */
export class OutboundResultDto {
  @ApiProperty({ description: '出库成功数量' })
  successCount: number;

  @ApiProperty({ description: '出库失败数量' })
  failedCount: number;

  @ApiProperty({ description: '出库明细' })
  items: {
    batchId: string;
    rollNo: string;
    quantity: number;
    success: boolean;
    error?: string;
  }[];
}