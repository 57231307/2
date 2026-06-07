import { IsString, IsOptional, IsNumber, IsArray, IsEnum, IsDate } from 'class-validator';
import { FormulaStatus } from '../enums';

/**
 * 创建颜色配方DTO
 */
export class CreateColorFormulaDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsNumber()
  labL: number;

  @IsNumber()
  labA: number;

  @IsNumber()
  labB: number;

  @IsString()
  @IsOptional()
  rgbColor?: string;

  @IsString()
  @IsOptional()
  hexColor?: string;

  @IsEnum(FormulaStatus)
  @IsOptional()
  status?: FormulaStatus;

  @IsNumber()
  @IsOptional()
  totalWeight?: number;

  @IsNumber()
  @IsOptional()
  referencePrice?: number;

  @IsString()
  @IsOptional()
  applicableProductType?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  images?: any[];

  @IsArray()
  @IsOptional()
  attachments?: any[];

  @IsString()
  @IsOptional()
  remark?: string;

  @IsDate()
  @IsOptional()
  effectiveDate?: Date;

  @IsDate()
  @IsOptional()
  expiryDate?: Date;

  /** 配方明细列表 */
  @IsArray()
  @IsOptional()
  items?: CreateColorFormulaItemDto[];
}

/**
 * 创建颜色配方明细DTO
 */
export class CreateColorFormulaItemDto {
  @IsString()
  materialId: string;

  @IsString()
  materialCode: string;

  @IsString()
  materialName: string;

  @IsString()
  @IsOptional()
  materialColorCode?: string;

  @IsString()
  @IsOptional()
  materialColorName?: string;

  @IsNumber()
  percentage: number;

  @IsNumber()
  weight: number;

  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @IsNumber()
  @IsOptional()
  subtotal?: number;

  @IsString()
  @IsOptional()
  remark?: string;
}