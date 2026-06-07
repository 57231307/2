/**
 * 系统参数实体
 * 用于管理系统配置参数
 */
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * 参数类型枚举
 */
export enum ParameterType {
  /** 字符串 */
  STRING = 'STRING',
  /** 数字 */
  NUMBER = 'NUMBER',
  /** 布尔值 */
  BOOLEAN = 'BOOLEAN',
  /** JSON对象 */
  JSON = 'JSON',
}

/**
 * 系统参数实体
 */
@Entity('system_parameters')
@Index(['parameterKey'], { unique: true })
export class SystemParameter extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 参数键（唯一标识）
   */
  @Column({ length: 100, name: 'parameter_key', unique: true })
  parameterKey: string;

  /**
   * 参数值
   */
  @Column({ type: 'text', name: 'parameter_value' })
  parameterValue: string;

  /**
   * 参数类型
   */
  @Column({
    type: 'enum',
    enum: ParameterType,
    default: ParameterType.STRING,
    name: 'parameter_type',
  })
  parameterType: ParameterType;

  /**
   * 参数名称
   */
  @Column({ length: 100, name: 'parameter_name' })
  parameterName: string;

  /**
   * 参数描述
   */
  @Column({ type: 'text', nullable: true, name: 'description' })
  description: string;

  /**
   * 参数分组
   */
  @Column({ length: 50, name: 'parameter_group', nullable: true })
  parameterGroup: string;

  /**
   * 是否启用
   */
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  /**
   * 是否可编辑
   */
  @Column({ type: 'boolean', default: true, name: 'is_editable' })
  isEditable: boolean;

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
