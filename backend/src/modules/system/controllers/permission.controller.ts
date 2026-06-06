import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { PermissionType } from '../entities/permission.entity';

@ApiTags('权限管理')
@Controller({ path: 'permissions', version: '1' })
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建权限' })
  @ApiResponse({
    status: 201,
    description: '权限创建成功',
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '权限编码已存在' })
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    const permission = await this.permissionService.create(createPermissionDto);
    return {
      message: '权限创建成功',
      data: permission,
    };
  }

  @Get()
  @ApiOperation({ summary: '获取权限列表（按模块分组）' })
  @ApiQuery({ name: 'module', required: false, description: '按模块筛选' })
  @ApiResponse({
    status: 200,
    description: '获取权限列表成功',
  })
  async findAll(@Query('module') module?: string) {
    // 如果指定了模块，返回该模块的权限列表
    if (module) {
      const permissions = await this.permissionService.getByModule(module);
      return {
        message: '获取权限列表成功',
        data: permissions,
      };
    }

    // 否则返回按模块分组的权限列表
    const groupedPermissions = await this.permissionService.findAll();
    return {
      message: '获取权限列表成功',
      data: groupedPermissions,
    };
  }

  @Get('types')
  @ApiOperation({ summary: '获取权限类型枚举' })
  @ApiResponse({
    status: 200,
    description: '获取权限类型成功',
  })
  async getTypes() {
    return {
      message: '获取权限类型成功',
      data: Object.values(PermissionType),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取权限详情' })
  @ApiParam({ name: 'id', description: '权限ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '获取权限详情成功',
  })
  @ApiResponse({ status: 404, description: '权限不存在' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const permission = await this.permissionService.findOne(id);
    return {
      message: '获取权限详情成功',
      data: permission,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新权限信息' })
  @ApiParam({ name: 'id', description: '权限ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '权限更新成功',
  })
  @ApiResponse({ status: 404, description: '权限不存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '权限编码已存在' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    const permission = await this.permissionService.update(id, updatePermissionDto);
    return {
      message: '权限更新成功',
      data: permission,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除权限' })
  @ApiParam({ name: 'id', description: '权限ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '权限删除成功',
  })
  @ApiResponse({ status: 404, description: '权限不存在' })
  @ApiResponse({ status: 400, description: '系统权限不能删除' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.permissionService.remove(id);
    return {
      message: '权限删除成功',
    };
  }
}
