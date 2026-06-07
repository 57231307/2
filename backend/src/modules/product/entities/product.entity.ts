import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductType, ProductStatus } from '../enums';
import { ProductColorVariant } from './product-color-variant.entity';

/**
 * 产品实体
 * 存储产品的基本信息，不包含价格（价格在颜色变体表中）
 */
@Entity('products')
@Index(['code'], { unique: true })
@Index(['type'])
@Index(['status'])
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 200 })
  name: string;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.FABRIC,
  })
  type: ProductType;

  @Column({ type: 'text', nullable: true })
  spec: string;

  @Column({ length: 20, default: '米' })
  unit: string;

  @Column({ type: 'uuid', name: 'color_formula_id', nullable: true })
  colorFormulaId: string;

  @Column({ type: 'uuid', name: 'pattern_id', nullable: true })
  patternId: string;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @Column({ type: 'jsonb', nullable: true })
  images: any[];

  @Column({ type: 'jsonb', nullable: true })
  attachments: any[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 是否支持颜色变体
   * 当添加第一个颜色变体时自动设置为true
   */
  @Column({ type: 'boolean', name: 'has_color_variants', default: false })
  hasColorVariants: boolean;

  /**
   * 默认颜色变体ID
   * 关联到product_color_variants表的主键
   */
  @Column({ type: 'uuid', name: 'default_variant_id', nullable: true })
  defaultVariantId: string;

  /**
   * 颜色变体列表
   * 与ProductColorVariant是一对多关系
   */
  @OneToMany(() => ProductColorVariant, (variant) => variant.product)
  colorVariants: ProductColorVariant[];
}