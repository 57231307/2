import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsUUID,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../entities/user.entity';

/**
 * 创建用户 DTO
 */
export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'zhangsan' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  @MinLength(3, { message: '用户名至少3个字符' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '用户名只能包含字母、数字和下划线' })
  username: string;

  @ApiProperty({ description: '邮箱', example: 'zhangsan@example.com' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @ApiPropertyOptional({ description: '手机号码', example: '13800138000' })
  @IsString()
  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号码格式不正确' })
  phone?: string;

  @ApiProperty({ description: '姓名', example: '张三' })
  @IsString()
  @IsNotEmpty({ message: '姓名不能为空' })
  name: string;

  @ApiProperty({ description: '密码', example: 'Password123!' })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(8, { message: '密码至少8个字符' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: '密码必须包含大小写字母和数字',
  })
  password: string;

  @ApiPropertyOptional({ description: '头像URL', example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    description: '用户状态',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
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
