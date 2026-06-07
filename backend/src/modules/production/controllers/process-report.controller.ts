import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProcessReportService, CreateProcessReportDto, UpdateProcessReportDto, QueryProcessReportDto } from '../services/process-report.service';
import { ProcessReport } from '../entities/process-report.entity';

@ApiTags('工序汇报管理')
@Controller('api/v1/process-reports')
export class ProcessReportController {
  constructor(private readonly reportService: ProcessReportService) {}

  @Post()
  @ApiOperation({ summary: '创建工序汇报' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() data: CreateProcessReportDto): Promise<ProcessReport> {
    return this.reportService.create(data);
  }

  @Get()
  @ApiOperation({ summary: '获取工序汇报列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Query() query: QueryProcessReportDto,
  ): Promise<{ data: ProcessReport[]; total: number; page: number; limit: number }> {
    return this.reportService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取工序汇报详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string): Promise<ProcessReport> {
    return this.reportService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新工序汇报' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id') id: string,
    @Body() data: UpdateProcessReportDto,
  ): Promise<ProcessReport> {
    return this.reportService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除工序汇报' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.reportService.remove(id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: '提交工序汇报' })
  @ApiResponse({ status: 200, description: '提交成功' })
  async submit(@Param('id') id: string): Promise<ProcessReport> {
    return this.reportService.submit(id);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: '确认工序汇报' })
  @ApiResponse({ status: 200, description: '确认成功' })
  async confirm(@Param('id') id: string): Promise<ProcessReport> {
    return this.reportService.confirm(id);
  }
}
