/**
 * 收付款记录DTO
 */
import { IsString, IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { PaymentType, PaymentMethod } from '../enums';

/**
 * 创建收付款记录DTO
 */
export class CreatePaymentDto {
  /** 收付款类型 */
  @IsEnum(PaymentType)
  type: PaymentType;

  /** 金额 */
  @IsNumber()
  amount: number;

  /** 收付款日期 */
  @IsDateString()
  date: string;

  /** 收付款方式 */
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  /** 交易对方ID */
  @IsString()
  counterpartyId: string;

  /** 交易对方名称 */
  @IsString()
  @IsOptional()
  counterpartyName?: string;

  /** 关联的应收/应付单据ID */
  @IsString()
  @IsOptional()
  referenceId?: string;

  /** 关联单据类型 */
  @IsString()
  @IsOptional()
  referenceType?: string;

  /** 备注 */
  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 查询收付款DTO
 */
export class QueryPaymentDto {
  /** 搜索关键字 */
  @IsString()
  @IsOptional()
  search?: string;

  /** 收付款类型 */
  @IsEnum(PaymentType)
  @IsOptional()
  type?: PaymentType;

  /** 交易对方ID */
  @IsString()
  @IsOptional()
  counterpartyId?: string;

  /** 收付款方式 */
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

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
