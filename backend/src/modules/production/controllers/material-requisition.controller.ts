import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { MaterialRequisitionService } from '../services/material-requisition.service';
import { CreateMaterialRequisitionDto, AddRequisitionItemDto, ConfirmRequisitionDto, QueryMaterialRequisitionDto } from '../dto/material-requisition.dto';

/**
 * 领料单控制器
 */
@Controller('api/v1/material-requisitions')
export class MaterialRequisitionController {
  constructor(private readonly materialRequisitionService: MaterialRequisitionService) {}

  /**
   * 创建领料单
   */
  @Post()
  async createRequisition(@Body() dto: CreateMaterialRequisitionDto) {
    return this.materialRequisitionService.createRequisition(dto);
  }

  /**
   * 查询领料单列表
   */
  @Get()
  async findRequisitions(@Query() query: QueryMaterialRequisitionDto) {
    return this.materialRequisitionService.findRequisitions(query);
  }

  /**
   * 获取领料单详情
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.materialRequisitionService.findOne(id);
  }

  /**
   * 添加领料明细
   */
  @Post(':id/items')
  async addItem(@Param('id') id: string, @Body() dto: AddRequisitionItemDto) {
    return this.materialRequisitionService.addRequisitionItem(id, dto);
  }

  /**
   * 确认领料
   */
  @Post(':id/confirm')
  async confirmIssue(@Param('id') id: string, @Body() dto: ConfirmRequisitionDto) {
    return this.materialRequisitionService.confirmIssue(id, dto);
  }

  /**
   * 取消领料单
   */
  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.materialRequisitionService.cancelRequisition(id);
  }
}
