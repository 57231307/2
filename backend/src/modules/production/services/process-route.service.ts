import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ProcessRoute } from '../entities/process-route.entity';
import { ProcessStep } from '../entities/process-step.entity';
import { ProcessRouteStatus } from '../enums/process-route-status.enum';
import {
  CreateProcessRouteDto,
  UpdateProcessRouteDto,
  QueryProcessRouteDto,
  AddProcessStepDto,
  UpdateProcessStepDto,
  ReorderStepsDto,
} from '../dto/process-route.dto';
import { CodeGenerator } from '../../../common/utils';

/**
 * 工艺路线服务
 * 负责工艺路线的增删改查及状态流转
 */
@Injectable()
export class ProcessRouteService {
  constructor(
    @InjectRepository(ProcessRoute)
    private readonly routeRepository: Repository<ProcessRoute>,
    @InjectRepository(ProcessStep)
    private readonly stepRepository: Repository<ProcessStep>,
  ) {}

  /**
   * 创建工艺路线
   */
  async create(dto: CreateProcessRouteDto, userId?: string): Promise<ProcessRoute> {
    // 生成工艺路线编号
    const routeNo = await CodeGenerator.generateOrderNo('GL');

    const route = this.routeRepository.create({
      routeNo,
      routeName: dto.routeName,
      productType: dto.productType,
      version: dto.version || '1.0',
      status: ProcessRouteStatus["草稿"],
      notes: dto.notes,
      createdBy: userId,
    });

    const savedRoute = await this.routeRepository.save(route);

    // 保存工序
    if (dto.steps && dto.steps.length > 0) {
      await this.saveSteps(savedRoute.id, dto.steps, userId);
      await this.updateRouteStatistics(savedRoute.id);
    }

    return this.findOne(savedRoute.id);
  }

  /**
   * 保存工序
   */
  private async saveSteps(routeId: string, steps: AddProcessStepDto[], userId?: string): Promise<void> {
    const stepEntities = steps.map((step, index) =>
      this.stepRepository.create({
        ...step,
        routeId,
        sequence: step.sequence || index + 1,
        createdBy: userId,
      }),
    );
    await this.stepRepository.save(stepEntities);
  }

  /**
   * 更新工艺路线统计信息
   */
  private async updateRouteStatistics(routeId: string): Promise<void> {
    const steps = await this.stepRepository.find({ where: { routeId } });
    const totalProcesses = steps.length;
    const totalStandardHours = steps.reduce((sum, step) => sum + Number(step.standardHours), 0);

    await this.routeRepository.update(routeId, {
      totalProcesses,
      totalStandardHours,
    });
  }

  /**
   * 查询工艺路线列表
   */
  async findAll(query: QueryProcessRouteDto): Promise<{ list: ProcessRoute[]; total: number }> {
    const where: FindOptionsWhere<ProcessRoute> = {};

    if (query.routeNo) {
      where.routeNo = query.routeNo;
    }
    if (query.routeName) {
      where.routeName = query.routeName;
    }
    if (query.productType) {
      where.productType = query.productType;
    }
    if (query.status) {
      where.status = query.status;
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [list, total] = await this.routeRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    return { list, total };
  }

  /**
   * 获取工艺路线详情（含工序）
   */
  async findOne(id: string): Promise<ProcessRoute> {
    const route = await this.routeRepository.findOne({
      where: { id },
      relations: ['steps'],
    });

    if (!route) {
      throw new NotFoundException(`工艺路线不存在: ${id}`);
    }

    // 按顺序排序工序
    if (route.steps) {
      route.steps.sort((a, b) => a.sequence - b.sequence);
    }

    return route;
  }

  /**
   * 更新工艺路线
   */
  async update(id: string, dto: UpdateProcessRouteDto, userId?: string): Promise<ProcessRoute> {
    const route = await this.findOne(id);

    // 只有草稿状态才能更新基本信息
    if (route.status !== ProcessRouteStatus["草稿"]) {
      throw new BadRequestException('只有草稿状态的工艺路线才能修改');
    }

    await this.routeRepository.update(id, {
      ...dto,
      updatedBy: userId,
    });

    return this.findOne(id);
  }

  /**
   * 添加工序
   */
  async addStep(routeId: string, dto: AddProcessStepDto, userId?: string): Promise<ProcessRoute> {
    const route = await this.findOne(routeId);

    // 只有草稿状态才能添加工序
    if (route.status !== ProcessRouteStatus["草稿"]) {
      throw new BadRequestException('只有草稿状态的工艺路线才能添加工序');
    }

    // 获取当前最大顺序号
    const maxSequence = route.steps?.length > 0
      ? Math.max(...route.steps.map(s => s.sequence))
      : 0;

    const step = this.stepRepository.create({
      ...dto,
      routeId,
      sequence: dto.sequence || maxSequence + 1,
      createdBy: userId,
    });

    await this.stepRepository.save(step);
    await this.updateRouteStatistics(routeId);

    return this.findOne(routeId);
  }

  /**
   * 更新工序
   */
  async updateStep(stepId: string, dto: UpdateProcessStepDto, userId?: string): Promise<ProcessStep> {
    const step = await this.stepRepository.findOne({ where: { id: stepId } });

    if (!step) {
      throw new NotFoundException(`工序不存在: ${stepId}`);
    }

    const route = await this.findOne(step.routeId);
    if (route.status !== ProcessRouteStatus["草稿"]) {
      throw new BadRequestException('只有草稿状态的工艺路线才能修改工序');
    }

    await this.stepRepository.update(stepId, {
      ...dto,
      updatedBy: userId,
    });

    if (dto.standardHours !== undefined) {
      await this.updateRouteStatistics(step.routeId);
    }

    return this.stepRepository.findOne({ where: { id: stepId } });
  }

  /**
   * 删除工序
   */
  async removeStep(stepId: string, userId?: string): Promise<ProcessRoute> {
    const step = await this.stepRepository.findOne({ where: { id: stepId } });

    if (!step) {
      throw new NotFoundException(`工序不存在: ${stepId}`);
    }

    const route = await this.findOne(step.routeId);
    if (route.status !== ProcessRouteStatus["草稿"]) {
      throw new BadRequestException('只有草稿状态的工艺路线才能删除工序');
    }

    await this.stepRepository.delete(stepId);
    await this.updateRouteStatistics(step.routeId);

    return this.findOne(step.routeId);
  }

  /**
   * 调整工序顺序
   */
  async reorderSteps(routeId: string, dto: ReorderStepsDto, userId?: string): Promise<ProcessRoute> {
    const route = await this.findOne(routeId);

    if (route.status !== ProcessRouteStatus["草稿"]) {
      throw new BadRequestException('只有草稿状态的工艺路线才能调整工序顺序');
    }

    // 更新每个工序的顺序
    for (let i = 0; i < dto.stepIds.length; i++) {
      await this.stepRepository.update(dto.stepIds[i], {
        sequence: i + 1,
        updatedBy: userId,
      });
    }

    return this.findOne(routeId);
  }

  /**
   * 激活工艺路线
   */
  async activate(id: string, userId?: string): Promise<ProcessRoute> {
    const route = await this.findOne(id);

    if (route.status === ProcessRouteStatus["生效"]) {
      throw new BadRequestException('该工艺路线已经是生效状态');
    }

    if (route.steps?.length === 0) {
      throw new BadRequestException('工艺路线至少需要包含一个工序才能激活');
    }

    await this.routeRepository.update(id, {
      status: ProcessRouteStatus["生效"],
      updatedBy: userId,
    });

    return this.findOne(id);
  }

  /**
   * 废弃工艺路线
   */
  async deprecate(id: string, userId?: string): Promise<ProcessRoute> {
    const route = await this.findOne(id);

    if (route.status === ProcessRouteStatus["废弃"]) {
      throw new BadRequestException('该工艺路线已经是废弃状态');
    }

    await this.routeRepository.update(id, {
      status: ProcessRouteStatus["废弃"],
      updatedBy: userId,
    });

    return this.findOne(id);
  }

  /**
   * 更新工序参数
   * @param stepId 工序ID
   * @param params 参数对象，格式：{温度: "180", 时间: "30", 压力: "5"}
   */
  async updateStepParameters(stepId: string, params: Record<string, any>): Promise<ProcessStep> {
    const step = await this.stepRepository.findOne({ where: { id: stepId } });

    if (!step) {
      throw new NotFoundException(`工序不存在: ${stepId}`);
    }

    // 合并现有参数和新参数
    const existingParams = step.parameters || {};
    const updatedParams = { ...existingParams, ...params };

    await this.stepRepository.update(stepId, {
      parameters: updatedParams,
      updatedBy: undefined,
    });

    return this.stepRepository.findOne({ where: { id: stepId } });
  }

  /**
   * 批量更新工序参数
   * @param updates 多个工序的参数更新，格式：[{stepId: "xxx", params: {...}}, ...]
   */
  async batchUpdateStepParameters(updates: { stepId: string; params: Record<string, any> }[]): Promise<ProcessStep[]> {
    const results: ProcessStep[] = [];

    for (const update of updates) {
      const step = await this.updateStepParameters(update.stepId, update.params);
      results.push(step);
    }

    return results;
  }
}
