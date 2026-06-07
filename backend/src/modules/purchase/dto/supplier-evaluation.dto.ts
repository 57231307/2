import { IsString, IsNumber, IsOptional, IsArray, IsDateString, Min, Max, IsUUID, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { EvaluationItemType } from '../entities/supplier-evaluation-item.entity';
import { SupplierEvaluationLevel } from '../entities/supplier-evaluation.entity';

/**
 * 评估明细DTO
 */
export class EvaluationItemDto {
  @IsString()
  itemName: string;

  @IsEnum(EvaluationItemType)
  itemType: EvaluationItemType;

  @IsNumber()
  @Min(1)
  @Max(10)
  score: number;

  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * 创建供应商评估DTO
 */
export class CreateSupplierEvaluationDto {
  @IsUUID()
  supplierId: string;

  @IsDateString()
  evaluationDate: string;

  @IsString()
  evaluator: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  qualityScore: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  deliveryScore: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  priceScore: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  serviceScore: number;

  @IsString()
  @IsOptional()
  conclusion?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsOptional()
  items?: EvaluationItemDto[];
}

/**
 * 更新供应商评估DTO
 */
export class UpdateSupplierEvaluationDto {
  @IsUUID()
  @IsOptional()
  supplierId?: string;

  @IsDateString()
  @IsOptional()
  evaluationDate?: string;

  @IsString()
  @IsOptional()
  evaluator?: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  @IsOptional()
  qualityScore?: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  @IsOptional()
  deliveryScore?: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  @IsOptional()
  priceScore?: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  @IsOptional()
  serviceScore?: number;

  @IsString()
  @IsOptional()
  conclusion?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsOptional()
  items?: EvaluationItemDto[];
}

/**
 * 查询供应商评估DTO
 */
export class QuerySupplierEvaluationDto {
  @IsUUID()
  @IsOptional()
  supplierId?: string;

  @IsString()
  @IsOptional()
  evaluator?: string;

  @IsEnum(SupplierEvaluationLevel)
  @IsOptional()
  level?: SupplierEvaluationLevel;

  @IsDateString()
  @IsOptional()
  evaluationDateFrom?: string;

  @IsDateString()
  @IsOptional()
  evaluationDateTo?: string;
}
