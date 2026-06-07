import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Warehouse } from './warehouse.entity';
import { InventoryTransferItem } from './inventory-transfer-item.entity';

/**
 * 调拨单状态枚举
 */
export enum TransferStatus {
  /** 待调出 */
  PENDING = 'PENDING',
  /** 部分调出 */
  PARTIAL = 'PARTIAL',
  /** 已调出 */
  DISPATCHED = 'DISPATCHED',
  /** 已收货 */
  RECEIVED = 'RECEIVED',
  /** 已取消 */
  CANCELLED = 'CANCELLED',
}

/**
 * 库存调拨单实体
 * 用于管理仓库之间的面料调拨业务
 */
@Entity('inventory_transfers')
@Index(['transferNo'], { unique: true })
@Index(['status'])
@Index(['sourceWarehouseId'])
@Index(['targetWarehouseId'])
export class InventoryTransfer extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 调拨单号
   * 格式：DB-YYYYMMDD-XXXX
   */
  @Column({ length: 50, name: 'transfer_no' })
  transferNo: string;

  /**
   * 源仓库ID
   */
  @Column({ type: 'uuid', name: 'source_warehouse_id' })
  sourceWarehouseId: string;

  /**
   * 源仓库
   */
  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'source_warehouse_id' })
  sourceWarehouse: Warehouse;

  /**
   * 目标仓库ID
   */
  @Column({ type: 'uuid', name: 'target_warehouse_id' })
  targetWarehouseId: string;

  /**
   * 目标仓库
   */
  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'target_warehouse_id' })
  targetWarehouse: Warehouse;

  /**
   * 调拨日期
   */
  @Column({ type: 'date', name: 'transfer_date' })
  transferDate: Date;

  /**
   * 调拨单状态
   */
  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.PENDING,
  })
  status: TransferStatus;

  /**
   * 负责人ID
   */
  @Column({ type: 'uuid', name: 'manager_id', nullable: true })
  managerId: string;

  /**
   * 负责人名称
   */
  @Column({ length: 100, name: 'manager_name', nullable: true })
  managerName: string;

  /**
   * 调出时间
   */
  @Column({ type: 'timestamp', name: 'dispatch_time', nullable: true })
  dispatchTime: Date;

  /**
   * 调出人
   */
  @Column({ length: 100, name: 'dispatcher', nullable: true })
  dispatcher: string;

  /**
   * 收货时间
   */
  @Column({ type: 'timestamp', name: 'receive_time', nullable: true })
  receiveTime: Date;

  /**
   * 收货人
   */
  @Column({ length: 100, name: 'receiver', nullable: true })
  receiver: string;

  /**
   * 取消原因
   */
  @Column({ type: 'text', name: 'cancel_reason', nullable: true })
  cancelReason: string;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 调拨明细列表
   */
  @OneToMany(() => InventoryTransferItem, (item) => item.transfer)
  items: InventoryTransferItem[];
}
