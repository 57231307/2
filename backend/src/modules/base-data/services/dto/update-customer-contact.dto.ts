import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 更新客户联系人DTO
 */
export class UpdateCustomerContactDto {
  @ApiPropertyOptional({ description: '联系人姓名' })
  @IsString()
  @IsOptional()
  contactName?: string;

  @ApiPropertyOptional({ description: '职务' })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiPropertyOptional({ description: '电话' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: '是否默认联系人' })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}
