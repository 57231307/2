import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { OrderStatus, ApprovalStatus } from '../enums';
import { SaleOrderItem } from './sale-order-item.entity';
import { Customer } from '../../base-data/entities/customer.entity';

/**
 * 销售订单主表实体
 */
@Entity('sale_orders')
@Index(['orderNo'])
@Index(['customerId'])
@Index(['status'])
@Index(['approvalStatus'])
@Index(['orderDate'])
export class SaleOrder extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 订单编号
   * 格式：SO + 日期(YYYYMMDD) + 序号(4位)
   */
  @Column({ length: 50, name: 'order_no' })
  orderNo: string;

  /**
   * 客户ID
   */
  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string;

  /**
   * 订单日期
   */
  @Column({ type: 'date', name: 'order_date' })
  orderDate: Date;

  /**
   * 预计交货日期
   */
  @Column({ type: 'date', name: 'expected_delivery_date', nullable: true })
  expectedDeliveryDate: Date;

  /**
   * 订单总金额
   */
  @Column({ type: 'decimal', precision: 14, scale: 4, name: 'total_amount', default: 0 })
  totalAmount: number;

  /**
   * 已付款金额
   */
  @Column({ type: 'decimal', precision: 14, scale: 4, name: 'paid_amount', default: 0 })
  paidAmount: number;

  /**
   * 优惠金额
   */
  @Column({ type: 'decimal', precision: 14, scale: 4, name: 'discount_amount', default: 0 })
  discountAmount: number;

  /**
   * 订单状态
   */
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  /**
   * 审批状态
   */
  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    name: 'approval_status',
    default: ApprovalStatus.NONE,
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
   * 业务员ID
   */
  @Column({ type: 'uuid', name: 'salesperson_id', nullable: true })
  salespersonId: string;

  /**
   * 收货人姓名
   */
  @Column({ length: 100, name: 'receiver_name', nullable: true })
  receiverName: string;

  /**
   * 收货人电话
   */
  @Column({ length: 50, name: 'receiver_phone', nullable: true })
  receiverPhone: string;

  /**
   * 收货地址
   */
  @Column({ type: 'text', name: 'receiver_address', nullable: true })
  receiverAddress: string;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 关联客户
   */
  @ManyToOne(() => Customer, { lazy: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Promise<Customer>;

  /**
   * 关联订单明细
   */
  @OneToMany(() => SaleOrderItem, (item) => item.order)
  items: SaleOrderItem[];
}
