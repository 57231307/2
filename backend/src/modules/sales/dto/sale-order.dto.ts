import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID, IsArray, ValidateNested, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 销售订单明细DTO
 */
export class SaleOrderItemDto {
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
 * 创建销售订单DTO
 */
export class CreateSaleOrderDto {
  @ApiProperty({ description: '客户ID' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ description: '订单日期' })
  @IsDateString()
  orderDate: string;

  @ApiPropertyOptional({ description: '预计交货日期' })
  @IsDateString()
  @IsOptional()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({ description: '业务员ID' })
  @IsUUID()
  @IsOptional()
  salespersonId?: string;

  @ApiPropertyOptional({ description: '收货人姓名' })
  @IsString()
  @IsOptional()
  receiverName?: string;

  @ApiPropertyOptional({ description: '收货人电话' })
  @IsString()
  @IsOptional()
  receiverPhone?: string;

  @ApiPropertyOptional({ description: '收货地址' })
  @IsString()
  @IsOptional()
  receiverAddress?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiProperty({ description: '订单明细', type: [SaleOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleOrderItemDto)
  items: SaleOrderItemDto[];
}

/**
 * 更新销售订单DTO
 */
export class UpdateSaleOrderDto {
  @ApiPropertyOptional({ description: '预计交货日期' })
  @IsDateString()
  @IsOptional()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({ description: '收货人姓名' })
  @IsString()
  @IsOptional()
  receiverName?: string;

  @ApiPropertyOptional({ description: '收货人电话' })
  @IsString()
  @IsOptional()
  receiverPhone?: string;

  @ApiPropertyOptional({ description: '收货地址' })
  @IsString()
  @IsOptional()
  receiverAddress?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiPropertyOptional({ description: '订单明细', type: [SaleOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleOrderItemDto)
  @IsOptional()
  items?: SaleOrderItemDto[];
}

/**
 * 查询销售订单DTO
 */
export class QuerySaleOrderDto {
  @ApiPropertyOptional({ description: '页码' })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: '每页数量' })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: '搜索关键词（订单号/客户名）' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: '客户ID' })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ description: '订单状态' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: '审批状态' })
  @IsString()
  @IsOptional()
  approvalStatus?: string;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

/**
 * 审批DTO
 */
export class ApprovalDto {
  @ApiPropertyOptional({ description: '审批备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}
