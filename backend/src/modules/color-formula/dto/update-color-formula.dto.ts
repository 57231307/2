import { IsString, IsOptional, IsNumber, IsArray, IsEnum, IsDate } from 'class-validator';
import { FormulaStatus } from '../enums';

/**
 * 更新颜色配方DTO
 */
export class UpdateColorFormulaDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsNumber()
  @IsOptional()
  labL?: number;

  @IsNumber()
  @IsOptional()
  labA?: number;

  @IsNumber()
  @IsOptional()
  labB?: number;

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
}

/**
 * 更新颜色配方明细DTO
 */
export class UpdateColorFormulaItemDto {
  @IsString()
  @IsOptional()
  materialId?: string;

  @IsString()
  @IsOptional()
  materialCode?: string;

  @IsString()
  @IsOptional()
  materialName?: string;

  @IsString()
  @IsOptional()
  materialColorCode?: string;

  @IsString()
  @IsOptional()
  materialColorName?: string;

  @IsNumber()
  @IsOptional()
  percentage?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

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