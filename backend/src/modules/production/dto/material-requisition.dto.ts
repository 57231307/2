import { IsString, IsNumber, IsOptional, IsDate, IsEnum, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RequisitionStatus } from '../enums/requisition-status.enum';

/**
 * 创建领料单DTO
 */
export class CreateMaterialRequisitionDto {
  @IsUUID()
  productionOrderId: string;

  @IsDate()
  @Type(() => Date)
  requisitionDate: Date;

  @IsUUID()
  warehouseId: string;

  @IsString()
  @IsOptional()
  requesterName?: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialRequisitionItemDto)
  @IsOptional()
  items?: CreateMaterialRequisitionItemDto[];
}

/**
 * 创建领料明细DTO
 */
export class CreateMaterialRequisitionItemDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  @IsOptional()
  colorVariantId?: string;

  @IsUUID()
  @IsOptional()
  batchId?: string;

  @IsNumber()
  requestedQuantity: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 添加领料明细DTO
 */
export class AddRequisitionItemDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  @IsOptional()
  colorVariantId?: string;

  @IsUUID()
  @IsOptional()
  batchId?: string;

  @IsNumber()
  requestedQuantity: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 确认领料DTO
 */
export class ConfirmRequisitionDto {
  @IsString()
  @IsOptional()
  approverName?: string;
}

/**
 * 查询领料单DTO
 */
export class QueryMaterialRequisitionDto {
  @IsString()
  @IsOptional()
  requisitionNo?: string;

  @IsUUID()
  @IsOptional()
  productionOrderId?: string;

  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @IsEnum(RequisitionStatus)
  @IsOptional()
  status?: RequisitionStatus;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  requisitionDateFrom?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  requisitionDateTo?: Date;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  pageSize?: number;
}
