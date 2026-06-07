/**
 * 系统参数控制器
 * 提供系统参数的RESTful API
 */
import { Controller, Get, Put, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { SystemParameterService, CreateSystemParameterDto, UpdateSystemParameterDto } from '../services/system-parameter.service';

/**
 * 系统参数控制器
 */
@Controller('api/v1/system-parameters')
export class SystemParameterController {
  constructor(private readonly parameterService: SystemParameterService) {}

  /**
   * 创建系统参数
   * POST /api/v1/system-parameters
   */
  @Post()
  async create(@Body() dto: CreateSystemParameterDto) {
    const result = await this.parameterService.create(dto);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 查询所有系统参数
   * GET /api/v1/system-parameters
   */
  @Get()
  async findAll() {
    const result = await this.parameterService.findAll();
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 按分组查询系统参数
   * GET /api/v1/system-parameters/group/:group
   */
  @Get('group/:group')
  async findByGroup(@Param('group') group: string) {
    const result = await this.parameterService.findByGroup(group);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取启用的系统参数
   * GET /api/v1/system-parameters/active
   */
  @Get('active')
  async findActive() {
    const result = await this.parameterService.findActive();
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取所有分组
   * GET /api/v1/system-parameters/groups
   */
  @Get('groups')
  async getAllGroups() {
    const result = await this.parameterService.getAllGroups();
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取参数值
   * GET /api/v1/system-parameters/:key
   */
  @Get(':key')
  async findOne(@Param('key') key: string) {
    const result = await this.parameterService.findOne(key);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 更新系统参数
   * PUT /api/v1/system-parameters/:key
   */
  @Put(':key')
  async update(@Param('key') key: string, @Body() dto: UpdateSystemParameterDto) {
    const result = await this.parameterService.update(key, dto);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 更新参数值
   * PUT /api/v1/system-parameters/:key/value
   */
  @Put(':key/value')
  async updateValue(@Param('key') key: string, @Body() body: { value: string }) {
    const result = await this.parameterService.updateValue(key, body.value);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 删除系统参数
   * DELETE /api/v1/system-parameters/:key
   */
  @Delete(':key')
  async remove(@Param('key') key: string) {
    await this.parameterService.remove(key);
    return {
      success: true,
      message: '删除成功',
    };
  }
}
