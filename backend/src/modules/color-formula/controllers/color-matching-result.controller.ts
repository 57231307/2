import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ColorMatchingResultService,
  CreateColorMatchingResultDto,
  UpdateColorMatchingResultDto,
  QueryColorMatchingResultDto,
} from '../services/color-matching-result.service';
import { ColorMatchingResult } from '../entities/color-matching-result.entity';

@ApiTags('配色结果管理')
@Controller('api/v1/color-matching-results')
export class ColorMatchingResultController {
  constructor(private readonly resultService: ColorMatchingResultService) {}

  @Post()
  @ApiOperation({ summary: '创建配色结果记录' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() data: CreateColorMatchingResultDto): Promise<ColorMatchingResult> {
    return this.resultService.create(data);
  }

  @Get()
  @ApiOperation({ summary: '获取配色结果列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Query() query: QueryColorMatchingResultDto,
  ): Promise<{ data: ColorMatchingResult[]; total: number; page: number; limit: number }> {
    return this.resultService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取配色结果详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string): Promise<ColorMatchingResult> {
    return this.resultService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新配色结果' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id') id: string,
    @Body() data: UpdateColorMatchingResultDto,
  ): Promise<ColorMatchingResult> {
    return this.resultService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除配色结果' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.resultService.remove(id);
  }

  @Get('stats/qualification-rate')
  @ApiOperation({ summary: '获取配色合格率统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getQualificationRate(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ total: number; qualified: number; unqualified: number; rate: number }> {
    return this.resultService.getQualificationRate(startDate, endDate);
  }
}
