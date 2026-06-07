import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ProcessRouteStatus } from '../enums/process-route-status.enum';

/**
 * 创建工艺路线DTO
 */
export class CreateProcessRouteDto {
  @IsString()
  routeName: string;

  @IsString()
  productType: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProcessStepDto)
  @IsOptional()
  steps?: CreateProcessStepDto[];
}

/**
 * 创建工序DTO
 */
export class CreateProcessStepDto {
  @IsString()
  stepNo: string;

  @IsString()
  stepName: string;

  @IsNumber()
  sequence: number;

  @IsNumber()
  standardHours: number;

  @IsNumber()
  standardPrice: number;

  @IsString()
  stepType: string;

  @IsObject()
  @IsOptional()
  parameters?: Record<string, any>;

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * 更新工艺路线DTO
 */
export class UpdateProcessRouteDto {
  @IsString()
  @IsOptional()
  routeName?: string;

  @IsString()
  @IsOptional()
  productType?: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * 添加工序DTO
 */
export class AddProcessStepDto {
  @IsString()
  stepNo: string;

  @IsString()
  stepName: string;

  @IsNumber()
  sequence: number;

  @IsNumber()
  standardHours: number;

  @IsNumber()
  standardPrice: number;

  @IsString()
  stepType: string;

  @IsObject()
  @IsOptional()
  parameters?: Record<string, any>;

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * 更新工序DTO
 */
export class UpdateProcessStepDto {
  @IsString()
  @IsOptional()
  stepNo?: string;

  @IsString()
  @IsOptional()
  stepName?: string;

  @IsNumber()
  @IsOptional()
  sequence?: number;

  @IsNumber()
  @IsOptional()
  standardHours?: number;

  @IsNumber()
  @IsOptional()
  standardPrice?: number;

  @IsString()
  @IsOptional()
  stepType?: string;

  @IsObject()
  @IsOptional()
  parameters?: Record<string, any>;

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * 查询工艺路线DTO
 */
export class QueryProcessRouteDto {
  @IsString()
  @IsOptional()
  routeNo?: string;

  @IsString()
  @IsOptional()
  routeName?: string;

  @IsString()
  @IsOptional()
  productType?: string;

  @IsEnum(ProcessRouteStatus)
  @IsOptional()
  status?: ProcessRouteStatus;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  pageSize?: number;
}

/**
 * 调整工序顺序DTO
 */
export class ReorderStepsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  stepIds: string[];
}
