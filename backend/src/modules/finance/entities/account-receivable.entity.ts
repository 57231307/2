/**
 * 应收款实体
 * 记录销售产生的应收款项
 */
import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ArApStatus, SourceType } from '../enums/payment-type.enum';

/**
 * 应收款
 * 记录销售订单/发货单产生的应收款项
 */
@Entity('account_receivables')
@Index(['documentNo'], { unique: true })
@Index(['customerId'])
@Index(['status'])
@Index(['dueDate'])
export class AccountReceivable extends BaseEntity {
  /** 单据编号 */
  @Column({ length: 50, unique: true, name: 'document_no' })
  documentNo: string;

  /** 来源类型 */
  @Column({
    type: 'enum',
    enum: SourceType,
    name: 'source_type',
  })
  sourceType: SourceType;

  /** 来源单据ID */
  @Column({ type: 'uuid', name: 'source_id' })
  sourceId: string;

  /** 客户ID */
  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string;

  /** 客户名称（冗余存储） */
  @Column({ length: 200, name: 'customer_name', nullable: true })
  customerName: string;

  /** 应收金额 */
  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'amount' })
  amount: number;

  /** 已收金额 */
  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'received_amount', default: 0 })
  receivedAmount: number;

  /** 余额（未收金额） */
  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'balance', default: 0 })
  balance: number;

  /** 到期日期 */
  @Column({ type: 'date', name: 'due_date' })
  dueDate: Date;

  /** 状态 */
  @Column({
    type: 'enum',
    enum: ArApStatus,
    name: 'status',
    default: ArApStatus.PENDING,
  })
  status: ArApStatus;

  /** 结算日期 */
  @Column({ type: 'date', name: 'settled_at', nullable: true })
  settledAt: Date;

  /** 备注 */
  @Column({ type: 'text', nullable: true })
  remark: string;
}
