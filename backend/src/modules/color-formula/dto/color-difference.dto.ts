import { IsString, IsNumber, IsOptional } from 'class-validator';

/**
 * 创建色差检测记录DTO
 */
export class CreateColorDifferenceDto {
  @IsString()
  formulaId: string;

  @IsNumber()
  sampleLabL: number;

  @IsNumber()
  sampleLabA: number;

  @IsNumber()
  sampleLabB: number;

  @IsNumber()
  standardLabL: number;

  @IsNumber()
  standardLabA: number;

  @IsNumber()
  standardLabB: number;

  @IsString()
  @IsOptional()
  inspector?: string;

  @IsString()
  @IsOptional()
  equipment?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 色差计算请求DTO（用于计算配方比例）
 */
export class CalculateColorFormulaDto {
  @IsNumber()
  targetLabL: number;

  @IsNumber()
  targetLabA: number;

  @IsNumber()
  targetLabB: number;

  @IsNumber()
  totalWeight: number;

  @IsString()
  @IsOptional()
  applicableProductType?: string;
}

/**
 * 色差检查请求DTO
 */
export class CheckColorDifferenceDto {
  @IsNumber()
  sampleLabL: number;

  @IsNumber()
  sampleLabA: number;

  @IsNumber()
  sampleLabB: number;

  @IsNumber()
  standardLabL: number;

  @IsNumber()
  standardLabA: number;

  @IsNumber()
  standardLabB: number;
}