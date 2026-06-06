import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AssignPermissionsDto } from '../dto/assign-permissions.dto';

@ApiTags('角色管理')
@Controller({ path: 'roles', version: '1' })
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建角色' })
  @ApiResponse({
    status: 201,
    description: '角色创建成功',
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '角色编码已存在' })
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.roleService.create(createRoleDto);
    return {
      message: '角色创建成功',
      data: role,
    };
  }

  @Get()
  @ApiOperation({ summary: '获取角色列表' })
  @ApiResponse({
    status: 200,
    description: '获取角色列表成功',
  })
  async findAll() {
    const roles = await this.roleService.findAll();
    return {
      message: '获取角色列表成功',
      data: roles,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取角色详情（含权限）' })
  @ApiParam({ name: 'id', description: '角色ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '获取角色详情成功',
  })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const role = await this.roleService.findOne(id);
    return {
      message: '获取角色详情成功',
      data: role,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新角色信息' })
  @ApiParam({ name: 'id', description: '角色ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '角色更新成功',
  })
  @ApiResponse({ status: 404, description: '角色不存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '角色编码已存在' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const role = await this.roleService.update(id, updateRoleDto);
    return {
      message: '角色更新成功',
      data: role,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除角色' })
  @ApiParam({ name: 'id', description: '角色ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '角色删除成功',
  })
  @ApiResponse({ status: 404, description: '角色不存在' })
  @ApiResponse({ status: 400, description: '系统角色不能删除' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.roleService.remove(id);
    return {
      message: '角色删除成功',
    };
  }

  @Put(':id/permissions')
  @ApiOperation({ summary: '为角色分配权限' })
  @ApiParam({ name: 'id', description: '角色ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '权限分配成功',
  })
  @ApiResponse({ status: 404, description: '角色不存在' })
  @ApiResponse({ status: 400, description: '系统角色不能修改权限或部分权限ID不存在' })
  async assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    const role = await this.roleService.assignPermissions(id, assignPermissionsDto.permissionIds);
    return {
      message: '权限分配成功',
      data: role,
    };
  }
}
