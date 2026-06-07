import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * 花型设计状态枚举
 */
export enum PatternDesignStatus {
  DRAFT = '草稿',       // 草稿
  PENDING_REVIEW = '待审核',  // 待审核
  APPROVED = '已审核',  // 已审核
  ARCHIVED = '已归档',  // 已归档
}

/**
 * 花型设计实体
 * 记录花型设计的各项信息
 */
@Entity('pattern_designs')
@Index(['designNo'], { unique: true })
@Index(['patternId'])
@Index(['designer'])
@Index(['status'])
@Index(['designDate'])
export class PatternDesign extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 设计编号 - 格式：SJ-YYYYMMDD-XXXX
   */
  @Column({ length: 50, name: 'design_no' })
  designNo: string;

  /**
   * 花型ID
   */
  @Column({ type: 'uuid', name: 'pattern_id', nullable: true })
  patternId: string;

  /**
   * 花型名称（冗余存储，便于显示）
   */
  @Column({ length: 200, name: 'pattern_name', nullable: true })
  patternName: string;

  /**
   * 花型编码（冗余存储，便于显示）
   */
  @Column({ length: 50, name: 'pattern_code', nullable: true })
  patternCode: string;

  /**
   * 设计名称
   */
  @Column({ length: 200, name: 'design_name' })
  designName: string;

  /**
   * 设计版本
   */
  @Column({ length: 20, name: 'design_version', default: '1.0' })
  designVersion: string;

  /**
   * 设计状态：草稿/待审核/已审核/已归档
   */
  @Column({
    type: 'enum',
    enum: PatternDesignStatus,
    default: PatternDesignStatus.DRAFT,
  })
  status: PatternDesignStatus;

  /**
   * 设计人
   */
  @Column({ length: 50, name: 'designer' })
  designer: string;

  /**
   * 设计日期
   */
  @Column({ type: 'date', name: 'design_date' })
  designDate: Date;

  /**
   * 审核人
   */
  @Column({ length: 50, name: 'auditor', nullable: true })
  auditor: string;

  /**
   * 审核时间
   */
  @Column({ type: 'timestamptz', name: 'audit_time', nullable: true })
  auditTime: Date;

  /**
   * 审核说明
   */
  @Column({ type: 'text', name: 'audit_remark', nullable: true })
  auditRemark: string;

  /**
   * 设计说明
   */
  @Column({ type: 'text', name: 'description', nullable: true })
  description: string;

  /**
   * 设计图片URL列表（JSON数组）
   */
  @Column({ type: 'jsonb', name: 'design_images', nullable: true })
  designImages: any[];

  /**
   * 配色方案
   */
  @Column({ type: 'jsonb', name: 'color_scheme', nullable: true })
  colorScheme: any[];

  /**
   * 设计文件URL
   */
  @Column({ type: 'text', name: 'design_file_url', nullable: true })
  designFileUrl: string;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;
}
