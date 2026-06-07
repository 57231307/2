import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum CustomerType {
  NORMAL = 'NORMAL',
  VIP = 'VIP',
  STRATEGIC = 'STRATEGIC',
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity('customers')
@Index(['code'], { unique: true })
@Index(['type'])
@Index(['status'])
@Index(['salespersonId'])
export class Customer extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 200 })
  name: string;

  @Column({
    type: 'enum',
    enum: CustomerType,
    default: CustomerType.NORMAL,
  })
  type: CustomerType;

  @Column({ length: 100, name: 'contact_person', nullable: true })
  contactPerson: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'credit_limit', default: 0 })
  creditLimit: number;

  @Column({ type: 'int', name: 'payment_terms', default: 30 })
  paymentTerms: number;

  @Column({ type: 'uuid', name: 'salesperson_id', nullable: true })
  salespersonId: string;

  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE,
  })
  status: CustomerStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  remark: string;
}
