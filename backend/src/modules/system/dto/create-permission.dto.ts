import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionType } from '../entities/permission.entity';

/**
 * 创建权限 DTO
 */
export class CreatePermissionDto {
  @ApiProperty({ description: '权限编码（唯一）', example: 'PRODUCT_VIEW' })
  @IsString()
  @IsNotEmpty({ message: '权限编码不能为空' })
  code: string;

  @ApiProperty({ description: '权限名称', example: '查看产品' })
  @IsString()
  @IsNotEmpty({ message: '权限名称不能为空' })
  name: string;

  @ApiProperty({
    description: '权限类型',
    enum: PermissionType,
    example: PermissionType.ACTION,
  })
  @IsEnum(PermissionType, { message: '权限类型无效' })
  @IsNotEmpty({ message: '权限类型不能为空' })
  type: PermissionType;

  @ApiPropertyOptional({ description: '所属模块', example: 'PRODUCT' })
  @IsString()
  @IsOptional()
  module?: string;

  @ApiPropertyOptional({ description: '权限描述', example: '允许查看产品信息' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '排序号', example: 1, default: 0 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ description: '是否激活', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '是否为系统权限', default: false })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;
}
