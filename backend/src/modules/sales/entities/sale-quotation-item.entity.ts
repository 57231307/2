import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SaleQuotation } from './sale-quotation.entity';

/**
 * 销售报价单明细实体
 */
@Entity('sale_quotation_items')
@Index(['quotationId'])
@Index(['productId'])
@Index(['colorVariantId'])
export class SaleQuotationItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 报价单ID
   */
  @Column({ type: 'uuid', name: 'quotation_id' })
  quotationId: string;

  /**
   * 产品ID
   */
  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  /**
   * 颜色变体ID
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
   * 单价
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'unit_price' })
  unitPrice: number;

  /**
   * 金额小计
   */
  @Column({ type: 'decimal', precision: 14, scale: 4 })
  amount: number;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 关联报价单
   */
  @ManyToOne(() => SaleQuotation, (quotation) => quotation.items)
  @JoinColumn({ name: 'quotation_id' })
  quotation: SaleQuotation;
}
