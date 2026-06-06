import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建角色 DTO
 */
export class CreateRoleDto {
  @ApiProperty({ description: '角色编码（唯一）', example: 'CUSTOM_ROLE_001' })
  @IsString()
  @IsNotEmpty({ message: '角色编码不能为空' })
  code: string;

  @ApiProperty({ description: '角色名称', example: '自定义角色' })
  @IsString()
  @IsNotEmpty({ message: '角色名称不能为空' })
  name: string;

  @ApiPropertyOptional({ description: '角色描述', example: '用于特定业务场景的自定义角色' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '是否激活', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '是否为系统角色', default: false })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;

  @ApiPropertyOptional({
    description: '权限ID列表',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsArray()
  @IsOptional()
  permissionIds?: string[];
}
