/**
 * 质检标准实体
 * 定义质检项目和AQL标准
 */
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { InspectionType } from '../enums/inspection-type.enum';

export interface QualityStandardItem {
  /** 质检项目名称 */
  itemName: string;
  /** 检测方法 */
  checkMethod: string;
  /** 合格标准 */
  standard: string;
  /** 接受质量限 */
  aql: string;
}

/**
 * 质检标准
 * 存储质检项目和合格标准
 */
@Entity('quality_standards')
@Index(['code'], { unique: true })
@Index(['type'])
@Index(['status'])
export class QualityStandard extends BaseEntity {
  /** 质检标准编码 */
  @Column({ length: 50, unique: true })
  code: string;

  /** 质检标准名称 */
  @Column({ length: 200 })
  name: string;

  /** 质检类型 */
  @Column({
    type: 'enum',
    enum: InspectionType,
    name: 'type',
  })
  type: InspectionType;

  /** 质检项目明细（JSONB） */
  @Column({ type: 'jsonb', name: 'items' })
  items: QualityStandardItem[];

  /** AQL等级 */
  @Column({ length: 20, name: 'aql_level' })
  aqlLevel: string;

  /** 状态 */
  @Column({ length: 20, default: 'ACTIVE' })
  status: string;

  /** 备注 */
  @Column({ type: 'text', nullable: true })
  remark: string;
}
