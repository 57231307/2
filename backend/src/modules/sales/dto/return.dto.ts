import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID, IsNumber, IsString } from 'class-validator';

/**
 * 退货明细DTO
 */
export class ReturnItemDto {
  @ApiProperty({ description: '发货单明细ID' })
  @IsUUID()
  deliveryNoteItemId: string;

  @ApiProperty({ description: '批次ID' })
  @IsUUID()
  batchId: string;

  @ApiProperty({ description: '匹号' })
  @IsString()
  rollNo: string;

  @ApiProperty({ description: '退货数量' })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({ description: '单位' })
  @IsString()
  @IsOptional()
  unit?: string;
}

/**
 * 创建退货DTO
 */
export class CreateSaleReturnDto {
  @ApiProperty({ description: '发货单ID' })
  @IsUUID()
  deliveryNoteId: string;

  @ApiProperty({ description: '退货日期' })
  @IsDateString()
  returnDate: string;

  @ApiProperty({ description: '退货原因' })
  @IsString()
  returnReason: string;

  @ApiPropertyOptional({ description: '退款金额' })
  @IsNumber()
  @IsOptional()
  refundAmount?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 查询退货DTO
 */
export class QuerySaleReturnDto {
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

  @ApiPropertyOptional({ description: '发货单ID' })
  @IsUUID()
  @IsOptional()
  deliveryNoteId?: string;

  @ApiPropertyOptional({ description: '订单ID' })
  @IsUUID()
  @IsOptional()
  orderId?: string;

  @ApiPropertyOptional({ description: '退货状态' })
  @IsString()
  @IsOptional()
  returnStatus?: string;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
