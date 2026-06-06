import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum WarehouseType {
  RAW_MATERIAL = 'RAW_MATERIAL', // 原料仓
  FINISHED_GOODS = 'FINISHED_GOODS', // 成品仓
  SEMI_FINISHED = 'SEMI_FINISHED', // 半成品仓
  WORKSHOP = 'WORKSHOP', // 车间仓
  OUTSOURCE = 'OUTSOURCE', // 委外仓
}

export enum WarehouseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
}

@Entity('warehouses')
@Index(['code'], { unique: true })
@Index(['type'])
@Index(['status'])
export class Warehouse extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'enum', enum: WarehouseType, default: WarehouseType.RAW_MATERIAL })
  type: WarehouseType;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  manager: string;

  @Column({ type: 'jsonb', nullable: true })
  locations: any[]; // 库位配置

  @Column({ type: 'enum', enum: WarehouseStatus, default: WarehouseStatus.ACTIVE })
  status: WarehouseStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;
}
