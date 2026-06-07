import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PatternCopyrightService } from '../services/pattern-copyright.service';
import {
  CreatePatternCopyrightDto,
  QueryPatternCopyrightDto,
} from '../dto';

/**
 * 花型版权控制器
 * 提供花型版权的RESTful API
 */
@Controller('api/v1/pattern-copyrights')
export class PatternCopyrightController {
  constructor(private readonly copyrightService: PatternCopyrightService) {}

  /**
   * 创建版权
   * POST /api/v1/pattern-copyrights
   */
  @Post()
  async create(@Body() data: CreatePatternCopyrightDto) {
    const result = await this.copyrightService.create(data);
    return {
      success: true,
      data: result,
      message: '版权创建成功',
    };
  }

  /**
   * 查询版权列表（分页）
   * GET /api/v1/pattern-copyrights
   */
  @Get()
  async findAll(@Query() query: QueryPatternCopyrightDto) {
    const result = await this.copyrightService.findAll(query);
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
   * 获取版权详情
   * GET /api/v1/pattern-copyrights/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.copyrightService.findOne(id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 根据花型ID获取版权
   * GET /api/v1/pattern-copyrights/pattern/:patternId
   */
  @Get('pattern/:patternId')
  async findByPatternId(@Param('patternId') patternId: string) {
    const result = await this.copyrightService.findByPatternId(patternId);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取即将到期的版权
   * GET /api/v1/pattern-copyrights/expiring?days=30
   */
  @Get('expiring/list')
  async findExpiring(@Query('days') days: string) {
    const daysNumber = days ? parseInt(days, 10) : 30;
    const result = await this.copyrightService.findExpiring(daysNumber);
    return {
      success: true,
      data: result,
      message: `找到${result.length}条即将到期的版权`,
    };
  }

  /**
   * 获取已过期的版权
   * GET /api/v1/pattern-copyrights/expired
   */
  @Get('expired/list')
  async findExpired() {
    const result = await this.copyrightService.findExpired();
    return {
      success: true,
      data: result,
      message: `找到${result.length}条已过期的版权`,
    };
  }

  /**
   * 获取版权使用统计
   * GET /api/v1/pattern-copyrights/:id/stats
   */
  @Get(':id/stats')
  async getUsageStats(@Param('id') id: string) {
    const result = await this.copyrightService.getUsageStats(id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 更新过期版权状态（定时任务接口）
   * POST /api/v1/pattern-copyrights/update-expired-statuses
   */
  @Post('update-expired-statuses')
  @HttpCode(HttpStatus.OK)
  async updateExpiredStatuses() {
    await this.copyrightService.updateExpiredStatuses();
    return {
      success: true,
      message: '版权状态已更新',
    };
  }
}
