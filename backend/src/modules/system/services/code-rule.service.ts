/**
 * 编码规则服务
 * 提供编码规则的完整操作流程
 */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { CodeRule, CodeRuleStatus, DateFormat } from '../entities/code-rule.entity';

export interface CreateCodeRuleDto {
  ruleCode: string;
  ruleName: string;
  description?: string;
  prefix?: string;
  dateFormat?: DateFormat;
  sequenceLength?: number;
  sequenceStep?: number;
  resetDaily?: boolean;
  resetMonthly?: boolean;
  resetYearly?: boolean;
  sortOrder?: number;
  remark?: string;
}

export interface UpdateCodeRuleDto {
  ruleName?: string;
  description?: string;
  prefix?: string;
  dateFormat?: DateFormat;
  sequenceLength?: number;
  sequenceStep?: number;
  resetDaily?: boolean;
  resetMonthly?: boolean;
  resetYearly?: boolean;
  status?: CodeRuleStatus;
  sortOrder?: number;
  remark?: string;
}

/**
 * 编码规则服务
 */
@Injectable()
export class CodeRuleService {
  constructor(
    @InjectRepository(CodeRule)
    private codeRuleRepository: Repository<CodeRule>,
  ) {}

  /**
   * 创建编码规则
   */
  async create(dto: CreateCodeRuleDto): Promise<CodeRule> {
    // 检查规则编码是否已存在
    const existing = await this.codeRuleRepository.findOne({
      where: { ruleCode: dto.ruleCode },
    });
    if (existing) {
      throw new ConflictException('规则编码已存在');
    }

    const rule = this.codeRuleRepository.create({
      ruleCode: dto.ruleCode,
      ruleName: dto.ruleName,
      description: dto.description,
      prefix: dto.prefix,
      dateFormat: dto.dateFormat || DateFormat.YYYYMMDD,
      sequenceLength: dto.sequenceLength || 4,
      sequenceStep: dto.sequenceStep || 1,
      resetDaily: dto.resetDaily || false,
      resetMonthly: dto.resetMonthly || false,
      resetYearly: dto.resetYearly || false,
      currentSequence: 0,
      status: CodeRuleStatus.ACTIVE,
      sortOrder: dto.sortOrder || 0,
      remark: dto.remark,
    });

    return this.codeRuleRepository.save(rule);
  }

  /**
   * 查询所有编码规则
   */
  async findAll(): Promise<CodeRule[]> {
    return this.codeRuleRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 获取启用的编码规则
   */
  async findActive(): Promise<CodeRule[]> {
    return this.codeRuleRepository.find({
      where: { status: CodeRuleStatus.ACTIVE },
      order: { sortOrder: 'ASC' },
    });
  }

  /**
   * 获取规则详情
   */
  async findOne(id: string): Promise<CodeRule> {
    const rule = await this.codeRuleRepository.findOne({
      where: { id },
    });
    if (!rule) {
      throw new NotFoundException('编码规则不存在');
    }
    return rule;
  }

  /**
   * 根据规则编码获取规则
   */
  async findByCode(code: string): Promise<CodeRule> {
    const rule = await this.codeRuleRepository.findOne({
      where: { ruleCode: code },
    });
    if (!rule) {
      throw new NotFoundException(`编码规则不存在: ${code}`);
    }
    return rule;
  }

  /**
   * 更新编码规则
   */
  async update(id: string, dto: UpdateCodeRuleDto): Promise<CodeRule> {
    const rule = await this.findOne(id);

    Object.assign(rule, dto);
    return this.codeRuleRepository.save(rule);
  }

  /**
   * 删除编码规则
   */
  async remove(id: string): Promise<void> {
    const rule = await this.findOne(id);
    await this.codeRuleRepository.remove(rule);
  }

  /**
   * 生成编码
   */
  async generateCode(ruleCode: string): Promise<string> {
    const rule = await this.findByCode(ruleCode);

    if (rule.status !== CodeRuleStatus.ACTIVE) {
      throw new ConflictException('编码规则已停用');
    }

    const now = new Date();

    // 检查是否需要重置
    if (rule.resetDaily && rule.lastGeneratedAt) {
      const lastDate = new Date(rule.lastGeneratedAt);
      if (lastDate.toDateString() !== now.toDateString()) {
        rule.currentSequence = 0;
      }
    }

    if (rule.resetMonthly && rule.lastGeneratedAt) {
      const lastDate = new Date(rule.lastGeneratedAt);
      if (lastDate.getMonth() !== now.getMonth() || lastDate.getFullYear() !== now.getFullYear()) {
        rule.currentSequence = 0;
      }
    }

    if (rule.resetYearly && rule.lastGeneratedAt) {
      const lastDate = new Date(rule.lastGeneratedAt);
      if (lastDate.getFullYear() !== now.getFullYear()) {
        rule.currentSequence = 0;
      }
    }

    // 更新序号
    rule.currentSequence += rule.sequenceStep;
    rule.lastGeneratedAt = now;
    await this.codeRuleRepository.save(rule);

    // 生成编码
    const prefix = rule.prefix || '';
    const dateStr = this.formatDate(now, rule.dateFormat);
    const sequence = String(rule.currentSequence).padStart(rule.sequenceLength, '0');

    return `${prefix}${dateStr}${sequence}`;
  }

  /**
   * 格式化日期
   */
  private formatDate(date: Date, format: DateFormat): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    switch (format) {
      case DateFormat.YYYYMMDD:
        return `${year}${month}${day}`;
      case DateFormat.YYYYMMDDHHmmss:
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
      case DateFormat.YYYYMM:
        return `${year}${month}`;
      case DateFormat.YYYY:
        return `${year}`;
      default:
        return `${year}${month}${day}`;
    }
  }

  /**
   * 重置序号
   */
  async resetSequence(id: string): Promise<CodeRule> {
    const rule = await this.findOne(id);
    rule.currentSequence = 0;
    rule.lastGeneratedAt = null;
    return this.codeRuleRepository.save(rule);
  }
}
