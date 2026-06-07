import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 更新颜色变体DTO
 */
export class UpdateColorVariantDto {
  @IsString()
  @IsOptional()
  colorNo?: string;

  @IsString()
  @IsOptional()
  colorName?: string;

  @IsString()
  @IsOptional()
  colorCode?: string;

  // ========== 价格管理 ==========

  /**
   * 销售价格
   */
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  salePrice?: number;

  /**
   * 标准成本
   */
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  standardCost?: number;

  /**
   * 批发价格
   */
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  wholesalePrice?: number;

  /**
   * VIP价格
   */
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  vipPrice?: number;

  // ========== 颜色信息 ==========

  /**
   * 关联颜色配方ID
   */
  @IsString()
  @IsOptional()
  colorFormulaId?: string;

  /**
   * LAB值L
   */
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  labL?: number;

  /**
   * LAB值a
   */
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  labA?: number;

  /**
   * LAB值b
   */
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  labB?: number;

  /**
   * RGB颜色值
   */
  @IsString()
  @IsOptional()
  rgbColor?: string;

  /**
   * HEX颜色值
   */
  @IsString()
  @IsOptional()
  hexColor?: string;

  // ========== 图片管理 ==========

  /**
   * 颜色变体图片列表
   */
  @IsArray()
  @IsOptional()
  images?: any[];

  // ========== 规格参数 ==========

  /**
   * 克重（g/m²）
   */
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  weight?: number;

  /**
   * 幅宽（cm）
   */
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  width?: number;

  // ========== 状态管理 ==========

  /**
   * 是否为默认颜色
   */
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  /**
   * 状态
   */
  @IsString()
  @IsOptional()
  status?: string;
}