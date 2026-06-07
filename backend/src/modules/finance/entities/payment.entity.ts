/**
 * 收付款记录实体
 * 记录每一笔收款或付款
 */
import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PaymentType, PaymentMethod } from '../enums/payment-type.enum';

/**
 * 收付款记录
 * 记录每一笔收付款的详细信息
 */
@Entity('payments')
@Index(['documentNo'], { unique: true })
@Index(['type'])
@Index(['date'])
@Index(['counterpartyId'])
export class Payment extends BaseEntity {
  /** 单据编号 */
  @Column({ length: 50, unique: true, name: 'document_no' })
  documentNo: string;

  /** 收付款类型 */
  @Column({
    type: 'enum',
    enum: PaymentType,
    name: 'type',
  })
  type: PaymentType;

  /** 金额 */
  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'amount' })
  amount: number;

  /** 收付款日期 */
  @Column({ type: 'date', name: 'date' })
  date: Date;

  /** 收付款方式 */
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    name: 'payment_method',
  })
  paymentMethod: PaymentMethod;

  /** 交易对方ID（客户ID或供应商ID） */
  @Column({ type: 'uuid', name: 'counterparty_id' })
  counterpartyId: string;

  /** 交易对方名称 */
  @Column({ length: 200, name: 'counterparty_name', nullable: true })
  counterpartyName: string;

  /** 关联的应收/应付单据ID */
  @Column({ type: 'uuid', name: 'reference_id', nullable: true })
  referenceId: string;

  /** 关联单据类型（AR/AP） */
  @Column({ length: 20, name: 'reference_type', nullable: true })
  referenceType: string;

  /** 备注 */
  @Column({ type: 'text', nullable: true })
  remark: string;
}
