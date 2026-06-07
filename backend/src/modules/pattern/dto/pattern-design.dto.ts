import { IsString, IsOptional, IsArray, IsDateString, IsUUID } from 'class-validator';
import { PatternDesignStatus } from '../entities/pattern-design.entity';

/**
 * 创建花型设计DTO
 */
export class CreatePatternDesignDto {
  @IsUUID()
  @IsOptional()
  patternId?: string;

  @IsString()
  @IsOptional()
  patternName?: string;

  @IsString()
  @IsOptional()
  patternCode?: string;

  @IsString()
  designName: string;

  @IsString()
  @IsOptional()
  designVersion?: string;

  @IsString()
  designer: string;

  @IsDateString()
  designDate: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  designImages?: string[];

  @IsArray()
  @IsOptional()
  colorScheme?: any[];

  @IsString()
  @IsOptional()
  designFileUrl?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 更新花型设计DTO
 */
export class UpdatePatternDesignDto {
  @IsUUID()
  @IsOptional()
  patternId?: string;

  @IsString()
  @IsOptional()
  designName?: string;

  @IsString()
  @IsOptional()
  designVersion?: string;

  @IsString()
  @IsOptional()
  designer?: string;

  @IsDateString()
  @IsOptional()
  designDate?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  designImages?: string[];

  @IsArray()
  @IsOptional()
  colorScheme?: any[];

  @IsString()
  @IsOptional()
  designFileUrl?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 查询花型设计DTO
 */
export class QueryPatternDesignDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsUUID()
  @IsOptional()
  patternId?: string;

  @IsString()
  @IsOptional()
  designer?: string;

  @IsString()
  @IsOptional()
  status?: PatternDesignStatus;

  @IsDateString()
  @IsOptional()
  designDateFrom?: string;

  @IsDateString()
  @IsOptional()
  designDateTo?: string;
}

/**
 * 驳回花型设计DTO
 */
export class RejectPatternDesignDto {
  @IsString()
  reason: string;
}

/**
 * 审核通过DTO
 */
export class ApprovePatternDesignDto {
  @IsString()
  @IsOptional()
  remark?: string;
}
