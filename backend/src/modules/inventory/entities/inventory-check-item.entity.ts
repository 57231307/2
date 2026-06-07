import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { InventoryCheck } from './inventory-check.entity';

/**
 * 盘点单明细实体
 * 用于记录每个批次的账面数量和实盘数量，以及差异
 */
@Entity('inventory_check_items')
@Index(['inventoryCheckId'])
@Index(['batchId'])
@Index(['colorVariantId'])
export class InventoryCheckItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 盘点单ID
   */
  @Column({ type: 'uuid', name: 'inventory_check_id' })
  inventoryCheckId: string;

  /**
   * 批次ID
   */
  @Column({ type: 'uuid', name: 'batch_id' })
  batchId: string;

  /**
   * 颜色变体ID
   */
  @Column({ type: 'uuid', name: 'color_variant_id', nullable: true })
  colorVariantId: string;

  /**
   * 账面数量（系统记录的数量）
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'book_quantity', default: 0 })
  bookQuantity: number;

  /**
   * 实盘数量（实际清点的数量）
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'actual_quantity', default: 0 })
  actualQuantity: number;

  /**
   * 差异数量（实盘数量 - 账面数量）
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'difference_quantity', default: 0 })
  differenceQuantity: number;

  /**
   * 差异金额
   */
  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'difference_amount', default: 0 })
  differenceAmount: number;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  notes: string;
}
