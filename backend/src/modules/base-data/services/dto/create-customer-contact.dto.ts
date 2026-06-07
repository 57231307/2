import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建客户联系人DTO
 */
export class CreateCustomerContactDto {
  @ApiProperty({ description: '客户ID' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ description: '联系人姓名' })
  @IsString()
  contactName: string;

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
