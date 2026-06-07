import { IsString, IsOptional, IsBoolean, IsUUID, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 询价单明细DTO
 */
export class PurchaseInquiryItemDto {
  @ApiPropertyOptional({ description: '产品ID' })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional({ description: '产品名称' })
  @IsString()
  @IsOptional()
  productName?: string;

  @ApiPropertyOptional({ description: '颜色变体ID' })
  @IsUUID()
  @IsOptional()
  colorVariantId?: string;

  @ApiPropertyOptional({ description: '颜色名称' })
  @IsString()
  @IsOptional()
  colorName?: string;

  @ApiProperty({ description: '数量' })
  @IsUUID()
  quantity: number;

  @ApiPropertyOptional({ description: '期望单价' })
  @IsOptional()
  expectedPrice?: number;

  @ApiPropertyOptional({ description: '报价单价' })
  @IsOptional()
  quotedPrice?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 创建询价单DTO
 */
export class CreatePurchaseInquiryDto {
  @ApiProperty({ description: '供应商ID' })
  @IsUUID()
  supplierId: string;

  @ApiProperty({ description: '供应商名称' })
  @IsString()
  supplierName: string;

  @ApiProperty({ description: '询价日期' })
  @IsDateString()
  inquiryDate: string;

  @ApiPropertyOptional({ description: '有效期至' })
  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @ApiPropertyOptional({ description: '联系人' })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiProperty({ description: '询价明细', type: [PurchaseInquiryItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseInquiryItemDto)
  items: PurchaseInquiryItemDto[];
}

/**
 * 更新询价单DTO
 */
export class UpdatePurchaseInquiryDto {
  @ApiPropertyOptional({ description: '询价日期' })
  @IsDateString()
  @IsOptional()
  inquiryDate?: string;

  @ApiPropertyOptional({ description: '有效期至' })
  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @ApiPropertyOptional({ description: '联系人' })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiPropertyOptional({ description: '询价明细', type: [PurchaseInquiryItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseInquiryItemDto)
  @IsOptional()
  items?: PurchaseInquiryItemDto[];
}

/**
 * 询价单查询DTO
 */
export class QueryPurchaseInquiryDto {
  @ApiPropertyOptional({ description: '供应商ID' })
  @IsUUID()
  @IsOptional()
  supplierId?: string;

  @ApiPropertyOptional({ description: '状态' })
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

  @ApiPropertyOptional({ description: '搜索关键字' })
  @IsString()
  @IsOptional()
  search?: string;
}

/**
 * 询价单对比DTO
 */
export class CompareInquiriesDto {
  @ApiProperty({ description: '询价单ID列表' })
  @IsArray()
  @IsUUID('4', { each: true })
  inquiryIds: string[];
}
