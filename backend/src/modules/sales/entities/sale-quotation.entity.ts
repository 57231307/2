import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { QuotationStatus } from '../enums';
import { SaleQuotationItem } from './sale-quotation-item.entity';
import { Customer } from '../../base-data/entities/customer.entity';

/**
 * 销售报价单主表实体
 */
@Entity('sale_quotations')
@Index(['quotationNo'])
@Index(['customerId'])
@Index(['status'])
@Index(['quotationDate'])
export class SaleQuotation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 报价单编号
   * 格式：SQ + 日期(YYYYMMDD) + 序号(4位)
   */
  @Column({ length: 50, name: 'quotation_no' })
  quotationNo: string;

  /**
   * 客户ID
   */
  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string;

  /**
   * 报价日期
   */
  @Column({ type: 'date', name: 'quotation_date' })
  quotationDate: Date;

  /**
   * 有效期至
   */
  @Column({ type: 'date', name: 'valid_until' })
  validUntil: Date;

  /**
   * 报价单状态
   */
  @Column({
    type: 'enum',
    enum: QuotationStatus,
    default: QuotationStatus.草稿,
  })
  status: QuotationStatus;

  /**
   * 总价（原价）
   */
  @Column({ type: 'decimal', precision: 14, scale: 4, name: 'total_amount', default: 0 })
  totalAmount: number;

  /**
   * 折扣率
   */
  @Column({ type: 'decimal', precision: 5, scale: 4, name: 'discount_rate', default: 1 })
  discountRate: number;

  /**
   * 折后价
   */
  @Column({ type: 'decimal', precision: 14, scale: 4, name: 'final_amount', default: 0 })
  finalAmount: number;

  /**
   * 业务员ID
   */
  @Column({ type: 'uuid', name: 'salesperson_id', nullable: true })
  salespersonId: string;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 关联客户
   */
  @ManyToOne(() => Customer, { lazy: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Promise<Customer>;

  /**
   * 关联报价单明细
   */
  @OneToMany(() => SaleQuotationItem, (item) => item.quotation)
  items: SaleQuotationItem[];
}
