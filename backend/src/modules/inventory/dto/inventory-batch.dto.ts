import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, IsUUID, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BatchSourceType } from '../enums/batch-source-type.enum';
import { BatchStatus } from '../enums/batch-status.enum';
import { QualityStatus } from '../enums/quality-status.enum';

/**
 * 创建批次DTO
 */
export class CreateBatchDto {
  @ApiProperty({ description: '缸号' })
  @IsString()
  @MaxLength(50)
  batchNo: string;

  @ApiProperty({ description: '匹号' })
  @IsString()
  @MaxLength(50)
  rollNo: string;

  @ApiProperty({ description: '产品ID' })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({ description: '颜色变体ID' })
  @IsOptional()
  @IsUUID()
  colorVariantId?: string;

  @ApiProperty({ description: '仓库ID' })
  @IsUUID()
  warehouseId: string;

  @ApiPropertyOptional({ description: '库位编码' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  locationCode?: string;

  @ApiProperty({ description: '数量' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({ description: '单位', default: 'meter' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({ description: '生产日期' })
  @IsOptional()
  @IsString()
  productionDate?: string;

  @ApiPropertyOptional({ description: '生产批号' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  manufactureNo?: string;

  @ApiProperty({ description: '来源类型', enum: BatchSourceType })
  @IsEnum(BatchSourceType)
  sourceType: BatchSourceType;

  @ApiPropertyOptional({ description: '来源单据ID' })
  @IsOptional()
  @IsUUID()
  sourceId?: string;

  @ApiPropertyOptional({ description: '来源单据号' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sourceNo?: string;

  @ApiPropertyOptional({ description: '克重（g/m²）' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  gramWeight?: number;

  @ApiPropertyOptional({ description: '幅宽（cm）' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  width?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 更新批次DTO
 */
export class UpdateBatchDto {
  @ApiPropertyOptional({ description: '库位编码' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  locationCode?: string;

  @ApiPropertyOptional({ description: '数量' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity?: number;

  @ApiPropertyOptional({ description: '质检状态', enum: QualityStatus })
  @IsOptional()
  @IsEnum(QualityStatus)
  qualityStatus?: QualityStatus;

  @ApiPropertyOptional({ description: '批次状态', enum: BatchStatus })
  @IsOptional()
  @IsEnum(BatchStatus)
  status?: BatchStatus;

  @ApiPropertyOptional({ description: '克重（g/m²）' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  gramWeight?: number;

  @ApiPropertyOptional({ description: '幅宽（cm）' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  width?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 查询批次DTO
 */
export class QueryBatchDto {
  @ApiPropertyOptional({ description: '产品ID' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ description: '颜色变体ID' })
  @IsOptional()
  @IsUUID()
  colorVariantId?: string;

  @ApiPropertyOptional({ description: '缸号' })
  @IsOptional()
  @IsString()
  batchNo?: string;

  @ApiPropertyOptional({ description: '仓库ID' })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({ description: '批次状态', enum: BatchStatus })
  @IsOptional()
  @IsEnum(BatchStatus)
  status?: BatchStatus;

  @ApiPropertyOptional({ description: '质检状态', enum: QualityStatus })
  @IsOptional()
  @IsEnum(QualityStatus)
  qualityStatus?: QualityStatus;
}