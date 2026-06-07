import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProcessStep } from './process-step.entity';
import { WorkOrderDispatch } from './work-order-dispatch.entity';

/**
 * 工序汇报状态枚举
 */
export enum ProcessReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  CONFIRMED = 'CONFIRMED',
}

/**
 * 工序汇报实体
 * 记录生产工序的汇报信息，包括良品数量、不良品数量等
 */
@Entity('process_reports')
@Index(['reportNo'], { unique: true })
@Index(['dispatchId'])
@Index(['stepId'])
@Index(['reportDate'])
export class ProcessReport extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 汇报编号 - 格式：HB-YYYYMMDD-XXX
   */
  @Column({ length: 50, name: 'report_no' })
  reportNo: string;

  /**
   * 派工单ID
   */
  @Column({ type: 'uuid', name: 'dispatch_id' })
  dispatchId: string;

  /**
   * 工序ID
   */
  @Column({ type: 'uuid', name: 'step_id' })
  stepId: string;

  /**
   * 汇报日期
   */
  @Column({ type: 'date', name: 'report_date' })
  reportDate: Date;

  /**
   * 良品数量
   */
  @Column({ type: 'int', name: 'qualified_quantity', default: 0 })
  qualifiedQuantity: number;

  /**
   * 不良品数量
   */
  @Column({ type: 'int', name: 'defective_quantity', default: 0 })
  defectiveQuantity: number;

  /**
   * 不良原因
   */
  @Column({ type: 'text', name: 'defect_reason', nullable: true })
  defectReason: string;

  /**
   * 汇报状态
   */
  @Column({
    type: 'enum',
    enum: ProcessReportStatus,
    default: ProcessReportStatus.DRAFT,
  })
  status: ProcessReportStatus;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 所属派工单
   */
  @ManyToOne(() => WorkOrderDispatch)
  @JoinColumn({ name: 'dispatch_id' })
  dispatch: WorkOrderDispatch;

  /**
   * 所属工序
   */
  @ManyToOne(() => ProcessStep)
  @JoinColumn({ name: 'step_id' })
  step: ProcessStep;
}
