import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PurchaseInquiryItem } from './purchase-inquiry-item.entity';

/**
 * 询价单状态枚举
 */
export enum InquiryStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  COMPARED = 'COMPARED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Entity('purchase_inquiries')
@Index(['inquiryNo'], { unique: true })
@Index(['supplierId'])
@Index(['status'])
@Index(['inquiryDate'])
export class PurchaseInquiry extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 询价单号 - 格式：XJ-YYYYMMDD-XXXX
   */
  @Column({ length: 50, name: 'inquiry_no' })
  inquiryNo: string;

  /**
   * 供应商ID
   */
  @Column({ type: 'uuid', name: 'supplier_id' })
  supplierId: string;

  /**
   * 供应商名称（冗余存储）
   */
  @Column({ length: 100, name: 'supplier_name' })
  supplierName: string;

  /**
   * 询价日期
   */
  @Column({ type: 'date', name: 'inquiry_date' })
  inquiryDate: Date;

  /**
   * 有效期至
   */
  @Column({ type: 'date', name: 'valid_until', nullable: true })
  validUntil: Date;

  /**
   * 询价单状态
   */
  @Column({
    type: 'enum',
    enum: InquiryStatus,
    default: InquiryStatus.DRAFT,
  })
  status: InquiryStatus;

  /**
   * 联系人
   */
  @Column({ length: 50, name: 'contact_person', nullable: true })
  contactPerson: string;

  /**
   * 联系电话
   */
  @Column({ length: 20, name: 'contact_phone', nullable: true })
  contactPhone: string;

  /**
   * 总金额
   */
  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'total_amount', default: 0 })
  totalAmount: number;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 询价单明细
   */
  @OneToMany(() => PurchaseInquiryItem, (item) => item.inquiry, {
    cascade: true,
    eager: true,
  })
  items: PurchaseInquiryItem[];
}
