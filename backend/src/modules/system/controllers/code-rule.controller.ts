/**
 * 编码规则控制器
 * 提供编码规则的RESTful API
 */
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CodeRuleService, CreateCodeRuleDto, UpdateCodeRuleDto } from '../services/code-rule.service';

/**
 * 编码规则控制器
 */
@Controller('api/v1/code-rules')
export class CodeRuleController {
  constructor(private readonly codeRuleService: CodeRuleService) {}

  /**
   * 创建编码规则
   * POST /api/v1/code-rules
   */
  @Post()
  async create(@Body() dto: CreateCodeRuleDto) {
    const result = await this.codeRuleService.create(dto);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 查询所有编码规则
   * GET /api/v1/code-rules
   */
  @Get()
  async findAll() {
    const result = await this.codeRuleService.findAll();
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取启用的编码规则
   * GET /api/v1/code-rules/active
   */
  @Get('active')
  async findActive() {
    const result = await this.codeRuleService.findActive();
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取编码规则详情
   * GET /api/v1/code-rules/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.codeRuleService.findOne(id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 更新编码规则
   * PUT /api/v1/code-rules/:id
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCodeRuleDto) {
    const result = await this.codeRuleService.update(id, dto);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 删除编码规则
   * DELETE /api/v1/code-rules/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.codeRuleService.remove(id);
    return {
      success: true,
      message: '删除成功',
    };
  }

  /**
   * 生成编码
   * POST /api/v1/code-rules/:id/generate
   */
  @Post(':id/generate')
  async generateCode(@Param('id') id: string) {
    const rule = await this.codeRuleService.findOne(id);
    const code = await this.codeRuleService.generateCode(rule.ruleCode);
    return {
      success: true,
      data: { code },
    };
  }

  /**
   * 重置序号
   * POST /api/v1/code-rules/:id/reset
   */
  @Post(':id/reset')
  async resetSequence(@Param('id') id: string) {
    const result = await this.codeRuleService.resetSequence(id);
    return {
      success: true,
      data: result,
    };
  }
}
