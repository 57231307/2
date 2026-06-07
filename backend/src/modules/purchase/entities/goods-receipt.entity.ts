import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ReceiptStatus } from '../enums/receipt-status.enum';
import { GoodsReceiptItem } from './goods-receipt-item.entity';

/**
 * 采购入库单实体
 * 记录采购入库的核心信息
 */
@Entity('goods_receipts')
@Index(['receiptNo'], { unique: true })
@Index(['orderId'])
@Index(['status'])
@Index(['receiptDate'])
export class GoodsReceipt extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 入库单编号 - 格式：RK-YYYYMMDD-XXXX
   */
  @Column({ length: 50, name: 'receipt_no' })
  receiptNo: string;

  /**
   * 关联的采购订单ID
   */
  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

  /**
   * 采购订单编号（冗余存储）
   */
  @Column({ length: 50, name: 'order_no' })
  orderNo: string;

  /**
   * 供应商ID（冗余存储）
   */
  @Column({ type: 'uuid', name: 'supplier_id' })
  supplierId: string;

  /**
   * 供应商名称（冗余存储）
   */
  @Column({ length: 100, name: 'supplier_name' })
  supplierName: string;

  /**
   * 入库日期
   */
  @Column({ type: 'date', name: 'receipt_date' })
  receiptDate: Date;

  /**
   * 仓库ID
   */
  @Column({ type: 'uuid', name: 'warehouse_id' })
  warehouseId: string;

  /**
   * 仓库名称（冗余存储）
   */
  @Column({ length: 100, name: 'warehouse_name' })
  warehouseName: string;

  /**
   * 入库单状态
   */
  @Column({
    type: 'enum',
    enum: ReceiptStatus,
    default: ReceiptStatus.PENDING,
  })
  status: ReceiptStatus;

  /**
   * 入库类型：采购入库/退货入库
   */
  @Column({ length: 20, name: 'receipt_type', default: 'PURCHASE' })
  receiptType: string;

  /**
   * 经办人ID
   */
  @Column({ type: 'uuid', name: 'handler_id', nullable: true })
  handlerId: string;

  /**
   * 经办人姓名
   */
  @Column({ length: 50, name: 'handler_name', nullable: true })
  handlerName: string;

  /**
   * 质检人ID
   */
  @Column({ type: 'uuid', name: 'qc_id', nullable: true })
  qcId: string;

  /**
   * 质检人姓名
   */
  @Column({ length: 50, name: 'qc_name', nullable: true })
  qcName: string;

  /**
   * 质检时间
   */
  @Column({ type: 'timestamptz', name: 'qc_time', nullable: true })
  qcTime: Date;

  /**
   * 入库单总数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'total_quantity', default: 0 })
  totalQuantity: number;

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
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 入库明细关联
   */
  @OneToMany(() => GoodsReceiptItem, (item) => item.goodsReceipt, {
    cascade: true,
    eager: true,
  })
  items: GoodsReceiptItem[];
}
