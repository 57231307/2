import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 分配权限 DTO
 */
export class AssignPermissionsDto {
  @ApiProperty({
    description: '权限ID列表',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsArray()
  @IsUUID(undefined, { each: true, message: '权限ID格式不正确' })
  permissionIds: string[];
}
