import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { InventoryCheckItem } from './inventory-check-item.entity';

/**
 * 盘点单状态枚举
 */
export enum InventoryCheckStatus {
  待盘点 = 'PENDING',
  盘点中 = 'IN_PROGRESS',
  已完成 = 'COMPLETED',
}

/**
 * 盘点类型枚举
 */
export enum InventoryCheckType {
  全盘 = 'FULL',
  抽盘 = 'SAMPLE',
}

/**
 * 盘点单实体
 * 用于管理库存盘点作业，记录盘点任务的基本信息
 */
@Entity('inventory_checks')
@Index(['checkNo'], { unique: true })
@Index(['warehouseId'])
@Index(['status'])
@Index(['checkDate'])
export class InventoryCheck extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 盘点单号 - 格式：PD-YYYYMMDD-XXX
   */
  @Column({ length: 50, name: 'check_no', unique: true })
  checkNo: string;

  /**
   * 仓库ID
   */
  @Column({ type: 'uuid', name: 'warehouse_id' })
  warehouseId: string;

  /**
   * 盘点类型：全盘/抽盘
   */
  @Column({
    type: 'enum',
    enum: InventoryCheckType,
    name: 'check_type',
    default: InventoryCheckType.全盘,
  })
  checkType: InventoryCheckType;

  /**
   * 盘点单状态：待盘点/盘点中/已完成
   */
  @Column({
    type: 'enum',
    enum: InventoryCheckStatus,
    default: InventoryCheckStatus.待盘点,
  })
  status: InventoryCheckStatus;

  /**
   * 盘点日期
   */
  @Column({ type: 'date', name: 'check_date' })
  checkDate: Date;

  /**
   * 负责人
   */
  @Column({ length: 100, name: 'manager', nullable: true })
  manager: string;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  notes: string;

  /**
   * 完成时间
   */
  @Column({ type: 'timestamptz', name: 'completed_at', nullable: true })
  completedAt: Date;

  /**
   * 盘点明细列表
   */
  @OneToMany(() => InventoryCheckItem, item => item.inventoryCheckId)
  items: InventoryCheckItem[];
}
