import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsEmail,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SupplierType, SupplierStatus } from '../entities/supplier.entity';

export class UpdateSupplierDto {
  @ApiPropertyOptional({ description: '供应商编码', maxLength: 50 })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string;

  @ApiPropertyOptional({ description: '供应商名称', maxLength: 200 })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: '供应商类型', enum: SupplierType })
  @IsEnum(SupplierType, { message: '无效的供应商类型' })
  @IsOptional()
  type?: SupplierType;

  @ApiPropertyOptional({ description: '联系人', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  contactPerson?: string;

  @ApiPropertyOptional({ description: '联系电话', maxLength: 20 })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: '电子邮箱', maxLength: 100 })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ description: '地址' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: '信用额度' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  creditLimit?: number;

  @ApiPropertyOptional({ description: '账期天数' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  paymentTerms?: number;

  @ApiPropertyOptional({ description: '状态', enum: SupplierStatus })
  @IsEnum(SupplierStatus, { message: '无效的状态' })
  @IsOptional()
  status?: SupplierStatus;

  @ApiPropertyOptional({ description: '元数据' })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}
