import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DeliveryStatus } from '../enums';
import { DeliveryNoteItem } from './delivery-note-item.entity';
import { SaleOrder } from './sale-order.entity';

/**
 * 发货单实体
 */
@Entity('delivery_notes')
@Index(['noteNo'])
@Index(['orderId'])
@Index(['status'])
@Index(['deliveryDate'])
export class DeliveryNote extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 发货单编号
   * 格式：DN + 日期(YYYYMMDD) + 序号(4位)
   */
  @Column({ length: 50, name: 'note_no' })
  noteNo: string;

  /**
   * 关联订单ID
   */
  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

  /**
   * 发货日期
   */
  @Column({ type: 'date', name: 'delivery_date' })
  deliveryDate: Date;

  /**
   * 发货单状态
   */
  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus;

  /**
   * 物流公司
   */
  @Column({ length: 100, name: 'logistics_company', nullable: true })
  logisticsCompany: string;

  /**
   * 物流单号
   */
  @Column({ length: 100, name: 'tracking_no', nullable: true })
  trackingNo: string;

  /**
   * 发货人
   */
  @Column({ length: 100, name: 'shipper_name', nullable: true })
  shipperName: string;

  /**
   * 发货人电话
   */
  @Column({ length: 50, name: 'shipper_phone', nullable: true })
  shipperPhone: string;

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
   * 确认发货时间
   */
  @Column({ type: 'timestamptz', name: 'shipped_at', nullable: true })
  shippedAt: Date;

  /**
   * 确认收货时间
   */
  @Column({ type: 'timestamptz', name: 'received_at', nullable: true })
  receivedAt: Date;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 关联订单
   */
  @ManyToOne(() => SaleOrder)
  @JoinColumn({ name: 'order_id' })
  order: SaleOrder;

  /**
   * 关联发货明细
   */
  @OneToMany(() => DeliveryNoteItem, (item) => item.deliveryNote)
  items: DeliveryNoteItem[];
}
