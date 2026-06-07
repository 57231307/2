import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { PatternDesignService } from '../services/pattern-design.service';
import { CreatePatternDesignDto, UpdatePatternDesignDto, QueryPatternDesignDto, RejectPatternDesignDto, ApprovePatternDesignDto } from '../dto/pattern-design.dto';

/**
 * 花型设计控制器
 */
@Controller('api/v1/pattern-designs')
export class PatternDesignController {
  constructor(private readonly designService: PatternDesignService) {}

  /**
   * 创建设计记录
   */
  @Post()
  async create(@Body() dto: CreatePatternDesignDto) {
    return this.designService.create(dto);
  }

  /**
   * 查询设计列表
   */
  @Get()
  async findAll(
    @Query() query: QueryPatternDesignDto,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.designService.findAll(query, parseInt(page, 10), parseInt(limit, 10));
  }

  /**
   * 获取设计详情
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.designService.findOne(id);
  }

  /**
   * 更新设计
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePatternDesignDto) {
    return this.designService.update(id, dto);
  }

  /**
   * 提交审核
   */
  @Post(':id/submit')
  async submitForReview(@Param('id') id: string) {
    return this.designService.submitForReview(id);
  }

  /**
   * 审核通过
   */
  @Post(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body() dto: ApprovePatternDesignDto,
  ) {
    return this.designService.approve(id, '', dto.remark);
  }

  /**
   * 审核驳回
   */
  @Post(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectPatternDesignDto,
  ) {
    return this.designService.reject(id, '', dto);
  }

  /**
   * 归档
   */
  @Post(':id/archive')
  async archive(@Param('id') id: string) {
    return this.designService.archive(id);
  }
}
