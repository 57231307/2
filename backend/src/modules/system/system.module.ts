import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Department } from './entities/department.entity';
import { SystemParameter } from './entities/system-parameter.entity';
import { CodeRule } from './entities/code-rule.entity';
import { Position } from './entities/position.entity';
import { UserService } from './services/user.service';
import { DepartmentService } from './services/department.service';
import { SystemParameterService } from './services/system-parameter.service';
import { CodeRuleService } from './services/code-rule.service';
import { PositionService } from './services/position.service';
import { UserController } from './controllers/user.controller';
import { DepartmentController } from './controllers/department.controller';
import { SystemParameterController } from './controllers/system-parameter.controller';
import { CodeRuleController } from './controllers/code-rule.controller';
import { PositionController } from './controllers/position.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission, Department, SystemParameter, CodeRule, Position])],
  providers: [UserService, DepartmentService, SystemParameterService, CodeRuleService, PositionService],
  controllers: [UserController, DepartmentController, SystemParameterController, CodeRuleController, PositionController],
  exports: [TypeOrmModule, UserService, DepartmentService, SystemParameterService, CodeRuleService, PositionService],
})
export class SystemModule {}
