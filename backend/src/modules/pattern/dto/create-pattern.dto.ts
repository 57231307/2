import { IsString, IsOptional, IsEnum, IsArray, IsNumber } from 'class-validator';
import { PatternStatus, PatternStyle, PatternUsage } from '../enums';

/**
 * 创建花型DTO
 */
export class CreatePatternDto {
  /** 花型编码（可选，不填则自动生成） */
  @IsString()
  @IsOptional()
  code?: string;

  /** 花型名称 */
  @IsString()
  name: string;

  /** 花型风格 */
  @IsEnum(PatternStyle)
  @IsOptional()
  style?: PatternStyle;

  /** 花型用途 */
  @IsEnum(PatternUsage)
  @IsOptional()
  usage?: PatternUsage;

  /** 花型分类 */
  @IsString()
  @IsOptional()
  category?: string;

  /** 花型描述 */
  @IsString()
  @IsOptional()
  description?: string;

  /** 花型状态 */
  @IsEnum(PatternStatus)
  @IsOptional()
  status?: PatternStatus;

  /** 花型图片URL列表 */
  @IsArray()
  @IsOptional()
  images?: any[];

  /** 花型缩略图URL */
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  /** 原始设计文件URL */
  @IsString()
  @IsOptional()
  designFileUrl?: string;

  /** 配色方案 */
  @IsArray()
  @IsOptional()
  colorScheme?: any[];

  /** 尺寸规格 */
  @IsOptional()
  dimensions?: Record<string, any>;

  /** 备注 */
  @IsString()
  @IsOptional()
  remark?: string;
}
