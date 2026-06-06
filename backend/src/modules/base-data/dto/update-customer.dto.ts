import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsNumber,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerType, CustomerStatus } from '../entities/customer.entity';

/**
 * 更新客户 DTO
 */
export class UpdateCustomerDto {
  @ApiPropertyOptional({
    description: '客户名称',
    example: '深圳市某某科技有限公司',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: '客户类型',
    enum: CustomerType,
  })
  @IsEnum(CustomerType, { message: '客户类型无效' })
  @IsOptional()
  type?: CustomerType;

  @ApiPropertyOptional({ description: '联系人', example: '张三' })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiPropertyOptional({ description: '电话', example: '13800138000' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: '邮箱', example: 'contact@example.com' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: '地址',
    example: '深圳市南山区科技园路1号',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: '信用额度',
    example: 100000,
  })
  @IsNumber()
  @Min(0, { message: '信用额度不能为负数' })
  @IsOptional()
  creditLimit?: number;

  @ApiPropertyOptional({
    description: '账期（天）',
    example: 30,
  })
  @IsNumber()
  @Min(0, { message: '账期不能为负数' })
  @IsOptional()
  paymentTerms?: number;

  @ApiPropertyOptional({
    description: '销售员ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID(undefined, { message: '销售员ID格式不正确' })
  @IsOptional()
  salespersonId?: string;

  @ApiPropertyOptional({
    description: '状态',
    enum: CustomerStatus,
  })
  @IsEnum(CustomerStatus, { message: '状态无效' })
  @IsOptional()
  status?: CustomerStatus;

  @ApiPropertyOptional({ description: '元数据', example: { tag: '重点客户' } })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: '备注', example: '长期合作客户' })
  @IsString()
  @IsOptional()
  remark?: string;
}
