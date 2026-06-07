/**
 * 质检明细实体
 * 记录每个质检项的具体检测数据
 */
import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { InspectionItemResult, Severity } from '../enums/inspection-type.enum';
import { QualityInspection } from './quality-inspection.entity';

/**
 * 质检明细
 * 记录每个质检项目的检测结果
 */
@Entity('quality_inspection_items')
@Index(['inspectionId'])
export class QualityInspectionItem extends BaseEntity {
  /** 关联的质检报告ID */
  @Column({ type: 'uuid', name: 'inspection_id' })
  inspectionId: string;

  /** 关联的质检报告 */
  @ManyToOne(() => QualityInspection, (inspection) => inspection.inspectionItems)
  @JoinColumn({ name: 'inspection_id' })
  inspection: QualityInspection;

  /** 质检项目名称 */
  @Column({ length: 100, name: 'item_name' })
  itemName: string;

  /** 检测方法 */
  @Column({ length: 200, name: 'check_method', nullable: true })
  checkMethod: string;

  /** 合格标准 */
  @Column({ length: 200, name: 'standard', nullable: true })
  standard: string;

  /** 实际检测值 */
  @Column({ type: 'text', name: 'actual_value', nullable: true })
  actualValue: string;

  /** 检测结果 */
  @Column({
    type: 'enum',
    enum: InspectionItemResult,
    name: 'result',
  })
  result: InspectionItemResult;

  /** 严重程度 */
  @Column({
    type: 'enum',
    enum: Severity,
    nullable: true,
  })
  severity: Severity;

  /** 不合格数量 */
  @Column({ type: 'integer', name: 'defect_quantity', default: 0 })
  defectQuantity: number;

  /** 备注 */
  @Column({ type: 'text', nullable: true })
  remark: string;
}
