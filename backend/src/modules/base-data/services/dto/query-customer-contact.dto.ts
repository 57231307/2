import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 查询客户联系人DTO
 */
export class QueryCustomerContactDto {
  @ApiPropertyOptional({ description: '客户ID' })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ description: '搜索关键字（联系人姓名/电话/邮箱）' })
  @IsString()
  @IsOptional()
  search?: string;
}
