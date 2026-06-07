import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ColorFormula } from './color-formula.entity';

/**
 * 颜色配方明细实体
 * 存储配方的原料列表和配比信息
 */
@Entity('color_formula_items')
@Index(['formulaId'])
@Index(['materialId'])
export class ColorFormulaItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 关联的配方ID */
  @Column({ type: 'uuid', name: 'formula_id' })
  formulaId: string;

  /** 原料ID（关联到原材料库存） */
  @Column({ type: 'uuid', name: 'material_id' })
  materialId: string;

  /** 原料编码 */
  @Column({ length: 50, name: 'material_code' })
  materialCode: string;

  /** 原料名称 */
  @Column({ length: 200, name: 'material_name' })
  materialName: string;

  /** 原料颜色编码 */
  @Column({ length: 50, name: 'material_color_code', nullable: true })
  materialColorCode: string;

  /** 原料颜色名称 */
  @Column({ length: 200, name: 'material_color_name', nullable: true })
  materialColorName: string;

  /** 配比百分比（0-100） */
  @Column({ type: 'decimal', precision: 8, scale: 4, name: 'percentage' })
  percentage: number;

  /** 原料用量（克） */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'weight' })
  weight: number;

  /** 原料单价 */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'unit_price', nullable: true })
  unitPrice: number;

  /** 原料小计金额 */
  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'subtotal', nullable: true })
  subtotal: number;

  /** 备注 */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /** 关联的颜色配方 */
  @ManyToOne(() => ColorFormula, (formula) => formula.items)
  @JoinColumn({ name: 'formula_id' })
  formula: ColorFormula;
}