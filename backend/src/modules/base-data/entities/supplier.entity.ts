import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum SupplierType {
  MATERIAL = 'MATERIAL',
  DYE = 'DYE',
  AUXILIARY = 'AUXILIARY',
  LOGISTICS = 'LOGISTICS',
  OTHER = 'OTHER',
}

export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity('suppliers')
@Index(['code'], { unique: true })
@Index(['type'])
@Index(['status'])
export class Supplier extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'enum', enum: SupplierType, default: SupplierType.MATERIAL })
  type: SupplierType;

  @Column({ length: 100, nullable: true })
  contactPerson: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  creditLimit: number;

  @Column({ type: 'int', default: 30 })
  paymentTerms: number;

  @Column({ type: 'enum', enum: SupplierStatus, default: SupplierStatus.ACTIVE })
  status: SupplierStatus;

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
