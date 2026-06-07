import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { DispatchStatus } from '../enums/process-route-status.enum';

/**
 * 创建派工单DTO
 */
export class CreateWorkOrderDispatchDto {
  @IsUUID()
  productionOrderId: string;

  @IsUUID()
  stepId: string;

  @IsNumber()
  quantity: number;

  @IsDate()
  @Type(() => Date)
  dispatchDate: Date;

  @IsString()
  workerGroup: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * 更新派工单DTO
 */
export class UpdateWorkOrderDispatchDto {
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dispatchDate?: Date;

  @IsString()
  @IsOptional()
  workerGroup?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * 完成派工DTO
 */
export class CompleteDispatchDto {
  @IsNumber()
  goodQuantity: number;

  @IsNumber()
  @IsOptional()
  defectQuantity?: number;

  @IsNumber()
  @IsOptional()
  actualHours?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * 查询派工单DTO
 */
export class QueryWorkOrderDispatchDto {
  @IsString()
  @IsOptional()
  dispatchNo?: string;

  @IsUUID()
  @IsOptional()
  productionOrderId?: string;

  @IsUUID()
  @IsOptional()
  stepId?: string;

  @IsEnum(DispatchStatus)
  @IsOptional()
  status?: DispatchStatus;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dispatchDateFrom?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dispatchDateTo?: Date;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  pageSize?: number;
}
