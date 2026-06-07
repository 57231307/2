import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { RequisitionStatus } from '../enums/requisition-status.enum';
import { MaterialRequisitionItem } from './material-requisition-item.entity';

/**
 * 领料单实体
 * 用于管理生产领料业务
 */
@Entity('material_requisitions')
@Index(['requisitionNo'])
@Index(['productionOrderId'])
@Index(['status'])
export class MaterialRequisition extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 领料单编号 - 格式：LL-YYYYMMDD-XXX
   */
  @Column({ length: 50, name: 'requisition_no' })
  requisitionNo: string;

  /**
   * 生产工单ID
   */
  @Column({ type: 'uuid', name: 'production_order_id' })
  productionOrderId: string;

  /**
   * 领料日期
   */
  @Column({ type: 'date', name: 'requisition_date' })
  requisitionDate: Date;

  /**
   * 领料单状态
   */
  @Column({
    type: 'enum',
    enum: RequisitionStatus,
    default: RequisitionStatus.PENDING,
  })
  status: RequisitionStatus;

  /**
   * 仓库ID
   */
  @Column({ type: 'uuid', name: 'warehouse_id' })
  warehouseId: string;

  /**
   * 领料人
   */
  @Column({ length: 100, name: 'requester_name', nullable: true })
  requesterName: string;

  /**
   * 审核人
   */
  @Column({ length: 100, name: 'approver_name', nullable: true })
  approverName: string;

  /**
   * 审核时间
   */
  @Column({ type: 'timestamptz', name: 'approved_at', nullable: true })
  approvedAt: Date;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 领料明细
   */
  @OneToMany(() => MaterialRequisitionItem, (item) => item.requisition)
  items: MaterialRequisitionItem[];
}
