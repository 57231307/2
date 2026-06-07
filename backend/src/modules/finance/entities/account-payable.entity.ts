/**
 * 应付款实体
 * 记录采购产生的应付款项
 */
import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ArApStatus, SourceType } from '../enums/payment-type.enum';

/**
 * 应付款
 * 记录采购订单/入库单产生的应付款项
 */
@Entity('account_payables')
@Index(['documentNo'], { unique: true })
@Index(['supplierId'])
@Index(['status'])
@Index(['dueDate'])
export class AccountPayable extends BaseEntity {
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

  /** 供应商ID */
  @Column({ type: 'uuid', name: 'supplier_id' })
  supplierId: string;

  /** 供应商名称（冗余存储） */
  @Column({ length: 200, name: 'supplier_name', nullable: true })
  supplierName: string;

  /** 应付金额 */
  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'amount' })
  amount: number;

  /** 已付金额 */
  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'paid_amount', default: 0 })
  paidAmount: number;

  /** 余额（未付金额） */
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
