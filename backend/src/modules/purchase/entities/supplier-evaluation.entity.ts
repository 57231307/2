import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SupplierEvaluationItem } from './supplier-evaluation-item.entity';

/**
 * 供应商评估等级枚举
 */
export enum SupplierEvaluationLevel {
  A = 'A',  // 优秀
  B = 'B',  // 良好
  C = 'C',  // 一般
  D = 'D',  // 较差
}

/**
 * 供应商评估实体
 * 记录对供应商的综合评估信息
 */
@Entity('supplier_evaluations')
@Index(['evaluationNo'], { unique: true })
@Index(['supplierId'])
@Index(['evaluationDate'])
export class SupplierEvaluation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 评估编号 - 格式：PG-YYYYMMDD-XXXX
   */
  @Column({ length: 50, name: 'evaluation_no' })
  evaluationNo: string;

  /**
   * 供应商ID
   */
  @Column({ type: 'uuid', name: 'supplier_id' })
  supplierId: string;

  /**
   * 供应商名称（冗余存储，便于显示）
   */
  @Column({ length: 100, name: 'supplier_name' })
  supplierName: string;

  /**
   * 评估日期
   */
  @Column({ type: 'date', name: 'evaluation_date' })
  evaluationDate: Date;

  /**
   * 评估人
   */
  @Column({ length: 50, name: 'evaluator' })
  evaluator: string;

  /**
   * 质量评分：1-10分
   */
  @Column({ type: 'decimal', precision: 3, scale: 1, name: 'quality_score' })
  qualityScore: number;

  /**
   * 交期评分：1-10分
   */
  @Column({ type: 'decimal', precision: 3, scale: 1, name: 'delivery_score' })
  deliveryScore: number;

  /**
   * 价格评分：1-10分
   */
  @Column({ type: 'decimal', precision: 3, scale: 1, name: 'price_score' })
  priceScore: number;

  /**
   * 服务评分：1-10分
   */
  @Column({ type: 'decimal', precision: 3, scale: 1, name: 'service_score' })
  serviceScore: number;

  /**
   * 综合评分：自动计算 (质量+交期+价格+服务) / 4
   */
  @Column({ type: 'decimal', precision: 3, scale: 1, name: 'total_score' })
  totalScore: number;

  /**
   * 评估等级：A/B/C/D
   */
  @Column({
    type: 'enum',
    enum: SupplierEvaluationLevel,
    default: SupplierEvaluationLevel.C,
  })
  level: SupplierEvaluationLevel;

  /**
   * 评估结论
   */
  @Column({ type: 'text', nullable: true })
  conclusion: string;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  notes: string;

  /**
   * 评估明细关联
   */
  @OneToMany(() => SupplierEvaluationItem, (item) => item.evaluation, {
    cascade: true,
    eager: true,
  })
  items: SupplierEvaluationItem[];
}
