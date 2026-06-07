import { IsString, IsOptional, IsEnum, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerType } from '../../entities/customer.entity';

/**
 * 创建客户DTO
 */
export class CreateCustomerDto {
  @ApiProperty({ description: '客户编码', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: '客户名称', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: '客户类型', enum: CustomerType })
  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;

  @ApiPropertyOptional({ description: '联系人', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactPerson?: string;

  @ApiPropertyOptional({ description: '联系电话', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: '电子邮箱', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ description: '地址' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '信用额度' })
  @IsOptional()
  @IsNumber()
  creditLimit?: number;

  @ApiPropertyOptional({ description: '付款天数', default: 30 })
  @IsOptional()
  @IsNumber()
  paymentTerms?: number;

  @ApiPropertyOptional({ description: '负责销售员ID' })
  @IsOptional()
  @IsString()
  salespersonId?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiPropertyOptional({ description: '扩展数据' })
  @IsOptional()
  metadata?: Record<string, any>;
}
