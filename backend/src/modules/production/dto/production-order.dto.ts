import { IsString, IsNumber, IsOptional, IsDate, IsEnum, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductionOrderStatus } from '../enums/production-order-status.enum';
import { ProductionPriority } from '../enums/production-priority.enum';

/**
 * 创建生产工单DTO
 */
export class CreateProductionOrderDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  @IsOptional()
  colorVariantId?: string;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  plannedStartDate?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  plannedEndDate?: Date;

  @IsEnum(ProductionPriority)
  @IsOptional()
  priority?: ProductionPriority;

  @IsString()
  @IsOptional()
  processRequirements?: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductionOrderItemDto)
  @IsOptional()
  items?: CreateProductionOrderItemDto[];
}

/**
 * 创建生产工单明细DTO
 */
export class CreateProductionOrderItemDto {
  @IsUUID()
  materialProductId: string;

  @IsUUID()
  @IsOptional()
  colorVariantId?: string;

  @IsNumber()
  requiredQuantity: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 更新生产工单DTO
 */
export class UpdateProductionOrderDto {
  @IsUUID()
  @IsOptional()
  productId?: string;

  @IsUUID()
  @IsOptional()
  colorVariantId?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  plannedStartDate?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  plannedEndDate?: Date;

  @IsEnum(ProductionPriority)
  @IsOptional()
  priority?: ProductionPriority;

  @IsString()
  @IsOptional()
  processRequirements?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 查询生产工单DTO
 */
export class QueryProductionOrderDto {
  @IsString()
  @IsOptional()
  orderNo?: string;

  @IsUUID()
  @IsOptional()
  productId?: string;

  @IsUUID()
  @IsOptional()
  colorVariantId?: string;

  @IsEnum(ProductionOrderStatus)
  @IsOptional()
  status?: ProductionOrderStatus;

  @IsEnum(ProductionPriority)
  @IsOptional()
  priority?: ProductionPriority;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDateFrom?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDateTo?: Date;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  pageSize?: number;
}
