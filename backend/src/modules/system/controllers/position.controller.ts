/**
 * 岗位控制器
 */
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PositionService, CreatePositionDto, UpdatePositionDto, QueryPositionDto } from '../services/position.service';

/**
 * 岗位控制器
 */
@Controller('api/v1/positions')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  /**
   * 创建岗位
   */
  @Post()
  async create(@Body() dto: CreatePositionDto) {
    return this.positionService.create(dto);
  }

  /**
   * 查询岗位列表
   */
  @Get()
  async findAll(
    @Query() query: QueryPositionDto,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.positionService.findAll(query, parseInt(page, 10), parseInt(limit, 10));
  }

  /**
   * 获取岗位详情
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.positionService.findOne(id);
  }

  /**
   * 更新岗位
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePositionDto) {
    return this.positionService.update(id, dto);
  }

  /**
   * 删除岗位
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.positionService.remove(id);
  }

  /**
   * 按部门查询岗位
   */
  @Get('by-department/:departmentId')
  async findByDepartment(@Param('departmentId') departmentId: string) {
    return this.positionService.findByDepartment(departmentId);
  }
}
