import { IsString, IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { CopyrightStatus } from '../enums';

/**
 * 查询花型版权DTO
 */
export class QueryPatternCopyrightDto {
  /** 页码 */
  @IsNumber()
  @IsOptional()
  page?: number;

  /** 每页数量 */
  @IsNumber()
  @IsOptional()
  limit?: number;

  /** 花型ID */
  @IsString()
  @IsOptional()
  patternId?: string;

  /** 版权状态 */
  @IsEnum(CopyrightStatus)
  @IsOptional()
  status?: CopyrightStatus;

  /** 即将到期天数 */
  @IsNumber()
  @IsOptional()
  expiringDays?: number;
}
