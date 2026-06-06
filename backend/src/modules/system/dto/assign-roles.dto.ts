import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 分配角色 DTO
 */
export class AssignRolesDto {
  @ApiProperty({
    description: '角色ID列表',
    example: ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'],
  })
  @IsArray({ message: '角色ID列表必须是数组' })
  @ArrayMinSize(1, { message: '至少需要分配一个角色' })
  @IsUUID(undefined, { each: true, message: '角色ID格式不正确' })
  roleIds: string[];
}
