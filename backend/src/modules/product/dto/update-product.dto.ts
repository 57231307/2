import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ProductType, ProductStatus } from '../enums';

/**
 * 更新产品DTO
 */
export class UpdateProductDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

  @IsString()
  @IsOptional()
  spec?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  colorFormulaId?: string;

  @IsString()
  @IsOptional()
  patternId?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsArray()
  @IsOptional()
  images?: any[];

  @IsArray()
  @IsOptional()
  attachments?: any[];

  @IsString()
  @IsOptional()
  remark?: string;

  @IsOptional()
  hasColorVariants?: boolean;

  @IsString()
  @IsOptional()
  defaultVariantId?: string;
}