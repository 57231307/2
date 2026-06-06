import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { WarehouseType, WarehouseStatus } from '../entities/warehouse.entity';
import { LocationDto } from './create-warehouse.dto';

export class UpdateWarehouseDto {
  @ApiPropertyOptional({ description: '仓库编码', example: 'WH-20240101-0001' })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: '仓库编码最多50个字符' })
  code?: string;

  @ApiPropertyOptional({ description: '仓库名称', example: '原料仓A区' })
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: '仓库名称最多200个字符' })
  name?: string;

  @ApiPropertyOptional({
    description: '仓库类型',
    enum: WarehouseType,
    example: WarehouseType.RAW_MATERIAL,
  })
  @IsEnum(WarehouseType, { message: '仓库类型不合法' })
  @IsOptional()
  type?: WarehouseType;

  @ApiPropertyOptional({ description: '仓库地址', example: '上海市浦东新区张江路100号' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: '负责人', example: '张三' })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: '负责人姓名最多100个字符' })
  manager?: string;

  @ApiPropertyOptional({
    description: '库位配置',
    type: [LocationDto],
    example: [
      { code: 'A01', name: 'A区01号库位', type: 'STORAGE', description: '原料存储区' },
    ],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  locations?: LocationDto[];

  @ApiPropertyOptional({
    description: '仓库状态',
    enum: WarehouseStatus,
    example: WarehouseStatus.ACTIVE,
  })
  @IsEnum(WarehouseStatus, { message: '仓库状态不合法' })
  @IsOptional()
  status?: WarehouseStatus;

  @ApiPropertyOptional({ description: '元数据', example: { capacity: 1000, area: 500 } })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: '备注', example: '主要用于存储原材料' })
  @IsString()
  @IsOptional()
  remark?: string;
}
