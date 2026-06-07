import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { GoodsReceipt } from './goods-receipt.entity';

/**
 * 采购入库明细实体
 * 记录每一条入库的产品明细，包含对应的匹号信息
 */
@Entity('goods_receipt_items')
@Index(['receiptId'])
@Index(['orderItemId'])
@Index(['productId'])
export class GoodsReceiptItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 入库单ID
   */
  @Column({ type: 'uuid', name: 'receipt_id' })
  receiptId: string;

  /**
   * 采购订单明细ID
   */
  @Column({ type: 'uuid', name: 'order_item_id' })
  orderItemId: string;

  /**
   * 产品ID
   */
  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  /**
   * 产品名称（冗余存储）
   */
  @Column({ length: 100, name: 'product_name' })
  productName: string;

  /**
   * 颜色变体ID（可选）
   */
  @Column({ type: 'uuid', name: 'color_variant_id', nullable: true })
  colorVariantId: string;

  /**
   * 颜色名称（冗余存储）
   */
  @Column({ length: 50, name: 'color_name', nullable: true })
  colorName: string;

  /**
   * 入库数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4 })
  quantity: number;

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
  @Column({ length: 20 })
  unit: string;

  /**
   * 单价（冗余存储）
   */
  @Column({ type: 'decimal', precision: 14, scale: 4, name: 'unit_price', nullable: true })
  unitPrice: number;

  /**
   * 仓库ID
   */
  @Column({ type: 'uuid', name: 'warehouse_id' })
  warehouseId: string;

  /**
   * 缸号（生成）
   */
  @Column({ length: 50, name: 'batch_no', nullable: true })
  batchNo: string;

  /**
   * 匹号（生成）
   */
  @Column({ length: 50, name: 'roll_no', nullable: true })
  rollNo: string;

  /**
   * 是否已生成批次
   */
  @Column({ type: 'boolean', name: 'batch_generated', default: false })
  batchGenerated: boolean;

  /**
   * 关联的入库单
   */
  @ManyToOne(() => GoodsReceipt, (receipt) => receipt.items)
  @JoinColumn({ name: 'receipt_id' })
  goodsReceipt: GoodsReceipt;
}
