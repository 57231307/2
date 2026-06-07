import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { InventoryTransfer, TransferStatus } from './inventory-transfer.entity';

/**
 * 库存调拨明细实体
 * 记录调拨单中的具体批次明细
 */
@Entity('inventory_transfer_items')
@Index(['transferId'])
@Index(['batchId'])
export class InventoryTransferItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 调拨单ID
   */
  @Column({ type: 'uuid', name: 'transfer_id' })
  transferId: string;

  /**
   * 调拨单
   */
  @ManyToOne(() => InventoryTransfer, (transfer) => transfer.items)
  @JoinColumn({ name: 'transfer_id' })
  transfer: InventoryTransfer;

  /**
   * 批次ID
   */
  @Column({ type: 'uuid', name: 'batch_id' })
  batchId: string;

  /**
   * 缸号
   */
  @Column({ length: 50, name: 'batch_no' })
  batchNo: string;

  /**
   * 匹号
   */
  @Column({ length: 50, name: 'roll_no' })
  rollNo: string;

  /**
   * 颜色变体ID
   */
  @Column({ type: 'uuid', name: 'color_variant_id', nullable: true })
  colorVariantId: string;

  /**
   * 颜色编号
   */
  @Column({ length: 50, name: 'color_code', nullable: true })
  colorCode: string;

  /**
   * 颜色名称
   */
  @Column({ length: 100, name: 'color_name', nullable: true })
  colorName: string;

  /**
   * 调拨数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'transfer_quantity' })
  transferQuantity: number;

  /**
   * 单位
   */
  @Column({ length: 20, default: 'meter' })
  unit: string;

  /**
   * 已调出数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'dispatched_quantity', default: 0 })
  dispatchedQuantity: number;

  /**
   * 已收货数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'received_quantity', default: 0 })
  receivedQuantity: number;

  /**
   * 调出后目标仓库ID（用于调入确认时创建新批次）
   */
  @Column({ type: 'uuid', name: 'target_warehouse_id', nullable: true })
  targetWarehouseId: string;
}
