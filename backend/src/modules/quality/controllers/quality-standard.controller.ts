/**
 * 质检标准控制器
 * 提供质检标准的RESTful API
 */
import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { QualityStandardService } from '../services/quality-standard.service';
import { CreateQualityStandardDto, UpdateQualityStandardDto, QueryQualityStandardDto } from '../dto';

/**
 * 质检标准控制器
 */
@Controller('api/v1/quality-standards')
export class QualityStandardController {
  constructor(private readonly qualityStandardService: QualityStandardService) {}

  /**
   * 创建质检标准
   * POST /api/v1/quality-standards
   */
  @Post()
  async create(@Body() data: CreateQualityStandardDto) {
    const result = await this.qualityStandardService.create(data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 查询质检标准列表（分页）
   * GET /api/v1/quality-standards
   */
  @Get()
  async findAll(@Query() query: QueryQualityStandardDto) {
    const result = await this.qualityStandardService.findAll(query);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * 获取质检标准详情
   * GET /api/v1/quality-standards/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.qualityStandardService.findOne(id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 更新质检标准
   * PUT /api/v1/quality-standards/:id
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateQualityStandardDto) {
    const result = await this.qualityStandardService.update(id, data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 删除质检标准（软删除）
   * DELETE /api/v1/quality-standards/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.qualityStandardService.remove(id);
    return {
      success: true,
    };
  }
}
