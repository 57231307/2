import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ColorFormula } from './color-formula.entity';
import { Customer } from '../../base-data/entities/customer.entity';

/**
 * 配色结果记录实体
 * 记录配色结果，包括目标颜色、实际颜色、色差值等
 */
@Entity('color_matching_results')
@Index(['resultNo'], { unique: true })
@Index(['formulaId'])
@Index(['customerId'])
@Index(['matchingDate'])
export class ColorMatchingResult extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 记录编号 - 格式：CMR-YYYYMMDD-XXX
   */
  @Column({ length: 50, name: 'result_no' })
  resultNo: string;

  /**
   * 配方ID
   */
  @Column({ type: 'uuid', name: 'formula_id' })
  formulaId: string;

  /**
   * 客户ID
   */
  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string;

  /**
   * 配色日期
   */
  @Column({ type: 'date', name: 'matching_date' })
  matchingDate: Date;

  /**
   * 配色人
   */
  @Column({ length: 50, name: 'matching_person' })
  matchingPerson: string;

  /**
   * 目标颜色（色号/颜色代码）
   */
  @Column({ length: 100, name: 'target_color' })
  targetColor: string;

  /**
   * 实际颜色（色号/颜色代码）
   */
  @Column({ length: 100, name: 'actual_color' })
  actualColor: string;

  /**
   * 色差值ΔE
   */
  @Column({ type: 'decimal', precision: 6, scale: 2, name: 'color_difference' })
  colorDifference: number;

  /**
   * 是否合格（ΔE ≤ 1.0 为合格）
   */
  @Column({ type: 'boolean', name: 'is_qualified' })
  isQualified: boolean;

  /**
   * 配方调整记录
   */
  @Column({ type: 'text', name: 'adjustment_record', nullable: true })
  adjustmentRecord: string;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 所属配方
   */
  @ManyToOne(() => ColorFormula)
  @JoinColumn({ name: 'formula_id' })
  formula: ColorFormula;

  /**
   * 所属客户
   */
  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}
