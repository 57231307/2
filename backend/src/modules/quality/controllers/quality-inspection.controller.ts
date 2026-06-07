/**
 * 质检报告控制器
 * 提供质检报告的RESTful API
 */
import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { QualityInspectionService } from '../services/quality-inspection.service';
import { 
  CreateQualityInspectionDto, 
  AddInspectionItemDto,
  AddInspectionItemsDto,
  QueryQualityInspectionDto 
} from '../dto';

/**
 * 质检报告控制器
 */
@Controller('api/v1/quality-inspections')
export class QualityInspectionController {
  constructor(private readonly qualityInspectionService: QualityInspectionService) {}

  /**
   * 创建质检报告
   * POST /api/v1/quality-inspections
   */
  @Post()
  async create(@Body() data: CreateQualityInspectionDto) {
    const result = await this.qualityInspectionService.createInspection(data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 查询质检列表（分页）
   * GET /api/v1/quality-inspections
   */
  @Get()
  async findAll(@Query() query: QueryQualityInspectionDto) {
    const result = await this.qualityInspectionService.findInspections(query);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * 获取质检详情（包含明细）
   * GET /api/v1/quality-inspections/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.qualityInspectionService.findInspectionById(id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 添加质检项
   * POST /api/v1/quality-inspections/:id/items
   */
  @Post(':id/items')
  async addItem(@Param('id') id: string, @Body() data: AddInspectionItemDto) {
    const result = await this.qualityInspectionService.recordInspectionItem(id, data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 批量添加质检项
   * POST /api/v1/quality-inspections/:id/items/batch
   */
  @Post(':id/items/batch')
  async addItems(@Param('id') id: string, @Body() data: AddInspectionItemsDto) {
    const result = await this.qualityInspectionService.recordInspectionItems(id, data);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 计算质检结果
   * POST /api/v1/quality-inspections/:id/calculate
   */
  @Post(':id/calculate')
  async calculate(@Param('id') id: string) {
    const result = await this.qualityInspectionService.calculateResult(id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 审核通过
   * POST /api/v1/quality-inspections/:id/approve
   */
  @Post(':id/approve')
  async approve(@Param('id') id: string) {
    // 实际应用中应从当前用户获取审核人ID
    const approverId = 'system';
    const result = await this.qualityInspectionService.approve(id, approverId);
    return {
      success: true,
      data: result,
    };
  }
}
