/**
 * 部门控制器
 * 提供部门的RESTful API
 */
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { DepartmentService, CreateDepartmentDto, UpdateDepartmentDto } from '../services/department.service';

/**
 * 部门控制器
 */
@Controller('api/v1/departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  /**
   * 创建部门
   * POST /api/v1/departments
   */
  @Post()
  async create(@Body() dto: CreateDepartmentDto) {
    const result = await this.departmentService.create(dto);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 查询所有部门
   * GET /api/v1/departments
   */
  @Get()
  async findAll() {
    const result = await this.departmentService.findAll();
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 查询启用的部门
   * GET /api/v1/departments/active
   */
  @Get('active')
  async findActive() {
    const result = await this.departmentService.findActive();
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取部门详情
   * GET /api/v1/departments/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.departmentService.findOne(id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 更新部门
   * PUT /api/v1/departments/:id
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    const result = await this.departmentService.update(id, dto);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 删除部门
   * DELETE /api/v1/departments/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.departmentService.remove(id);
    return {
      success: true,
      message: '删除成功',
    };
  }
}
