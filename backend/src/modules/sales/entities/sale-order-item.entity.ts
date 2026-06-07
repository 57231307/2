import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SaleOrder } from './sale-order.entity';

/**
 * 销售订单明细实体
 * 核心！订单关联颜色变体
 */
@Entity('sale_order_items')
@Index(['orderId'])
@Index(['productId'])
@Index(['colorVariantId'])
export class SaleOrderItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 订单ID
   */
  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

  /**
   * 产品ID
   */
  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  /**
   * 颜色变体ID（核心！订单选择颜色变体）
   */
  @Column({ type: 'uuid', name: 'color_variant_id' })
  colorVariantId: string;

  /**
   * 数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4 })
  quantity: number;

  /**
   * 单位
   */
  @Column({ length: 20, default: 'meter' })
  unit: string;

  /**
   * 单价（取自颜色变体的销售价格）
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'unit_price' })
  unitPrice: number;

  /**
   * 金额
   */
  @Column({ type: 'decimal', precision: 14, scale: 4 })
  amount: number;

  /**
   * 已发货数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'shipped_quantity', default: 0 })
  shippedQuantity: number;

  /**
   * 已退货数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'returned_quantity', default: 0 })
  returnedQuantity: number;

  /**
   * 批次ID（发货时指定）
   */
  @Column({ type: 'uuid', name: 'batch_id', nullable: true })
  batchId: string;

  /**
   * 匹号（发货时指定）
   */
  @Column({ length: 50, name: 'roll_no', nullable: true })
  rollNo: string;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 关联订单
   */
  @ManyToOne(() => SaleOrder, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: SaleOrder;
}
