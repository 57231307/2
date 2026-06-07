import { Entity, PrimaryGeneratedColumn, Column, Index, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PatternStatus, PatternStyle, PatternUsage } from '../enums';
import { PatternCopyright } from './pattern-copyright.entity';

/**
 * 花型实体
 * 存储花型的基本信息
 */
@Entity('patterns')
@Index(['code'], { unique: true })
@Index(['status'])
@Index(['style'])
@Index(['usage'])
export class Pattern extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 花型编码 */
  @Column({ length: 50, unique: true })
  code: string;

  /** 花型名称 */
  @Column({ length: 200 })
  name: string;

  /** 花型风格 */
  @Column({
    type: 'enum',
    enum: PatternStyle,
    default: PatternStyle.OTHER,
  })
  style: PatternStyle;

  /** 花型用途 */
  @Column({
    type: 'enum',
    enum: PatternUsage,
    default: PatternUsage.OTHER,
  })
  usage: PatternUsage;

  /** 花型分类 */
  @Column({ length: 100, nullable: true })
  category: string;

  /** 花型描述 */
  @Column({ type: 'text', nullable: true })
  description: string;

  /** 花型状态 */
  @Column({
    type: 'enum',
    enum: PatternStatus,
    default: PatternStatus.ACTIVE,
  })
  status: PatternStatus;

  /** 花型图片URL列表 */
  @Column({ type: 'jsonb', nullable: true })
  images: any[];

  /** 花型缩略图URL */
  @Column({ length: 500, nullable: true })
  thumbnailUrl: string;

  /** 原始设计文件URL */
  @Column({ type: 'text', nullable: true })
  designFileUrl: string;

  /** 配色方案 */
  @Column({ type: 'jsonb', nullable: true })
  colorScheme: any[];

  /** 尺寸规格 */
  @Column({ type: 'jsonb', nullable: true })
  dimensions: Record<string, any>;

  /** 版权信息 */
  @OneToOne(() => PatternCopyright, (copyright) => copyright.pattern)
  copyright: PatternCopyright;

  /** 版权ID */
  @Column({ type: 'uuid', name: 'copyright_id', nullable: true })
  copyrightId: string;

  /** 使用次数统计 */
  @Column({ type: 'int', default: 0, name: 'usage_count' })
  usageCount: number;

  /** 元数据 */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  /** 备注 */
  @Column({ type: 'text', nullable: true })
  remark: string;
}
