import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PurchaseOrderStatus, ApprovalStatus } from '../enums/purchase-order-status.enum';
import { PurchaseOrderItem } from './purchase-order-item.entity';

/**
 * 采购订单主表实体
 * 记录采购订单的核心信息
 */
@Entity('purchase_orders')
@Index(['orderNo'], { unique: true })
@Index(['supplierId'])
@Index(['status'])
@Index(['approvalStatus'])
@Index(['orderDate'])
export class PurchaseOrder extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 订单编号 - 格式：CG-YYYYMMDD-XXXX
   */
  @Column({ length: 50, name: 'order_no' })
  orderNo: string;

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
   * 订单日期
   */
  @Column({ type: 'date', name: 'order_date' })
  orderDate: Date;

  /**
   * 预计到货日期
   */
  @Column({ type: 'date', name: 'expected_date', nullable: true })
  expectedDate: Date;

  /**
   * 订单总金额
   */
  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'total_amount', default: 0 })
  totalAmount: number;

  /**
   * 已付款金额
   */
  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'paid_amount', default: 0 })
  paidAmount: number;

  /**
   * 订单状态
   */
  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.PENDING,
  })
  status: PurchaseOrderStatus;

  /**
   * 审批状态
   */
  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    name: 'approval_status',
    default: ApprovalStatus.DRAFT,
  })
  approvalStatus: ApprovalStatus;

  /**
   * 审批人ID
   */
  @Column({ type: 'uuid', name: 'approver_id', nullable: true })
  approverId: string;

  /**
   * 审批时间
   */
  @Column({ type: 'timestamptz', name: 'approval_time', nullable: true })
  approvalTime: Date;

  /**
   * 审批备注
   */
  @Column({ type: 'text', name: 'approval_remark', nullable: true })
  approvalRemark: string;

  /**
   * 联系人
   */
  @Column({ length: 50, name: 'contact_person', nullable: true })
  contactPerson: string;

  /**
   * 联系电话
   */
  @Column({ length: 20, name: 'contact_phone', nullable: true })
  contactPhone: string;

  /**
   * 收货地址
   */
  @Column({ length: 200, name: 'delivery_address', nullable: true })
  deliveryAddress: string;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 订单明细关联
   */
  @OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder, {
    cascade: true,
    eager: true,
  })
  items: PurchaseOrderItem[];
}
