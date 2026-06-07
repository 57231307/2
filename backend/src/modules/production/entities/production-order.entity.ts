import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductionOrderStatus } from '../enums/production-order-status.enum';
import { ProductionPriority } from '../enums/production-priority.enum';
import { ProductionOrderItem } from './production-order-item.entity';

/**
 * 生产工单主表实体
 * 用于管理生产工单的核心信息
 */
@Entity('production_orders')
@Index(['orderNo'])
@Index(['status'])
@Index(['productId'])
@Index(['colorVariantId'])
export class ProductionOrder extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 工单编号 - 格式：SC-YYYYMMDD-XXX
   */
  @Column({ length: 50, name: 'order_no' })
  orderNo: string;

  /**
   * 产品ID
   */
  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  /**
   * 颜色变体ID - 工单指定颜色
   */
  @Column({ type: 'uuid', name: 'color_variant_id', nullable: true })
  colorVariantId: string;

  /**
   * 计划生产数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'quantity' })
  quantity: number;

  /**
   * 已完成数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'completed_quantity', default: 0 })
  completedQuantity: number;

  /**
   * 单位
   */
  @Column({ length: 20, default: 'meter' })
  unit: string;

  /**
   * 计划开始日期
   */
  @Column({ type: 'date', name: 'planned_start_date', nullable: true })
  plannedStartDate: Date;

  /**
   * 计划结束日期
   */
  @Column({ type: 'date', name: 'planned_end_date', nullable: true })
  plannedEndDate: Date;

  /**
   * 实际开始日期
   */
  @Column({ type: 'timestamptz', name: 'actual_start_date', nullable: true })
  actualStartDate: Date;

  /**
   * 实际结束日期
   */
  @Column({ type: 'timestamptz', name: 'actual_end_date', nullable: true })
  actualEndDate: Date;

  /**
   * 工单状态
   */
  @Column({
    type: 'enum',
    enum: ProductionOrderStatus,
    default: ProductionOrderStatus.DRAFT,
  })
  status: ProductionOrderStatus;

  /**
   * 优先级
   */
  @Column({
    type: 'enum',
    enum: ProductionPriority,
    default: ProductionPriority.NORMAL,
  })
  priority: ProductionPriority;

  /**
   * 工艺要求
   */
  @Column({ type: 'text', nullable: true, name: '工艺要求' })
  processRequirements: string;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 工单明细
   */
  @OneToMany(() => ProductionOrderItem, (item) => item.productionOrder)
  items: ProductionOrderItem[];
}
