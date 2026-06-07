import { Entity, PrimaryGeneratedColumn, Column, Index, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CopyrightStatus } from '../enums';
import { Pattern } from './pattern.entity';

/**
 * 花型版权实体
 * 存储花型版权的详细信息
 */
@Entity('pattern_copyrights')
@Index(['copyrightNo'], { unique: true })
@Index(['status'])
@Index(['endDate'])
export class PatternCopyright extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 关联的花型ID */
  @Column({ type: 'uuid', name: 'pattern_id' })
  patternId: string;

  /** 花型实体 */
  @OneToOne(() => Pattern, (pattern) => pattern.copyright)
  @JoinColumn({ name: 'pattern_id' })
  pattern: Pattern;

  /** 版权号 */
  @Column({ length: 100, unique: true, name: 'copyright_no' })
  copyrightNo: string;

  /** 版权状态 */
  @Column({
    type: 'enum',
    enum: CopyrightStatus,
    default: CopyrightStatus.VALID,
  })
  status: CopyrightStatus;

  /** 版权开始日期 */
  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  /** 版权结束日期 */
  @Column({ type: 'date', name: 'end_date' })
  endDate: Date;

  /** 授权范围描述 */
  @Column({ type: 'text', nullable: true, name: 'authorized_scope' })
  authorizedScope: string;

  /** 授权类型：独占许可、排他许可、普通许可 */
  @Column({ length: 50, nullable: true, name: 'license_type' })
  licenseType: string;

  /** 版权注册机构 */
  @Column({ length: 200, nullable: true, name: 'registration_authority' })
  registrationAuthority: string;

  /** 版权证书URL */
  @Column({ type: 'text', nullable: true, name: 'certificate_url' })
  certificateUrl: string;

  /**  Renewal cost 续费费用 */
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'renewal_cost' })
  renewalCost: number;

  /** 已续费次数 */
  @Column({ type: 'int', default: 0, name: 'renewal_count' })
  renewalCount: number;

  /** 最后续费日期 */
  @Column({ type: 'date', nullable: true, name: 'last_renewal_date' })
  lastRenewalDate: Date;

  /** 下次续费提醒日期 */
  @Column({ type: 'date', nullable: true, name: 'next_renewal_reminder_date' })
  nextRenewalReminderDate: Date;

  /** 使用统计 - 已使用次数 */
  @Column({ type: 'int', default: 0, name: 'used_count' })
  usedCount: number;

  /** 使用统计 - 已授权产品数 */
  @Column({ type: 'int', default: 0, name: 'licensed_product_count' })
  licensedProductCount: number;

  /** 备注 */
  @Column({ type: 'text', nullable: true })
  remark: string;
}
