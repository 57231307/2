import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { ProcessRouteService } from '../services/process-route.service';
import {
  CreateProcessRouteDto,
  UpdateProcessRouteDto,
  QueryProcessRouteDto,
  AddProcessStepDto,
  UpdateProcessStepDto,
  ReorderStepsDto,
} from '../dto/process-route.dto';

/**
 * 工艺路线控制器
 */
@Controller('api/v1/process-routes')
export class ProcessRouteController {
  constructor(private readonly processRouteService: ProcessRouteService) {}

  /**
   * 创建工艺路线
   */
  @Post()
  async create(@Body() dto: CreateProcessRouteDto) {
    return this.processRouteService.create(dto);
  }

  /**
   * 查询工艺路线列表
   */
  @Get()
  async findAll(@Query() query: QueryProcessRouteDto) {
    return this.processRouteService.findAll(query);
  }

  /**
   * 获取工艺路线详情
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.processRouteService.findOne(id);
  }

  /**
   * 更新工艺路线
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProcessRouteDto) {
    return this.processRouteService.update(id, dto);
  }

  /**
   * 激活工艺路线
   */
  @Post(':id/activate')
  async activate(@Param('id') id: string) {
    return this.processRouteService.activate(id);
  }

  /**
   * 废弃工艺路线
   */
  @Post(':id/deprecate')
  async deprecate(@Param('id') id: string) {
    return this.processRouteService.deprecate(id);
  }

  /**
   * 添加工序
   */
  @Post(':id/steps')
  async addStep(@Param('id') id: string, @Body() dto: AddProcessStepDto) {
    return this.processRouteService.addStep(id, dto);
  }

  /**
   * 更新工序
   */
  @Put(':id/steps/:stepId')
  async updateStep(
    @Param('id') id: string,
    @Param('stepId') stepId: string,
    @Body() dto: UpdateProcessStepDto,
  ) {
    return this.processRouteService.updateStep(stepId, dto);
  }

  /**
   * 删除工序
   */
  @Delete(':id/steps/:stepId')
  async removeStep(@Param('id') id: string, @Param('stepId') stepId: string) {
    return this.processRouteService.removeStep(stepId);
  }

  /**
   * 调整工序顺序
   */
  @Post(':id/steps/reorder')
  async reorderSteps(@Param('id') id: string, @Body() dto: ReorderStepsDto) {
    return this.processRouteService.reorderSteps(id, dto);
  }

  /**
   * 更新工序参数
   */
  @Put('steps/:stepId/parameters')
  async updateStepParameters(
    @Param('stepId') stepId: string,
    @Body() params: Record<string, any>,
  ) {
    return this.processRouteService.updateStepParameters(stepId, params);
  }

  /**
   * 批量更新工序参数
   */
  @Put('steps/batch-parameters')
  async batchUpdateStepParameters(
    @Body() updates: { stepId: string; params: Record<string, any> }[],
  ) {
    return this.processRouteService.batchUpdateStepParameters(updates);
  }
}
