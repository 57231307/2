import { CreateDateColumn, UpdateDateColumn, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 基类实体
 * 包含所有实体共用的字段：id、创建时间、更新时间、创建人、更新人
 */
export abstract class BaseEntity {
  /** 主键UUID */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 创建时间 */
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  /** 创建人ID */
  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy: string;

  /** 更新人ID */
  @Column({ type: 'uuid', name: 'updated_by', nullable: true })
  updatedBy: string;
}
