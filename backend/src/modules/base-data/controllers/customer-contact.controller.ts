import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomerContactService } from '../services/customer-contact.service';
import { CustomerContact } from '../entities/customer-contact.entity';
import { CreateCustomerContactDto } from '../services/dto/create-customer-contact.dto';
import { UpdateCustomerContactDto } from '../services/dto/update-customer-contact.dto';
import { QueryCustomerContactDto } from '../services/dto/query-customer-contact.dto';

@ApiTags('客户联系人管理')
@Controller('api/v1/customer-contacts')
export class CustomerContactController {
  constructor(private readonly contactService: CustomerContactService) {}

  @Post()
  @ApiOperation({ summary: '创建客户联系人' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() data: CreateCustomerContactDto): Promise<CustomerContact> {
    return this.contactService.create(data);
  }

  @Get()
  @ApiOperation({ summary: '获取客户联系人列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Query() query: QueryCustomerContactDto,
  ): Promise<{ data: CustomerContact[]; total: number; page: number; limit: number }> {
    return this.contactService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取客户联系人详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string): Promise<CustomerContact> {
    return this.contactService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新客户联系人' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id') id: string,
    @Body() data: UpdateCustomerContactDto,
  ): Promise<CustomerContact> {
    return this.contactService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除客户联系人' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.contactService.remove(id);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: '根据客户ID获取联系人列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findByCustomerId(@Param('customerId') customerId: string): Promise<CustomerContact[]> {
    return this.contactService.findByCustomerId(customerId);
  }
}
