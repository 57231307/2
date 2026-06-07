/**
 * 编码规则实体
 * 用于管理系统中各类单据的编码规则配置
 */
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * 编码规则状态枚举
 */
export enum CodeRuleStatus {
  /** 启用 */
  ACTIVE = 'ACTIVE',
  /** 停用 */
  INACTIVE = 'INACTIVE',
}

/**
 * 日期格式枚举
 */
export enum DateFormat {
  /** YYYYMMDD */
  YYYYMMDD = 'YYYYMMDD',
  /** YYYYMMDDHHmmss */
  YYYYMMDDHHmmss = 'YYYYMMDDHHmmss',
  /** YYYYMM */
  YYYYMM = 'YYYYMM',
  /** YYYY */
  YYYY = 'YYYY',
}

/**
 * 编码规则实体
 */
@Entity('code_rules')
@Index(['ruleCode'], { unique: true })
export class CodeRule extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 规则编码（唯一标识）
   */
  @Column({ length: 50, name: 'rule_code', unique: true })
  ruleCode: string;

  /**
   * 规则名称
   */
  @Column({ length: 100, name: 'rule_name' })
  ruleName: string;

  /**
   * 规则描述
   */
  @Column({ type: 'text', nullable: true, name: 'description' })
  description: string;

  /**
   * 前缀
   */
  @Column({ length: 20, name: 'prefix', nullable: true })
  prefix: string;

  /**
   * 日期格式
   */
  @Column({
    type: 'enum',
    enum: DateFormat,
    default: DateFormat.YYYYMMDD,
    name: 'date_format',
  })
  dateFormat: DateFormat;

  /**
   * 序号长度
   */
  @Column({ type: 'int', default: 4, name: 'sequence_length' })
  sequenceLength: number;

  /**
   * 序号步长
   */
  @Column({ type: 'int', default: 1, name: 'sequence_step' })
  sequenceStep: number;

  /**
   * 当前序号
   */
  @Column({ type: 'int', default: 0, name: 'current_sequence' })
  currentSequence: number;

  /**
   * 每日重置
   */
  @Column({ type: 'boolean', default: false, name: 'reset_daily' })
  resetDaily: boolean;

  /**
   * 每月重置
   */
  @Column({ type: 'boolean', default: false, name: 'reset_monthly' })
  resetMonthly: boolean;

  /**
   * 每年重置
   */
  @Column({ type: 'boolean', default: false, name: 'reset_yearly' })
  resetYearly: boolean;

  /**
   * 最后生成时间
   */
  @Column({ type: 'timestamptz', nullable: true, name: 'last_generated_at' })
  lastGeneratedAt: Date;

  /**
   * 规则状态
   */
  @Column({
    type: 'enum',
    enum: CodeRuleStatus,
    default: CodeRuleStatus.ACTIVE,
  })
  status: CodeRuleStatus;

  /**
   * 排序号
   */
  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;
}
