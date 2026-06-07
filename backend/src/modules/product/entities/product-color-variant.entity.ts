import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ColorVariantStatus } from '../enums';
import { Product } from './product.entity';

/**
 * 产品颜色变体实体
 * 核心表！每个颜色变体有独立的编号和价格
 * 同一产品下颜色编号不能重复
 */
@Entity('product_color_variants')
@Unique(['productId', 'colorNo'])
@Index(['productId'])
@Index(['colorNo'])
@Index(['status'])
export class ProductColorVariant extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 关联产品ID
   */
  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  /**
   * 颜色编号
   * 同一产品下唯一
   */
  @Column({ length: 50, name: 'color_no' })
  colorNo: string;

  /**
   * 颜色名称
   */
  @Column({ length: 200, name: 'color_name' })
  colorName: string;

  /**
   * 颜色代码（可选）
   */
  @Column({ length: 50, name: 'color_code', nullable: true })
  colorCode: string;

  // ========== 价格管理 ==========

  /**
   * 销售价格（必须设置）
   * 这是颜色变体的核心价格，用于订单
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'sale_price' })
  salePrice: number;

  /**
   * 标准成本（可覆盖产品基础成本）
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'standard_cost', nullable: true })
  standardCost: number;

  /**
   * 批发价格
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'wholesale_price', nullable: true })
  wholesalePrice: number;

  /**
   * VIP价格
   */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'vip_price', nullable: true })
  vipPrice: number;

  // ========== 颜色信息 ==========

  /**
   * 关联颜色配方ID
   */
  @Column({ type: 'uuid', name: 'color_formula_id', nullable: true })
  colorFormulaId: string;

  /**
   * LAB值L（亮度）
   */
  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'lab_l', nullable: true })
  labL: number;

  /**
   * LAB值a（红绿）
   */
  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'lab_a', nullable: true })
  labA: number;

  /**
   * LAB值b（黄蓝）
   */
  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'lab_b', nullable: true })
  labB: number;

  /**
   * RGB颜色值
   */
  @Column({ length: 20, name: 'rgb_color', nullable: true })
  rgbColor: string;

  /**
   * HEX颜色值
   */
  @Column({ length: 20, name: 'hex_color', nullable: true })
  hexColor: string;

  // ========== 图片管理 ==========

  /**
   * 颜色变体图片列表
   */
  @Column({ type: 'jsonb', nullable: true })
  images: any[];

  // ========== 规格参数 ==========

  /**
   * 克重（g/m²）
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number;

  /**
   * 幅宽（cm）
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  width: number;

  // ========== 状态管理 ==========

  /**
   * 状态
   */
  @Column({
    type: 'enum',
    enum: ColorVariantStatus,
    default: ColorVariantStatus.ACTIVE,
  })
  status: ColorVariantStatus;

  /**
   * 是否为默认颜色
   */
  @Column({ type: 'boolean', name: 'is_default', default: false })
  isDefault: boolean;

  // ========== 关系 ==========

  /**
   * 关联产品
   */
  @ManyToOne(() => Product, (product) => product.colorVariants)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}