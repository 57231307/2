import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomerService } from '../services/customer.service';
import { Customer } from '../entities/customer.entity';
import { CreateCustomerDto } from '../services/dto/create-customer.dto';
import { UpdateCustomerDto } from '../services/dto/update-customer.dto';
import { QueryCustomerDto } from '../services/dto/query-customer.dto';

@ApiTags('客户管理')
@Controller('api/v1/customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: '创建客户' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() data: CreateCustomerDto): Promise<Customer> {
    return this.customerService.create(data);
  }

  @Get()
  @ApiOperation({ summary: '获取客户列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: QueryCustomerDto): Promise<{ data: Customer[]; total: number; page: number; limit: number }> {
    return this.customerService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取客户详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string): Promise<Customer> {
    return this.customerService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新客户' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Param('id') id: string, @Body() data: UpdateCustomerDto): Promise<Customer> {
    return this.customerService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除客户' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.customerService.remove(id);
  }

  @Post(':id/check-credit')
  @ApiOperation({ summary: '检查客户信用额度' })
  @ApiResponse({ status: 200, description: '检查成功' })
  async checkCreditLimit(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ): Promise<{ passed: boolean; message: string }> {
    return this.customerService.checkCreditLimit(id, amount);
  }
}
