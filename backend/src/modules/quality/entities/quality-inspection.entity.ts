/**
 * 质检报告实体
 * 记录每次质检的主要信息
 */
import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { InspectionType, InspectionResult, InspectionStatus } from '../enums/inspection-type.enum';
import { QualityStandard } from './quality-standard.entity';
import { QualityInspectionItem } from './quality-inspection-item.entity';

/**
 * 质检报告
 * 记录一次完整的质检过程
 */
@Entity('quality_inspections')
@Index(['inspectionNo'], { unique: true })
@Index(['type'])
@Index(['status'])
@Index(['inspectionDate'])
export class QualityInspection extends BaseEntity {
  /** 质检单号 */
  @Column({ length: 50, unique: true, name: 'inspection_no' })
  inspectionNo: string;

  /** 质检类型 */
  @Column({
    type: 'enum',
    enum: InspectionType,
    name: 'type',
  })
  type: InspectionType;

  /** 来源单据ID（如采购单ID、生产单ID、发货单ID） */
  @Column({ type: 'uuid', name: 'source_id', nullable: true })
  sourceId: string;

  /** 质检日期 */
  @Column({ type: 'date', name: 'inspection_date' })
  inspectionDate: Date;

  /** 关联的质检标准ID */
  @Column({ type: 'uuid', name: 'standard_id', nullable: true })
  standardId: string;

  /** 关联的质检标准 */
  @ManyToOne(() => QualityStandard, { nullable: true })
  @JoinColumn({ name: 'standard_id' })
  standard: QualityStandard;

  /** 抽样数量 */
  @Column({ type: 'integer', name: 'sample_size' })
  sampleSize: number;

  /** 合格数量 */
  @Column({ type: 'integer', name: 'passed_quantity' })
  passedQuantity: number;

  /** 不合格数量 */
  @Column({ type: 'integer', name: 'failed_quantity' })
  failedQuantity: number;

  /** 质检结果 */
  @Column({
    type: 'enum',
    enum: InspectionResult,
    name: 'result',
    nullable: true,
  })
  result: InspectionResult;

  /** 质检状态 */
  @Column({
    type: 'enum',
    enum: InspectionStatus,
    name: 'status',
    default: InspectionStatus.PENDING,
  })
  status: InspectionStatus;

  /** 审核人 */
  @Column({ type: 'uuid', name: 'approver_id', nullable: true })
  approverId: string;

  /** 审核时间 */
  @Column({ type: 'timestamptz', name: 'approved_at', nullable: true })
  approvedAt: Date;

  /** 备注 */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /** 质检明细列表 */
  @OneToMany(() => QualityInspectionItem, (item) => item.inspection)
  inspectionItems: QualityInspectionItem[];
}
