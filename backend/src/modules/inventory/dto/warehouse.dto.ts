import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { WarehouseType } from '../../base-data/entities/warehouse.entity';

/**
 * 创建仓库DTO
 */
export class CreateWarehouseDto {
  @ApiProperty({ description: '仓库编码', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: '仓库名称', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: '仓库类型', enum: WarehouseType })
  @IsEnum(WarehouseType)
  type: WarehouseType;

  @ApiPropertyOptional({ description: '仓库地址' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '仓库管理员' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  manager?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 更新仓库DTO
 */
export class UpdateWarehouseDto {
  @ApiPropertyOptional({ description: '仓库名称', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: '仓库类型', enum: WarehouseType })
  @IsOptional()
  @IsEnum(WarehouseType)
  type?: WarehouseType;

  @ApiPropertyOptional({ description: '仓库地址' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '仓库管理员' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  manager?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 查询仓库DTO
 */
export class QueryWarehouseDto {
  @ApiPropertyOptional({ description: '搜索关键字' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '仓库类型', enum: WarehouseType })
  @IsOptional()
  @IsEnum(WarehouseType)
  type?: WarehouseType;
}