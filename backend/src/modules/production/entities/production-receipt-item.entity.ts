import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductionReceipt } from './production-receipt.entity';

/**
 * 生产入库明细实体
 * 用于管理生产入库的具体物料明细
 */
@Entity('production_receipt_items')
@Index(['receiptId'])
@Index(['batchId'])
export class ProductionReceiptItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 入库单ID
   */
  @Column({ type: 'uuid', name: 'receipt_id' })
  receiptId: string;

  /**
   * 生成的新批次ID - 完工入库时生成的新缸号匹号
   */
  @Column({ type: 'uuid', name: 'batch_id', nullable: true })
  batchId: string;

  /**
   * 合格数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'qualified_quantity', default: 0 })
  qualifiedQuantity: number;

  /**
   * 不合格数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'unqualified_quantity', default: 0 })
  unqualifiedQuantity: number;

  /**
   * 单位
   */
  @Column({ length: 20, default: 'meter' })
  unit: string;

  /**
   * 缸号
   */
  @Column({ length: 50, name: 'batch_no', nullable: true })
  batchNo: string;

  /**
   * 匹号
   */
  @Column({ length: 50, name: 'roll_no', nullable: true })
  rollNo: string;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 关联的入库单
   */
  @ManyToOne(() => ProductionReceipt, (receipt) => receipt.items)
  @JoinColumn({ name: 'receipt_id' })
  receipt: ProductionReceipt;
}
