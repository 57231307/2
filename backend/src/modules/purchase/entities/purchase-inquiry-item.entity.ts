import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PurchaseInquiry } from './purchase-inquiry.entity';

@Entity('purchase_inquiry_items')
@Index(['inquiryId'])
export class PurchaseInquiryItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 询价单ID
   */
  @Column({ type: 'uuid', name: 'inquiry_id' })
  inquiryId: string;

  /**
   * 产品ID
   */
  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  /**
   * 产品名称（冗余存储）
   */
  @Column({ length: 200, name: 'product_name' })
  productName: string;

  /**
   * 颜色变体ID
   */
  @Column({ type: 'uuid', name: 'color_variant_id', nullable: true })
  colorVariantId: string;

  /**
   * 颜色名称（冗余存储）
   */
  @Column({ length: 100, name: 'color_name', nullable: true })
  colorName: string;

  /**
   * 数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'quantity' })
  quantity: number;

  /**
   * 期望单价
   */
  @Column({ type: 'decimal', precision: 10, scale: 4, name: 'expected_price', nullable: true })
  expectedPrice: number;

  /**
   * 报价单价
   */
  @Column({ type: 'decimal', precision: 10, scale: 4, name: 'quoted_price', nullable: true })
  quotedPrice: number;

  /**
   * 小计金额
   */
  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'subtotal', default: 0 })
  subtotal: number;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 所属询价单
   */
  @ManyToOne(() => PurchaseInquiry, (inquiry) => inquiry.items)
  @JoinColumn({ name: 'inquiry_id' })
  inquiry: PurchaseInquiry;
}
