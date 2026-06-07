import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { WarehouseType } from '../enums/warehouse-type.enum';

/**
 * 仓库状态枚举
 */
export enum WarehouseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

/**
 * 仓库实体
 * 用于管理纺织面料企业的仓库信息
 */
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

  @Column({
    type: 'enum',
    enum: WarehouseType,
    default: WarehouseType.FINISHED,
  })
  type: WarehouseType;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, name: 'manager', nullable: true })
  manager: string;

  @Column({
    type: 'enum',
    enum: WarehouseStatus,
    default: WarehouseStatus.ACTIVE,
  })
  status: WarehouseStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  remark: string;
}