import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ColorDiffResult, ColorDiffStandard } from '../enums';
import { ColorFormula } from './color-formula.entity';

/**
 * 色差记录实体
 * 存储色差检测的结果记录
 */
@Entity('color_differences')
@Index(['formulaId'])
@Index(['inspectedAt'])
export class ColorDifference extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 关联的配方ID */
  @Column({ type: 'uuid', name: 'formula_id' })
  formulaId: string;

  /** 样本LAB值L */
  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'sample_lab_l' })
  sampleLabL: number;

  /** 样本LAB值a */
  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'sample_lab_a' })
  sampleLabA: number;

  /** 样本LAB值b */
  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'sample_lab_b' })
  sampleLabB: number;

  /** 标准LAB值L */
  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'standard_lab_l' })
  standardLabL: number;

  /** 标准LAB值a */
  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'standard_lab_a' })
  standardLabA: number;

  /** 标准LAB值b */
  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'standard_lab_b' })
  standardLabB: number;

  /** 色差值ΔE */
  @Column({ type: 'decimal', precision: 10, scale: 4, name: 'delta_e' })
  deltaE: number;

  /** 色差结果 */
  @Column({
    type: 'enum',
    enum: ColorDiffResult,
    default: ColorDiffResult.PASS,
  })
  result: ColorDiffResult;

  /** 色差等级 */
  @Column({
    type: 'enum',
    enum: ColorDiffStandard,
    name: 'diff_standard',
    nullable: true,
  })
  diffStandard: ColorDiffStandard;

  /** 检测人员 */
  @Column({ length: 100, name: 'inspector', nullable: true })
  inspector: string;

  /** 检测时间 */
  @Column({ type: 'timestamptz', name: 'inspected_at' })
  inspectedAt: Date;

  /** 检测设备 */
  @Column({ length: 100, name: 'equipment', nullable: true })
  equipment: string;

  /** 检测备注 */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /** 关联的颜色配方 */
  @ManyToOne(() => ColorFormula)
  @JoinColumn({ name: 'formula_id' })
  formula: ColorFormula;
}