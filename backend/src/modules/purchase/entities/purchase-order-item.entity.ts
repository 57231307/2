import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PurchaseOrder } from './purchase-order.entity';

/**
 * 采购订单明细实体
 * 记录采购订单的具体产品明细
 */
@Entity('purchase_order_items')
@Index(['orderId'])
@Index(['productId'])
export class PurchaseOrderItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 采购订单ID
   */
  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

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
   * 产品编码（冗余存储）
   */
  @Column({ length: 50, name: 'product_code' })
  productCode: string;

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
   * 采购数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4 })
  quantity: number;

  /**
   * 单位
   */
  @Column({ length: 20 })
  unit: string;

  /**
   * 单价
   */
  @Column({ type: 'decimal', precision: 14, scale: 4, name: 'unit_price' })
  unitPrice: number;

  /**
   * 金额（数量 * 单价）
   */
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  /**
   * 已入库数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'received_quantity', default: 0 })
  receivedQuantity: number;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 关联的采购订单
   */
  @ManyToOne(() => PurchaseOrder, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  purchaseOrder: PurchaseOrder;
}
