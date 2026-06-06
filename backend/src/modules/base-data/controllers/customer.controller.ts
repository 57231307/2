import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerQueryDto } from '../services/customer.service';
import { CustomerType, CustomerStatus } from '../entities/customer.entity';

@ApiTags('客户管理')
@Controller({ path: 'customers', version: '1' })
@ApiBearerAuth()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建客户' })
  @ApiResponse({
    status: 201,
    description: '客户创建成功',
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    const customer = await this.customerService.create(createCustomerDto);
    return {
      message: '客户创建成功',
      data: customer,
    };
  }

  @Get()
  @ApiOperation({ summary: '获取客户列表（分页、过滤）' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'keyword', required: false, description: '关键词搜索' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: CustomerType,
    description: '客户类型',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: CustomerStatus,
    description: '客户状态',
  })
  @ApiQuery({ name: 'salespersonId', required: false, description: '销售员ID' })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: '排序方向' })
  @ApiResponse({
    status: 200,
    description: '获取客户列表成功',
  })
  async findAll(@Query() query: CustomerQueryDto) {
    const result = await this.customerService.findAll(query);
    return {
      message: '获取客户列表成功',
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取客户详情' })
  @ApiParam({ name: 'id', description: '客户ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '获取客户详情成功',
  })
  @ApiResponse({ status: 404, description: '客户不存在' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const customer = await this.customerService.findOne(id);
    return {
      message: '获取客户详情成功',
      data: customer,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新客户信息' })
  @ApiParam({ name: 'id', description: '客户ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '客户更新成功',
  })
  @ApiResponse({ status: 404, description: '客户不存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    const customer = await this.customerService.update(id, updateCustomerDto);
    return {
      message: '客户更新成功',
      data: customer,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除客户（软删除）' })
  @ApiParam({ name: 'id', description: '客户ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '客户删除成功',
  })
  @ApiResponse({ status: 404, description: '客户不存在' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.customerService.remove(id);
    return {
      message: '客户删除成功',
    };
  }

  @Get('code/:code')
  @ApiOperation({ summary: '根据编码获取客户' })
  @ApiParam({ name: 'code', description: '客户编码', example: 'CUS-20260101-0001' })
  @ApiResponse({
    status: 200,
    description: '获取客户成功',
  })
  @ApiResponse({ status: 404, description: '客户不存在' })
  async findByCode(@Param('code') code: string) {
    const customer = await this.customerService.findByCode(code);
    if (!customer) {
      return {
        message: '客户不存在',
        data: null,
      };
    }
    return {
      message: '获取客户成功',
      data: customer,
    };
  }

  @Post(':id/check-credit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '检查客户信用额度' })
  @ApiParam({ name: 'id', description: '客户ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '信用额度检查成功',
  })
  @ApiResponse({ status: 404, description: '客户不存在' })
  async checkCreditLimit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { requiredAmount: number },
  ) {
    const result = await this.customerService.checkCreditLimit(
      id,
      body.requiredAmount,
    );
    return {
      message: '信用额度检查成功',
      data: result,
    };
  }
}
