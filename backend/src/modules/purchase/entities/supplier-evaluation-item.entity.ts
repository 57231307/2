import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SupplierEvaluation } from './supplier-evaluation.entity';

/**
 * 评估项目类型枚举
 */
export enum EvaluationItemType {
  QUALITY = '质量',      // 质量评估
  DELIVERY = '交期',    // 交期评估
  PRICE = '价格',       // 价格评估
  SERVICE = '服务',     // 服务评估
}

/**
 * 供应商评估明细实体
 * 记录评估的各项具体评分和说明
 */
@Entity('supplier_evaluation_items')
export class SupplierEvaluationItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 评估主表ID
   */
  @Column({ type: 'uuid', name: 'evaluation_id' })
  evaluationId: string;

  /**
   * 评估项目名称
   */
  @Column({ length: 100, name: 'item_name' })
  itemName: string;

  /**
   * 评估项目类型：质量/交期/价格/服务
   */
  @Column({
    type: 'enum',
    enum: EvaluationItemType,
    name: 'item_type',
  })
  itemType: EvaluationItemType;

  /**
   * 评分：1-10分
   */
  @Column({ type: 'decimal', precision: 3, scale: 1 })
  score: number;

  /**
   * 评估说明
   */
  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * 关联的评估主表
   */
  @ManyToOne(() => SupplierEvaluation, (evaluation) => evaluation.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: SupplierEvaluation;
}
