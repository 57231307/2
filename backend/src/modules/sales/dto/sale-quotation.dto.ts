import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID, IsArray, ValidateNested, IsNumber, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 报价单明细DTO
 */
export class SaleQuotationItemDto {
  @ApiProperty({ description: '产品ID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: '颜色变体ID' })
  @IsUUID()
  colorVariantId: string;

  @ApiProperty({ description: '数量' })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({ description: '单位' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ description: '单价' })
  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 创建报价单DTO
 */
export class CreateSaleQuotationDto {
  @ApiProperty({ description: '客户ID' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ description: '报价日期' })
  @IsDateString()
  quotationDate: string;

  @ApiProperty({ description: '有效期至' })
  @IsDateString()
  validUntil: string;

  @ApiPropertyOptional({ description: '业务员ID' })
  @IsUUID()
  @IsOptional()
  salespersonId?: string;

  @ApiPropertyOptional({ description: '折扣率' })
  @IsNumber()
  @IsOptional()
  discountRate?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiProperty({ description: '报价单明细', type: [SaleQuotationItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleQuotationItemDto)
  items: SaleQuotationItemDto[];
}

/**
 * 更新报价单DTO
 */
export class UpdateSaleQuotationDto {
  @ApiPropertyOptional({ description: '报价日期' })
  @IsDateString()
  @IsOptional()
  quotationDate?: string;

  @ApiPropertyOptional({ description: '有效期至' })
  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @ApiPropertyOptional({ description: '折扣率' })
  @IsNumber()
  @IsOptional()
  discountRate?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiPropertyOptional({ description: '报价单明细', type: [SaleQuotationItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleQuotationItemDto)
  @IsOptional()
  items?: SaleQuotationItemDto[];
}

/**
 * 查询报价单DTO
 */
export class QuerySaleQuotationDto {
  @ApiPropertyOptional({ description: '页码' })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: '每页数量' })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: '搜索关键词（报价单号/客户名）' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: '客户ID' })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ description: '报价单状态' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
