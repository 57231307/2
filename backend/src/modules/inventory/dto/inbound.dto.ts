import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, IsUUID, MaxLength, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BatchSourceType } from '../enums/batch-source-type.enum';

/**
 * 匹号明细DTO
 */
export class RollItemDto {
  @ApiProperty({ description: '匹号' })
  @IsString()
  @MaxLength(50)
  rollNo: string;

  @ApiProperty({ description: '数量' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({ description: '库位编码' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  locationCode?: string;

  @ApiPropertyOptional({ description: '生产日期' })
  @IsOptional()
  @IsString()
  productionDate?: string;

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
 * 入库DTO
 */
export class InboundDto {
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

  @ApiProperty({ description: '缸号，不提供则自动生成' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  batchNo?: string;

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

  @ApiProperty({ description: '匹号列表', type: [RollItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RollItemDto)
  rolls: RollItemDto[];

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 入库响应DTO
 */
export class InboundResultDto {
  @ApiProperty({ description: '缸号' })
  batchNo: string;

  @ApiProperty({ description: '入库批次列表' })
  batches: {
    rollNo: string;
    quantity: number;
    locationCode?: string;
    id: string;
  }[];
}