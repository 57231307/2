import { IsString, IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { CopyrightStatus } from '../enums';

/**
 * 创建花型版权DTO
 */
export class CreatePatternCopyrightDto {
  /** 关联的花型ID */
  @IsString()
  patternId: string;

  /** 版权号 */
  @IsString()
  copyrightNo: string;

  /** 版权状态 */
  @IsEnum(CopyrightStatus)
  @IsOptional()
  status?: CopyrightStatus;

  /** 版权开始日期 */
  @IsDateString()
  startDate: string;

  /** 版权结束日期 */
  @IsDateString()
  endDate: string;

  /** 授权范围描述 */
  @IsString()
  @IsOptional()
  authorizedScope?: string;

  /** 授权类型 */
  @IsString()
  @IsOptional()
  licenseType?: string;

  /** 版权注册机构 */
  @IsString()
  @IsOptional()
  registrationAuthority?: string;

  /** 版权证书URL */
  @IsString()
  @IsOptional()
  certificateUrl?: string;

  /** 续费费用 */
  @IsNumber()
  @IsOptional()
  renewalCost?: number;

  /** 下次续费提醒日期 */
  @IsDateString()
  @IsOptional()
  nextRenewalReminderDate?: string;

  /** 备注 */
  @IsString()
  @IsOptional()
  remark?: string;
}
