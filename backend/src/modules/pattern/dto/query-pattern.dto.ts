import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { PatternStatus, PatternStyle, PatternUsage } from '../enums';

/**
 * 查询花型DTO
 */
export class QueryPatternDto {
  /** 页码 */
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number;

  /** 每页数量 */
  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number;

  /** 搜索关键字（名称、编码） */
  @IsString()
  @IsOptional()
  search?: string;

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

  /** 花型状态 */
  @IsEnum(PatternStatus)
  @IsOptional()
  status?: PatternStatus;

  /** 排序字段 */
  @IsString()
  @IsOptional()
  sortBy?: string;

  /** 排序方向 */
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}
