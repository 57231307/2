import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 更新角色 DTO
 */
export class UpdateRoleDto {
  @ApiPropertyOptional({ description: '角色编码（唯一）', example: 'CUSTOM_ROLE_001' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ description: '角色名称', example: '自定义角色' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '角色描述', example: '用于特定业务场景的自定义角色' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '是否激活', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
