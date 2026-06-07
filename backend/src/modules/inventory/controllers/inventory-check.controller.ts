import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InventoryCheckService, CreateInventoryCheckDto, QueryInventoryCheckDto, UpdateInventoryCheckDto, SubmitCheckResultDto, ApproveDifferenceDto, InventoryCheckReport } from '../services/inventory-check.service';
import { InventoryCheck, InventoryCheckStatus } from '../entities/inventory-check.entity';

@ApiTags('盘点管理')
@Controller('api/v1/inventory-checks')
export class InventoryCheckController {
  constructor(private readonly checkService: InventoryCheckService) {}

  @Post()
  @ApiOperation({ summary: '创建盘点单' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() data: CreateInventoryCheckDto): Promise<InventoryCheck> {
    return this.checkService.create(data);
  }

  @Get()
  @ApiOperation({ summary: '查询盘点单列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Query() query: QueryInventoryCheckDto,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<{ data: InventoryCheck[]; total: number; page: number; limit: number }> {
    return this.checkService.findAll(query, Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: '获取盘点单详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<InventoryCheck> {
    return this.checkService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新盘点单' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateInventoryCheckDto,
  ): Promise<InventoryCheck> {
    return this.checkService.update(id, data);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: '提交盘点结果' })
  @ApiResponse({ status: 200, description: '提交成功' })
  async submitCheck(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() items: SubmitCheckResultDto,
  ): Promise<InventoryCheck> {
    return this.checkService.submitCheck(id, items.items);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '审批差异' })
  @ApiResponse({ status: 200, description: '审批成功' })
  async approveDifference(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: ApproveDifferenceDto,
  ): Promise<InventoryCheck> {
    return this.checkService.approveDifference(id, data.approved, data.notes);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: '完成盘点' })
  @ApiResponse({ status: 200, description: '完成成功' })
  async complete(@Param('id', ParseUUIDPipe) id: string): Promise<InventoryCheck> {
    return this.checkService.complete(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除盘点单' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.checkService.remove(id);
  }

  @Get(':id/report')
  @ApiOperation({ summary: '获取盘点报告' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getReport(@Param('id', ParseUUIDPipe) id: string): Promise<InventoryCheckReport> {
    return this.checkService.getReport(id);
  }
}
