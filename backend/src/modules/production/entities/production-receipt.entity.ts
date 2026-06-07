import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductionReceiptStatus } from '../enums/production-receipt-status.enum';
import { ProductionReceiptItem } from './production-receipt-item.entity';

/**
 * 生产入库单实体
 * 用于管理生产完工入库业务
 */
@Entity('production_receipts')
@Index(['receiptNo'])
@Index(['productionOrderId'])
@Index(['status'])
export class ProductionReceipt extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 入库单编号 - 格式：RK-YYYYMMDD-XXX
   */
  @Column({ length: 50, name: 'receipt_no' })
  receiptNo: string;

  /**
   * 生产工单ID
   */
  @Column({ type: 'uuid', name: 'production_order_id' })
  productionOrderId: string;

  /**
   * 入库日期
   */
  @Column({ type: 'date', name: 'receipt_date' })
  receiptDate: Date;

  /**
   * 入库单状态
   */
  @Column({
    type: 'enum',
    enum: ProductionReceiptStatus,
    default: ProductionReceiptStatus.PENDING,
  })
  status: ProductionReceiptStatus;

  /**
   * 仓库ID
   */
  @Column({ type: 'uuid', name: 'warehouse_id' })
  warehouseId: string;

  /**
   * 质检人
   */
  @Column({ length: 100, name: 'quality_inspector', nullable: true })
  qualityInspector: string;

  /**
   * 质检时间
   */
  @Column({ type: 'timestamptz', name: 'quality_checked_at', nullable: true })
  qualityCheckedAt: Date;

  /**
   * 入库人
   */
  @Column({ length: 100, name: 'receiver_name', nullable: true })
  receiverName: string;

  /**
   * 收货时间
   */
  @Column({ type: 'timestamptz', name: 'received_at', nullable: true })
  receivedAt: Date;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 入库明细
   */
  @OneToMany(() => ProductionReceiptItem, (item) => item.receipt)
  items: ProductionReceiptItem[];
}
