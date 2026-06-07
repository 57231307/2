import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { FormulaStatus } from '../enums';

/**
 * 查询颜色配方DTO
 */
export class QueryColorFormulaDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(FormulaStatus)
  @IsOptional()
  status?: FormulaStatus;

  @IsString()
  @IsOptional()
  applicableProductType?: string;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}