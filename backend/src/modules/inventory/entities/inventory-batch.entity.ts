import { Entity, PrimaryGeneratedColumn, Column, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { BatchSourceType } from '../enums/batch-source-type.enum';
import { BatchStatus } from '../enums/batch-status.enum';
import { QualityStatus } from '../enums/quality-status.enum';

/**
 * 库存批次实体 - 核心！包含缸号和匹号
 * 用于管理纺织面料的批次库存，包含匹号追溯功能
 */
@Entity('inventory_batches')
@Index(['batchNo'])
@Index(['productId', 'colorVariantId'])
@Index(['warehouseId'])
@Index(['sourceType', 'sourceId'])
@Index(['status'])
@Unique('uk_batch_roll', ['productId', 'colorVariantId', 'batchNo', 'rollNo'])
export class InventoryBatch extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 缸号 - 格式：GD-YYYYMMDD-XXX
   * 同一产品+颜色下缸号唯一
   */
  @Column({ length: 50, name: 'batch_no' })
  batchNo: string;

  /**
   * 匹号 - 格式：P-XXX
   * 同一缸号内匹号唯一，不同缸号之间匹号可以相同
   */
  @Column({ length: 50, name: 'roll_no' })
  rollNo: string;

  /**
   * 产品ID
   */
  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  /**
   * 颜色变体ID
   */
  @Column({ type: 'uuid', name: 'color_variant_id', nullable: true })
  colorVariantId: string;

  /**
   * 仓库ID
   */
  @Column({ type: 'uuid', name: 'warehouse_id' })
  warehouseId: string;

  /**
   * 库位编码 - 如：A01-01-01
   */
  @Column({ length: 50, name: 'location_code', nullable: true })
  locationCode: string;

  /**
   * 数量
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  quantity: number;

  /**
   * 单位
   */
  @Column({ length: 20, default: 'meter' })
  unit: string;

  /**
   * 生产日期
   */
  @Column({ type: 'date', name: 'production_date', nullable: true })
  productionDate: Date;

  /**
   * 生产批号
   */
  @Column({ length: 50, name: 'manufacture_no', nullable: true })
  manufactureNo: string;

  /**
   * 来源类型
   */
  @Column({
    type: 'enum',
    enum: BatchSourceType,
    name: 'source_type',
    nullable: true,
  })
  sourceType: BatchSourceType;

  /**
   * 来源单据ID
   */
  @Column({ type: 'uuid', name: 'source_id', nullable: true })
  sourceId: string;

  /**
   * 来源单据号
   */
  @Column({ length: 50, name: 'source_no', nullable: true })
  sourceNo: string;

  /**
   * 质检状态
   */
  @Column({
    type: 'enum',
    enum: QualityStatus,
    name: 'quality_status',
    default: QualityStatus.PASSED,
  })
  qualityStatus: QualityStatus;

  /**
   * 颜色配方ID
   */
  @Column({ type: 'uuid', name: 'color_formula_id', nullable: true })
  colorFormulaId: string;

  /**
   * 批次状态
   */
  @Column({
    type: 'enum',
    enum: BatchStatus,
    default: BatchStatus.ACTIVE,
  })
  status: BatchStatus;

  /**
   * 克重（g/m²）
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'gram_weight', nullable: true })
  gramWeight: number;

  /**
   * 幅宽（cm）
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'width', nullable: true })
  width: number;

  /**
   * 有效期
   * 用于效期预警
   */
  @Column({ type: 'date', name: 'expiry_date', nullable: true })
  expiryDate: Date;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;
}