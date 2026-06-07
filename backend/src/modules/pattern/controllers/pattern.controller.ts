import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PatternService } from '../services/pattern.service';
import {
  CreatePatternDto,
  UpdatePatternDto,
  QueryPatternDto,
} from '../dto';

/**
 * 花型控制器
 * 提供花型的RESTful API
 */
@Controller('api/v1/patterns')
export class PatternController {
  constructor(private readonly patternService: PatternService) {}

  /**
   * 创建花型
   * POST /api/v1/patterns
   */
  @Post()
  async create(@Body() data: CreatePatternDto) {
    const result = await this.patternService.create(data);
    return {
      success: true,
      data: result,
      message: '花型创建成功',
    };
  }

  /**
   * 查询花型列表（分页）
   * GET /api/v1/patterns
   */
  @Get()
  async findAll(@Query() query: QueryPatternDto) {
    const result = await this.patternService.findAll(query);
    return {
      success: true,
      data: {
        items: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
      },
      message: '查询成功',
    };
  }

  /**
   * 获取花型详情
   * GET /api/v1/patterns/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.patternService.findOne(id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 更新花型
   * PUT /api/v1/patterns/:id
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdatePatternDto) {
    const result = await this.patternService.update(id, data);
    return {
      success: true,
      data: result,
      message: '花型更新成功',
    };
  }

  /**
   * 删除花型（软删除）
   * DELETE /api/v1/patterns/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.patternService.remove(id);
    return {
      success: true,
      message: '花型已停用',
    };
  }

  /**
   * 搜索花型
   * GET /api/v1/patterns/search/:keyword
   */
  @Get('search/:keyword')
  async search(@Param('keyword') keyword: string) {
    const result = await this.patternService.search(keyword);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 根据风格获取花型列表
   * GET /api/v1/patterns/style/:style
   */
  @Get('style/:style')
  async findByStyle(@Param('style') style: string) {
    const result = await this.patternService.findByStyle(style);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 根据用途获取花型列表
   * GET /api/v1/patterns/usage/:usage
   */
  @Get('usage/:usage')
  async findByUsage(@Param('usage') usage: string) {
    const result = await this.patternService.findByUsage(usage);
    return {
      success: true,
      data: result,
    };
  }
}
