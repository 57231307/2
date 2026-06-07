import { IsString, IsNumber, IsOptional, IsDate, IsEnum, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductionReceiptStatus } from '../enums/production-receipt-status.enum';

/**
 * 创建生产入库单DTO
 */
export class CreateProductionReceiptDto {
  @IsUUID()
  productionOrderId: string;

  @IsDate()
  @Type(() => Date)
  receiptDate: Date;

  @IsUUID()
  warehouseId: string;

  @IsString()
  @IsOptional()
  receiverName?: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductionReceiptItemDto)
  @IsOptional()
  items?: CreateProductionReceiptItemDto[];
}

/**
 * 创建生产入库明细DTO
 */
export class CreateProductionReceiptItemDto {
  @IsNumber()
  qualifiedQuantity: number;

  @IsNumber()
  @IsOptional()
  unqualifiedQuantity?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 生成批次DTO
 */
export class GenerateBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchItemDto)
  items: BatchItemDto[];
}

/**
 * 批次项DTO
 */
export class BatchItemDto {
  @IsUUID()
  @IsOptional()
  itemId?: string;

  @IsNumber()
  qualifiedQuantity: number;

  @IsString()
  @IsOptional()
  rollNo?: string;
}

/**
 * 确认入库DTO
 */
export class ConfirmReceiptDto {
  @IsEnum(ProductionReceiptStatus)
  status: ProductionReceiptStatus;

  @IsString()
  @IsOptional()
  qualityInspector?: string;

  @IsString()
  @IsOptional()
  receiverName?: string;
}

/**
 * 查询生产入库单DTO
 */
export class QueryProductionReceiptDto {
  @IsString()
  @IsOptional()
  receiptNo?: string;

  @IsUUID()
  @IsOptional()
  productionOrderId?: string;

  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @IsEnum(ProductionReceiptStatus)
  @IsOptional()
  status?: ProductionReceiptStatus;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  receiptDateFrom?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  receiptDateTo?: Date;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  pageSize?: number;
}
