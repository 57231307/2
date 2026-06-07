/**
 * 岗位实体
 * 用于管理系统组织架构中的岗位信息
 */
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * 岗位状态枚举
 */
export enum PositionStatus {
  /** 启用 */
  ACTIVE = 'ACTIVE',
  /** 停用 */
  INACTIVE = 'INACTIVE',
}

/**
 * 岗位实体
 */
@Entity('positions')
@Index(['positionCode'], { unique: true })
@Index(['departmentId'])
export class Position extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 岗位编号
   */
  @Column({ length: 50, name: 'position_code', unique: true })
  positionCode: string;

  /**
   * 岗位名称
   */
  @Column({ length: 100, name: 'position_name' })
  positionName: string;

  /**
   * 部门ID
   */
  @Column({ type: 'uuid', name: 'department_id', nullable: true })
  departmentId: string;

  /**
   * 部门名称（冗余存储，便于显示）
   */
  @Column({ length: 100, name: 'department_name', nullable: true })
  departmentName: string;

  /**
   * 岗位职责描述
   */
  @Column({ type: 'text', nullable: true, name: 'job_responsibilities' })
  jobResponsibilities: string;

  /**
   * 任职要求
   */
  @Column({ type: 'text', nullable: true, name: 'requirements' })
  requirements: string;

  /**
   * 岗位状态
   */
  @Column({
    type: 'enum',
    enum: PositionStatus,
    default: PositionStatus.ACTIVE,
    name: 'status',
  })
  status: PositionStatus;

  /**
   * 排序号
   */
  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;
}
