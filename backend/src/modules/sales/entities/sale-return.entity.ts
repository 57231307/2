import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DeliveryNote } from './delivery-note.entity';
import { SaleOrder } from './sale-order.entity';

/**
 * 销售退货实体
 */
@Entity('sale_returns')
@Index(['returnNo'])
@Index(['deliveryNoteId'])
@Index(['returnDate'])
export class SaleReturn extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 退货单编号
   * 格式：SR + 日期(YYYYMMDD) + 序号(4位)
   */
  @Column({ length: 50, name: 'return_no' })
  returnNo: string;

  /**
   * 关联发货单ID
   */
  @Column({ type: 'uuid', name: 'delivery_note_id' })
  deliveryNoteId: string;

  /**
   * 关联订单ID
   */
  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

  /**
   * 退货日期
   */
  @Column({ type: 'date', name: 'return_date' })
  returnDate: Date;

  /**
   * 退货原因
   */
  @Column({ type: 'text', name: 'return_reason' })
  returnReason: string;

  /**
   * 退货状态
   * PROCESSING - 处理中
   * COMPLETED - 已完成
   */
  @Column({ length: 20, name: 'return_status', default: 'PROCESSING' })
  returnStatus: string;

  /**
   * 处理时间
   */
  @Column({ type: 'timestamptz', name: 'processed_at', nullable: true })
  processedAt: Date;

  /**
   * 处理人ID
   */
  @Column({ type: 'uuid', name: 'processor_id', nullable: true })
  processorId: string;

  /**
   * 退款金额
   */
  @Column({ type: 'decimal', precision: 14, scale: 4, name: 'refund_amount', default: 0 })
  refundAmount: number;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 关联发货单
   */
  @ManyToOne(() => DeliveryNote)
  @JoinColumn({ name: 'delivery_note_id' })
  deliveryNote: DeliveryNote;

  /**
   * 关联订单
   */
  @ManyToOne(() => SaleOrder)
  @JoinColumn({ name: 'order_id' })
  order: SaleOrder;
}
