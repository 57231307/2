import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PurchaseInquiryService } from '../services/purchase-inquiry.service';
import { PurchaseInquiry } from '../entities/purchase-inquiry.entity';
import {
  CreatePurchaseInquiryDto,
  UpdatePurchaseInquiryDto,
  QueryPurchaseInquiryDto,
  CompareInquiriesDto,
} from '../dto/purchase-inquiry.dto';

@ApiTags('采购询价单管理')
@Controller('api/v1/purchase-inquiries')
export class PurchaseInquiryController {
  constructor(private readonly inquiryService: PurchaseInquiryService) {}

  @Post()
  @ApiOperation({ summary: '创建询价单' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() data: CreatePurchaseInquiryDto): Promise<PurchaseInquiry> {
    return this.inquiryService.create(data);
  }

  @Get()
  @ApiOperation({ summary: '获取询价单列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Query() query: QueryPurchaseInquiryDto,
  ): Promise<{ data: PurchaseInquiry[]; total: number; page: number; limit: number }> {
    return this.inquiryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取询价单详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string): Promise<PurchaseInquiry> {
    return this.inquiryService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新询价单' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id') id: string,
    @Body() data: UpdatePurchaseInquiryDto,
  ): Promise<PurchaseInquiry> {
    return this.inquiryService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除询价单' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.inquiryService.remove(id);
  }

  @Post('compare')
  @ApiOperation({ summary: '对比多个询价单' })
  @ApiResponse({ status: 200, description: '对比成功' })
  async compare(@Body() data: CompareInquiriesDto): Promise<any> {
    return this.inquiryService.compare(data);
  }
}
