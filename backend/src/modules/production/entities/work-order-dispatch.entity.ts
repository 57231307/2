import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DispatchStatus } from '../enums/process-route-status.enum';

/**
 * 工序派工实体
 * 将生产工序派发给班组/人员执行
 */
@Entity('work_order_dispatches')
@Index(['dispatchNo'])
@Index(['productionOrderId'])
@Index(['stepId'])
@Index(['status'])
@Index(['dispatchDate'])
export class WorkOrderDispatch extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 派工单编号 - 格式：PG-YYYYMMDD-XXX
   */
  @Column({ length: 50, name: 'dispatch_no' })
  dispatchNo: string;

  /**
   * 生产工单ID
   */
  @Column({ type: 'uuid', name: 'production_order_id' })
  productionOrderId: string;

  /**
   * 工序ID
   */
  @Column({ type: 'uuid', name: 'step_id' })
  stepId: string;

  /**
   * 派工数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'quantity' })
  quantity: number;

  /**
   * 派工日期
   */
  @Column({ type: 'date', name: 'dispatch_date' })
  dispatchDate: Date;

  /**
   * 班组/人员 - 派工执行人
   */
  @Column({ length: 100, name: 'worker_group' })
  workerGroup: string;

  /**
   * 状态：待派工/已派工/生产中/已完成
   */
  @Column({
    type: 'enum',
    enum: DispatchStatus,
    default: DispatchStatus["待派工"],
  })
  status: DispatchStatus;

  /**
   * 实际工时（小时）
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'actual_hours' })
  actualHours: number;

  /**
   * 良品数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0, name: 'good_quantity' })
  goodQuantity: number;

  /**
   * 不良品数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0, name: 'defect_quantity' })
  defectQuantity: number;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  notes: string;

  /**
   * 开始时间
   */
  @Column({ type: 'timestamptz', nullable: true, name: 'start_time' })
  startTime: Date;

  /**
   * 结束时间
   */
  @Column({ type: 'timestamptz', nullable: true, name: 'end_time' })
  endTime: Date;
}
