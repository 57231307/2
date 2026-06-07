import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { MaterialRequisition } from './material-requisition.entity';

/**
 * 领料明细实体
 * 用于管理领料单的具体物料明细
 */
@Entity('material_requisition_items')
@Index(['requisitionId'])
@Index(['productId'])
export class MaterialRequisitionItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 领料单ID
   */
  @Column({ type: 'uuid', name: 'requisition_id' })
  requisitionId: string;

  /**
   * 产品ID（原材料）
   */
  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  /**
   * 颜色变体ID（可选）
   */
  @Column({ type: 'uuid', name: 'color_variant_id', nullable: true })
  colorVariantId: string;

  /**
   * 批次ID - 领料时指定的批次
   */
  @Column({ type: 'uuid', name: 'batch_id', nullable: true })
  batchId: string;

  /**
   * 申请数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'requested_quantity' })
  requestedQuantity: number;

  /**
   * 实发数量
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
   * 关联的领料单
   */
  @ManyToOne(() => MaterialRequisition, (requisition) => requisition.items)
  @JoinColumn({ name: 'requisition_id' })
  requisition: MaterialRequisition;
}
