import { IsDateString, IsOptional, IsString, IsUUID, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 入库明细创建DTO
 */
export class CreateGoodsReceiptItemDto {
  @IsUUID()
  orderItemId: string;

  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  colorVariantId?: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 入库明细（包含匹号）DTO
 */
export class CreateGoodsReceiptItemWithRollDto {
  @IsUUID()
  orderItemId: string;

  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  colorVariantId?: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  /** 匹号（可选，不传则自动生成） */
  @IsOptional()
  @IsString()
  rollNo?: string;

  /** 库位编码 */
  @IsOptional()
  @IsString()
  locationCode?: string;

  /** 克重 */
  @IsOptional()
  @IsNumber()
  gramWeight?: number;

  /** 幅宽 */
  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 入库单创建DTO
 */
export class CreateGoodsReceiptDto {
  @IsUUID()
  orderId: string;

  @IsDateString()
  receiptDate: string;

  @IsUUID()
  warehouseId: string;

  @IsOptional()
  @IsString()
  receiptType?: string;

  @IsOptional()
  @IsUUID()
  handlerId?: string;

  @IsOptional()
  @IsString()
  handlerName?: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGoodsReceiptItemDto)
  items?: CreateGoodsReceiptItemDto[];
}

/**
 * 入库明细更新DTO
 */
export class UpdateGoodsReceiptItemDto {
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  qualifiedQuantity?: number;

  @IsOptional()
  @IsNumber()
  unqualifiedQuantity?: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 入库单更新DTO
 */
export class UpdateGoodsReceiptDto {
  @IsOptional()
  @IsDateString()
  receiptDate?: string;

  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @IsOptional()
  @IsUUID()
  handlerId?: string;

  @IsOptional()
  @IsString()
  handlerName?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 入库单查询DTO
 */
export class QueryGoodsReceiptDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  receiptDateFrom?: string;

  @IsOptional()
  @IsDateString()
  receiptDateTo?: string;
}

/**
 * 生成批次DTO
 */
export class GenerateBatchDto {
  /** 匹号列表（不传则生成所有未生成批次的匹号） */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  itemIds?: string[];
}
