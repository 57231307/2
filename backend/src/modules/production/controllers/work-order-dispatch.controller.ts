import { Controller, Get, Post, Put, Param, Query, Body } from '@nestjs/common';
import { WorkOrderDispatchService } from '../services/work-order-dispatch.service';
import {
  CreateWorkOrderDispatchDto,
  UpdateWorkOrderDispatchDto,
  QueryWorkOrderDispatchDto,
  CompleteDispatchDto,
} from '../dto/work-order-dispatch.dto';

/**
 * 派工控制器
 */
@Controller('api/v1/work-order-dispatches')
export class WorkOrderDispatchController {
  constructor(private readonly workOrderDispatchService: WorkOrderDispatchService) {}

  /**
   * 创建派工单
   */
  @Post()
  async create(@Body() dto: CreateWorkOrderDispatchDto) {
    return this.workOrderDispatchService.create(dto);
  }

  /**
   * 查询派工单列表
   */
  @Get()
  async findAll(@Query() query: QueryWorkOrderDispatchDto) {
    return this.workOrderDispatchService.findAll(query);
  }

  /**
   * 获取派工单详情
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workOrderDispatchService.findOne(id);
  }

  /**
   * 更新派工单
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateWorkOrderDispatchDto) {
    return this.workOrderDispatchService.update(id, dto);
  }

  /**
   * 确认派工
   */
  @Post(':id/dispatch')
  async dispatch(@Param('id') id: string) {
    return this.workOrderDispatchService.dispatch(id);
  }

  /**
   * 开始生产
   */
  @Post(':id/start')
  async start(@Param('id') id: string) {
    return this.workOrderDispatchService.start(id);
  }

  /**
   * 完成生产
   */
  @Post(':id/complete')
  async complete(@Param('id') id: string, @Body() dto: CompleteDispatchDto) {
    return this.workOrderDispatchService.complete(id, dto);
  }

  /**
   * 取消派工
   */
  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.workOrderDispatchService.cancel(id);
  }
}
