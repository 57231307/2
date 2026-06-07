import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { FormulaStatus } from '../enums';
import { ColorFormulaItem } from './color-formula-item.entity';
import { ProductColorVariant } from '../../product/entities/product-color-variant.entity';

/**
 * 颜色配方实体
 * 存储颜色配方的主信息，包含LAB值、配方状态等
 */
@Entity('color_formulas')
@Index(['code'], { unique: true })
@Index(['status'])
export class ColorFormula extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 配方编码 */
  @Column({ length: 50, unique: true })
  code: string;

  /** 配方名称 */
  @Column({ length: 200 })
  name: string;

  /** 配方版本号 */
  @Column({ length: 20, default: '1.0' })
  version: string;

  /** 父配方ID（用于版本管理） */
  @Column({ type: 'uuid', name: 'parent_id', nullable: true })
  parentId: string;

  /** LAB值L（亮度）- 目标颜色 */
  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'lab_l' })
  labL: number;

  /** LAB值a（红绿）- 目标颜色 */
  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'lab_a' })
  labA: number;

  /** LAB值b（黄蓝）- 目标颜色 */
  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'lab_b' })
  labB: number;

  /** RGB颜色值 */
  @Column({ length: 20, name: 'rgb_color', nullable: true })
  rgbColor: string;

  /** HEX颜色值 */
  @Column({ length: 20, name: 'hex_color', nullable: true })
  hexColor: string;

  /** 配方状态 */
  @Column({
    type: 'enum',
    enum: FormulaStatus,
    default: FormulaStatus.DRAFT,
  })
  status: FormulaStatus;

  /** 配方总重量（克） */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'total_weight', default: 0 })
  totalWeight: number;

  /** 参考价格 */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'reference_price', nullable: true })
  referencePrice: number;

  /** 适用产品类型 */
  @Column({ length: 100, name: 'applicable_product_type', nullable: true })
  applicableProductType: string;

  /** 配方描述 */
  @Column({ type: 'text', nullable: true })
  description: string;

  /** 配方图片 */
  @Column({ type: 'jsonb', nullable: true })
  images: any[];

  /** 配方附件 */
  @Column({ type: 'jsonb', nullable: true })
  attachments: any[];

  /** 配方元数据 */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  /** 备注 */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /** 生效日期 */
  @Column({ type: 'date', name: 'effective_date', nullable: true })
  effectiveDate: Date;

  /** 失效日期 */
  @Column({ type: 'date', name: 'expiry_date', nullable: true })
  expiryDate: Date;

  /** 配方明细列表 */
  @OneToMany(() => ColorFormulaItem, (item) => item.formula, { cascade: true })
  items: ColorFormulaItem[];

  /** 关联的颜色变体 */
  @OneToOne(() => ProductColorVariant)
  @JoinColumn({ name: 'color_variant_id' })
  colorVariant: ProductColorVariant;

  /** 关联的颜色变体ID */
  @Column({ type: 'uuid', name: 'color_variant_id', nullable: true })
  colorVariantId: string;
}