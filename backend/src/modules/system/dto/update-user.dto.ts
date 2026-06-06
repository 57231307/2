import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsUUID,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../entities/user.entity';

/**
 * 更新用户 DTO
 */
export class UpdateUserDto {
  @ApiPropertyOptional({ description: '邮箱', example: 'zhangsan@example.com' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: '手机号码', example: '13800138000' })
  @IsString()
  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号码格式不正确' })
  phone?: string;

  @ApiPropertyOptional({ description: '姓名', example: '张三' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '头像URL', example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    description: '用户状态',
    enum: UserStatus,
  })
  @IsEnum(UserStatus, { message: '用户状态无效' })
  @IsOptional()
  status?: UserStatus;

  @ApiPropertyOptional({
    description: '角色ID列表',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsUUID(undefined, { each: true, message: '角色ID格式不正确' })
  @IsOptional()
  roleIds?: string[];

  @ApiPropertyOptional({ description: '元数据', example: { department: '技术部' } })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: '备注', example: '系统用户' })
  @IsString()
  @IsOptional()
  remark?: string;
}
