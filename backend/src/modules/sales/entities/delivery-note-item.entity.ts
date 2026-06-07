import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DeliveryNote } from './delivery-note.entity';

/**
 * 发货单明细实体
 * 核心！发货时指定批次和匹号
 */
@Entity('delivery_note_items')
@Index(['noteId'])
@Index(['orderItemId'])
export class DeliveryNoteItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 发货单ID
   */
  @Column({ type: 'uuid', name: 'note_id' })
  noteId: string;

  /**
   * 订单明细ID
   */
  @Column({ type: 'uuid', name: 'order_item_id' })
  orderItemId: string;

  /**
   * 批次ID（发货时选择批次）
   */
  @Column({ type: 'uuid', name: 'batch_id' })
  batchId: string;

  /**
   * 匹号（同一缸号内匹号唯一）
   */
  @Column({ length: 50, name: 'roll_no' })
  rollNo: string;

  /**
   * 发货数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4 })
  quantity: number;

  /**
   * 单位
   */
  @Column({ length: 20, default: 'meter' })
  unit: string;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 关联发货单
   */
  @ManyToOne(() => DeliveryNote, (note) => note.items)
  @JoinColumn({ name: 'note_id' })
  deliveryNote: DeliveryNote;
}
