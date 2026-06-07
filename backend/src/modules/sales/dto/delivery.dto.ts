import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID, IsArray, ValidateNested, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 发货单明细DTO
 */
export class DeliveryNoteItemDto {
  @ApiProperty({ description: '订单明细ID' })
  @IsUUID()
  orderItemId: string;

  @ApiProperty({ description: '批次ID' })
  @IsUUID()
  batchId: string;

  @ApiProperty({ description: '匹号' })
  @IsString()
  rollNo: string;

  @ApiProperty({ description: '数量' })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({ description: '单位' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 创建发货单DTO
 */
export class CreateDeliveryNoteDto {
  @ApiProperty({ description: '订单ID' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ description: '发货日期' })
  @IsDateString()
  deliveryDate: string;

  @ApiPropertyOptional({ description: '物流公司' })
  @IsString()
  @IsOptional()
  logisticsCompany?: string;

  @ApiPropertyOptional({ description: '物流单号' })
  @IsString()
  @IsOptional()
  trackingNo?: string;

  @ApiPropertyOptional({ description: '发货人姓名' })
  @IsString()
  @IsOptional()
  shipperName?: string;

  @ApiPropertyOptional({ description: '发货人电话' })
  @IsString()
  @IsOptional()
  shipperPhone?: string;

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

  @ApiProperty({ description: '发货明细', type: [DeliveryNoteItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryNoteItemDto)
  items: DeliveryNoteItemDto[];
}

/**
 * 查询发货单DTO
 */
export class QueryDeliveryNoteDto {
  @ApiPropertyOptional({ description: '页码' })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: '每页数量' })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: '订单ID' })
  @IsUUID()
  @IsOptional()
  orderId?: string;

  @ApiPropertyOptional({ description: '发货单状态' })
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

/**
 * 匹号选择DTO
 */
export class SelectBatchDto {
  @ApiProperty({ description: '订单明细ID' })
  @IsUUID()
  orderItemId: string;

  @ApiProperty({ description: '可选数量' })
  @IsNumber()
  quantity: number;
}
