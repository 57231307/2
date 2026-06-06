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
import { UserService, UserQueryDto } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { AssignRolesDto } from '../dto/assign-roles.dto';
import { UserStatus } from '../entities/user.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('用户管理')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 创建用户
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({
    status: 201,
    description: '用户创建成功',
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return {
      message: '用户创建成功',
      data: user,
    };
  }

  /**
   * 获取用户列表（分页、过滤）
   */
  @Get()
  @ApiOperation({ summary: '获取用户列表（分页、过滤）' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'keyword', required: false, description: '关键词搜索（用户名、姓名、邮箱）' })
  @ApiQuery({ name: 'username', required: false, description: '用户名（精确匹配）' })
  @ApiQuery({ name: 'email', required: false, description: '邮箱（精确匹配）' })
  @ApiQuery({ name: 'phone', required: false, description: '手机号码' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: UserStatus,
    description: '用户状态',
  })
  @ApiQuery({ name: 'isSystem', required: false, description: '是否系统用户' })
  @ApiQuery({ name: 'roleId', required: false, description: '角色ID' })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: '排序方向' })
  @ApiResponse({
    status: 200,
    description: '获取用户列表成功',
  })
  async findAll(@Query() query: UserQueryDto) {
    const result = await this.userService.findAll(query);
    return {
      message: '获取用户列表成功',
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    };
  }

  /**
   * 获取用户详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiParam({ name: 'id', description: '用户ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '获取用户详情成功',
  })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.findOne(id);
    return {
      message: '获取用户详情成功',
      data: user,
    };
  }

  /**
   * 更新用户
   */
  @Put(':id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiParam({ name: 'id', description: '用户ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '用户更新成功',
  })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.update(id, updateUserDto);
    return {
      message: '用户更新成功',
      data: user,
    };
  }

  /**
   * 删除用户（软删除）
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除用户（软删除）' })
  @ApiParam({ name: 'id', description: '用户ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '用户删除成功',
  })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 400, description: '系统用户不允许删除' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.userService.remove(id);
    return {
      message: '用户删除成功',
    };
  }

  /**
   * 修改密码
   */
  @Put(':id/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '修改密码' })
  @ApiParam({ name: 'id', description: '用户ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '密码修改成功',
  })
  @ApiResponse({ status: 400, description: '请求参数错误或新密码不能与旧密码相同' })
  @ApiResponse({ status: 401, description: '旧密码不正确' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.userService.changePassword(
      id,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
    return {
      message: '密码修改成功',
    };
  }

  /**
   * 重置密码（管理员）
   */
  @Put(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '重置密码（管理员）' })
  @ApiParam({ name: 'id', description: '用户ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '密码重置成功',
  })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { newPassword: string },
  ) {
    await this.userService.resetPassword(id, body.newPassword);
    return {
      message: '密码重置成功',
    };
  }

  /**
   * 分配角色
   */
  @Put(':id/assign-roles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '分配角色' })
  @ApiParam({ name: 'id', description: '用户ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '角色分配成功',
  })
  @ApiResponse({ status: 404, description: '用户或角色不存在' })
  async assignRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    const user = await this.userService.assignRoles(id, assignRolesDto.roleIds);
    return {
      message: '角色分配成功',
      data: user,
    };
  }

  /**
   * 锁定用户
   */
  @Put(':id/lock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '锁定用户' })
  @ApiParam({ name: 'id', description: '用户ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '用户锁定成功',
  })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 400, description: '系统用户不允许锁定' })
  async lock(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.lock(id);
    return {
      message: '用户锁定成功',
      data: user,
    };
  }

  /**
   * 解锁用户
   */
  @Put(':id/unlock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '解锁用户' })
  @ApiParam({ name: 'id', description: '用户ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: '用户解锁成功',
  })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async unlock(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.unlock(id);
    return {
      message: '用户解锁成功',
      data: user,
    };
  }

  /**
   * 获取当前用户信息
   */
  @Get('profile')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({
    status: 200,
    description: '获取当前用户信息成功',
  })
  @ApiResponse({ status: 401, description: '未登录' })
  async getProfile(@CurrentUser() user: any) {
    const userProfile = await this.userService.getProfile(user.id);
    return {
      message: '获取当前用户信息成功',
      data: userProfile,
    };
  }
}
