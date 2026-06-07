/**
 * 应收应付相关DTO
 */
import { IsString, IsOptional, IsEnum, IsDateString, IsInt, IsNumber, IsUUID } from 'class-validator';
import { SourceType, ArApStatus } from '../enums';

/**
 * 生成应收DTO
 */
export class GenerateReceivableDto {
  /** 来源类型 */
  @IsEnum(SourceType)
  sourceType: SourceType;

  /** 来源单据ID */
  @IsString()
  sourceId: string;

  /** 客户ID */
  @IsString()
  customerId: string;

  /** 客户名称 */
  @IsString()
  @IsOptional()
  customerName?: string;

  /** 应收金额 */
  @IsNumber()
  amount: number;

  /** 到期日期 */
  @IsDateString()
  dueDate: string;

  /** 备注 */
  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 查询应收DTO
 */
export class QueryReceivableDto {
  /** 搜索关键字 */
  @IsString()
  @IsOptional()
  search?: string;

  /** 客户ID */
  @IsString()
  @IsOptional()
  customerId?: string;

  /** 状态 */
  @IsEnum(ArApStatus)
  @IsOptional()
  status?: ArApStatus;

  /** 开始日期 */
  @IsDateString()
  @IsOptional()
  startDate?: string;

  /** 结束日期 */
  @IsDateString()
  @IsOptional()
  endDate?: string;

  /** 页码 */
  @IsOptional()
  page?: number;

  /** 每页数量 */
  @IsOptional()
  limit?: number;
}

/**
 * 收款登记DTO
 */
export class RecordReceivablePaymentDto {
  /** 收款金额 */
  @IsNumber()
  amount: number;

  /** 收款日期 */
  @IsDateString()
  date: string;

  /** 收款方式 */
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  /** 备注 */
  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 生成应付DTO
 */
export class GeneratePayableDto {
  /** 来源类型 */
  @IsEnum(SourceType)
  sourceType: SourceType;

  /** 来源单据ID */
  @IsString()
  sourceId: string;

  /** 供应商ID */
  @IsString()
  supplierId: string;

  /** 供应商名称 */
  @IsString()
  @IsOptional()
  supplierName?: string;

  /** 应付金额 */
  @IsNumber()
  amount: number;

  /** 到期日期 */
  @IsDateString()
  dueDate: string;

  /** 备注 */
  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 查询应付DTO
 */
export class QueryPayableDto {
  /** 搜索关键字 */
  @IsString()
  @IsOptional()
  search?: string;

  /** 供应商ID */
  @IsString()
  @IsOptional()
  supplierId?: string;

  /** 状态 */
  @IsEnum(ArApStatus)
  @IsOptional()
  status?: ArApStatus;

  /** 开始日期 */
  @IsDateString()
  @IsOptional()
  startDate?: string;

  /** 结束日期 */
  @IsDateString()
  @IsOptional()
  endDate?: string;

  /** 页码 */
  @IsOptional()
  page?: number;

  /** 每页数量 */
  @IsOptional()
  limit?: number;
}

/**
 * 付款登记DTO
 */
export class RecordPayablePaymentDto {
  /** 付款金额 */
  @IsNumber()
  amount: number;

  /** 付款日期 */
  @IsDateString()
  date: string;

  /** 付款方式 */
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  /** 备注 */
  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 核销DTO
 */
export class ReconcileDto {
  /** 核销金额 */
  @IsNumber()
  amount: number;

  /** 备注 */
  @IsString()
  @IsOptional()
  remark?: string;
}
