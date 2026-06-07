import { IsDateString, IsOptional, IsString, IsUUID, IsArray, ValidateNested, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseOrderStatus, ApprovalStatus } from '../enums/purchase-order-status.enum';

/**
 * 采购订单明细创建DTO
 */
export class CreatePurchaseOrderItemDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  colorVariantId?: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  unitPrice: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 采购订单创建DTO
 */
export class CreatePurchaseOrderDto {
  @IsUUID()
  supplierId: string;

  @IsDateString()
  orderDate: string;

  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[];
}

/**
 * 采购订单明细更新DTO
 */
export class UpdatePurchaseOrderItemDto {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsUUID()
  colorVariantId?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 采购订单更新DTO
 */
export class UpdatePurchaseOrderDto {
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsOptional()
  @IsDateString()
  orderDate?: string;

  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePurchaseOrderItemDto)
  items?: UpdatePurchaseOrderItemDto[];
}

/**
 * 采购订单查询DTO
 */
export class QueryPurchaseOrderDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  approvalStatus?: ApprovalStatus;

  @IsOptional()
  @IsDateString()
  orderDateFrom?: string;

  @IsOptional()
  @IsDateString()
  orderDateTo?: string;
}

/**
 * 审批DTO
 */
export class ApprovePurchaseOrderDto {
  @IsOptional()
  @IsString()
  remark?: string;
}
