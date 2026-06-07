import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductionOrder } from './production-order.entity';

/**
 * 生产工单明细实体
 * 用于管理生产工单的原材料需求
 */
@Entity('production_order_items')
@Index(['orderId'])
export class ProductionOrderItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 生产工单ID
   */
  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

  /**
   * 原材料产品ID
   */
  @Column({ type: 'uuid', name: 'material_product_id' })
  materialProductId: string;

  /**
   * 颜色变体ID（可选）
   */
  @Column({ type: 'uuid', name: 'color_variant_id', nullable: true })
  colorVariantId: string;

  /**
   * 需求数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'required_quantity' })
  requiredQuantity: number;

  /**
   * 已发料数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'issued_quantity', default: 0 })
  issuedQuantity: number;

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
   * 关联的生产工单
   */
  @ManyToOne(() => ProductionOrder, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  productionOrder: ProductionOrder;
}
