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
import { ColorFormulaService } from '../services/color-formula.service';
import {
  CreateColorFormulaDto,
  UpdateColorFormulaDto,
  QueryColorFormulaDto,
  CreateColorDifferenceDto,
  CalculateColorFormulaDto,
  CheckColorDifferenceDto,
} from '../dto';

/**
 * 颜色配方控制器
 * 提供颜色配方和色差检测的RESTful API
 */
@Controller('api/v1')
export class ColorFormulaController {
  constructor(private readonly colorFormulaService: ColorFormulaService) {}

  // ========== 颜色配方API ==========

  /**
   * 创建配方
   * POST /api/v1/color-formulas
   */
  @Post('color-formulas')
  async create(@Body() data: CreateColorFormulaDto) {
    const result = await this.colorFormulaService.create(data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 查询配方列表（分页）
   * GET /api/v1/color-formulas
   */
  @Get('color-formulas')
  async findAll(@Query() query: QueryColorFormulaDto) {
    const result = await this.colorFormulaService.findAll(query);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * 获取配方详情
   * GET /api/v1/color-formulas/:id
   */
  @Get('color-formulas/:id')
  async findOne(@Param('id') id: string) {
    const result = await this.colorFormulaService.findOne(id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 更新配方
   * PUT /api/v1/color-formulas/:id
   */
  @Put('color-formulas/:id')
  async update(@Param('id') id: string, @Body() data: UpdateColorFormulaDto) {
    const result = await this.colorFormulaService.update(id, data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 删除配方（软删除）
   * DELETE /api/v1/color-formulas/:id
   */
  @Delete('color-formulas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.colorFormulaService.remove(id);
    return {
      success: true,
    };
  }

  /**
   * 创建配方版本
   * POST /api/v1/color-formulas/:id/version
   */
  @Post('color-formulas/:id/version')
  async createVersion(@Param('id') id: string, @Body() data: { version: string }) {
    const result = await this.colorFormulaService.createVersion(id, data.version);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 计算配方比例
   * POST /api/v1/color-formulas/:id/calculate
   */
  @Post('color-formulas/:id/calculate')
  async calculate(
    @Param('id') id: string,
    @Body() targetLab: { l: number; a: number; b: number },
  ) {
    const result = await this.colorFormulaService.calculate(id, targetLab);
    return {
      success: true,
      data: result,
    };
  }

  // ========== 色差检测API ==========

  /**
   * 记录色差检测
   * POST /api/v1/color-differences
   */
  @Post('color-differences')
  async createDifference(@Body() data: CreateColorDifferenceDto) {
    const result = await this.colorFormulaService.createDifference(data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 检查色差
   * POST /api/v1/color-differences/check
   */
  @Post('color-differences/check')
  async checkDifference(@Body() data: CheckColorDifferenceDto) {
    const result = await this.colorFormulaService.checkDifference(data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取配方的色差检测历史
   * GET /api/v1/color-differences/check/:formulaId
   */
  @Get('color-differences/check/:formulaId')
  async getDifferenceHistory(@Param('formulaId') formulaId: string) {
    const result = await this.colorFormulaService.getDifferenceHistory(formulaId);
    return {
      success: true,
      data: result,
    };
  }

  // ========== 配方明细API ==========

  /**
   * 添加配方明细
   * POST /api/v1/color-formulas/:id/items
   */
  @Post('color-formulas/:id/items')
  async addItem(@Param('id') id: string, @Body() data: any) {
    const result = await this.colorFormulaService.addItem(id, data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 更新配方明细
   * PUT /api/v1/color-formulas/:id/items/:itemId
   */
  @Put('color-formulas/:id/items/:itemId')
  async updateItem(@Param('id') id: string, @Param('itemId') itemId: string, @Body() data: any) {
    const result = await this.colorFormulaService.updateItem(itemId, data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 删除配方明细
   * DELETE /api/v1/color-formulas/:id/items/:itemId
   */
  @Delete('color-formulas/:id/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    await this.colorFormulaService.removeItem(itemId);
    return {
      success: true,
    };
  }
}