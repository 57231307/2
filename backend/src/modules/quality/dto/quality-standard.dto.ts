/**
 * 质检标准相关DTO
 */
import { IsString, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { InspectionType } from '../enums';

/**
 * 质检项目DTO
 */
export class QualityStandardItemDto {
  /** 质检项目名称 */
  @IsString()
  itemName: string;

  /** 检测方法 */
  @IsString()
  checkMethod: string;

  /** 合格标准 */
  @IsString()
  standard: string;

  /** 接受质量限 */
  @IsString()
  aql: string;
}

/**
 * 创建质检标准DTO
 */
export class CreateQualityStandardDto {
  /** 质检标准编码 */
  @IsString()
  @IsOptional()
  code?: string;

  /** 质检标准名称 */
  @IsString()
  name: string;

  /** 质检类型 */
  @IsEnum(InspectionType)
  type: InspectionType;

  /** 质检项目明细 */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualityStandardItemDto)
  items: QualityStandardItemDto[];

  /** AQL等级 */
  @IsString()
  aqlLevel: string;

  /** 备注 */
  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 更新质检标准DTO
 */
export class UpdateQualityStandardDto {
  /** 质检标准编码 */
  @IsString()
  @IsOptional()
  code?: string;

  /** 质检标准名称 */
  @IsString()
  @IsOptional()
  name?: string;

  /** 质检类型 */
  @IsEnum(InspectionType)
  @IsOptional()
  type?: InspectionType;

  /** 质检项目明细 */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualityStandardItemDto)
  @IsOptional()
  items?: QualityStandardItemDto[];

  /** AQL等级 */
  @IsString()
  @IsOptional()
  aqlLevel?: string;

  /** 状态 */
  @IsString()
  @IsOptional()
  status?: string;

  /** 备注 */
  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 查询质检标准DTO
 */
export class QueryQualityStandardDto {
  /** 搜索关键字 */
  @IsString()
  @IsOptional()
  search?: string;

  /** 质检类型 */
  @IsEnum(InspectionType)
  @IsOptional()
  type?: InspectionType;

  /** 状态 */
  @IsString()
  @IsOptional()
  status?: string;

  /** 页码 */
  @IsOptional()
  page?: number;

  /** 每页数量 */
  @IsOptional()
  limit?: number;
}
