import { IsOptional, IsEnum, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerType, CustomerStatus } from '../../entities/customer.entity';

/**
 * 查询客户DTO
 */
export class QueryCustomerDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number = 20;

  @ApiPropertyOptional({ description: '搜索关键词（名称或编码）' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '客户类型', enum: CustomerType })
  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;

  @ApiPropertyOptional({ description: '客户状态', enum: CustomerStatus })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @ApiPropertyOptional({ description: '负责销售员ID' })
  @IsOptional()
  @IsString()
  salespersonId?: string;
}
