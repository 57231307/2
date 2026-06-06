import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionType } from '../entities/permission.entity';

/**
 * 更新权限 DTO
 */
export class UpdatePermissionDto {
  @ApiPropertyOptional({ description: '权限编码（唯一）', example: 'PRODUCT_VIEW' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ description: '权限名称', example: '查看产品' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: '权限类型',
    enum: PermissionType,
    example: PermissionType.ACTION,
  })
  @IsEnum(PermissionType, { message: '权限类型无效' })
  @IsOptional()
  type?: PermissionType;

  @ApiPropertyOptional({ description: '所属模块', example: 'PRODUCT' })
  @IsString()
  @IsOptional()
  module?: string;

  @ApiPropertyOptional({ description: '权限描述', example: '允许查看产品信息' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '排序号', example: 1 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ description: '是否激活', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
