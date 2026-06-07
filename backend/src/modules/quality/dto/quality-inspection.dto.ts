/**
 * 质检报告相关DTO
 */
import { IsString, IsOptional, IsEnum, IsDateString, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { InspectionType, InspectionStatus, InspectionItemResult, Severity } from '../enums';

/**
 * 创建质检报告DTO
 */
export class CreateQualityInspectionDto {
  /** 质检类型 */
  @IsEnum(InspectionType)
  type: InspectionType;

  /** 来源单据ID */
  @IsString()
  @IsOptional()
  sourceId?: string;

  /** 质检日期 */
  @IsDateString()
  inspectionDate: string;

  /** 关联的质检标准ID */
  @IsString()
  @IsOptional()
  standardId?: string;

  /** 抽样数量 */
  @IsInt()
  sampleSize: number;

  /** 备注 */
  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 质检项DTO
 */
export class InspectionItemDto {
  /** 质检项目名称 */
  @IsString()
  itemName: string;

  /** 检测方法 */
  @IsString()
  @IsOptional()
  checkMethod?: string;

  /** 合格标准 */
  @IsString()
  @IsOptional()
  standard?: string;

  /** 实际检测值 */
  @IsString()
  @IsOptional()
  actualValue?: string;

  /** 检测结果 */
  @IsEnum(InspectionItemResult)
  result: InspectionItemResult;

  /** 严重程度 */
  @IsEnum(Severity)
  @IsOptional()
  severity?: Severity;

  /** 不合格数量 */
  @IsInt()
  @IsOptional()
  defectQuantity?: number;

  /** 备注 */
  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 添加质检项DTO
 */
export class AddInspectionItemDto {
  /** 质检项目名称 */
  @IsString()
  itemName: string;

  /** 检测方法 */
  @IsString()
  @IsOptional()
  checkMethod?: string;

  /** 合格标准 */
  @IsString()
  @IsOptional()
  standard?: string;

  /** 实际检测值 */
  @IsString()
  @IsOptional()
  actualValue?: string;

  /** 检测结果 */
  @IsEnum(InspectionItemResult)
  result: InspectionItemResult;

  /** 严重程度 */
  @IsEnum(Severity)
  @IsOptional()
  severity?: Severity;

  /** 不合格数量 */
  @IsInt()
  @IsOptional()
  defectQuantity?: number;

  /** 备注 */
  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 批量添加质检项DTO
 */
export class AddInspectionItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddInspectionItemDto)
  items: AddInspectionItemDto[];
}

/**
 * 查询质检报告DTO
 */
export class QueryQualityInspectionDto {
  /** 搜索关键字 */
  @IsString()
  @IsOptional()
  search?: string;

  /** 质检类型 */
  @IsEnum(InspectionType)
  @IsOptional()
  type?: InspectionType;

  /** 质检状态 */
  @IsEnum(InspectionStatus)
  @IsOptional()
  status?: InspectionStatus;

  /** 开始日期 */
  @IsDateString()
  @IsOptional()
  startDate?: string;

  /** 结束日期 */
  @IsDateString()
  @IsOptional()
  endDate?: string;

  /** 来源单据ID */
  @IsString()
  @IsOptional()
  sourceId?: string;

  /** 页码 */
  @IsOptional()
  page?: number;

  /** 每页数量 */
  @IsOptional()
  limit?: number;
}
