import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../system/entities/user.entity';
import { SalesOrder } from '../../sales/entities/sales-order.entity';

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

  @Column({ type: 'enum', enum: CustomerType, default: CustomerType.NORMAL })
  type: CustomerType;

  @Column({ length: 100, nullable: true })
  contactPerson: string; // 联系人

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  creditLimit: number; // 信用额度

  @Column({ type: 'int', default: 30 })
  paymentTerms: number; // 账期（天）

  @Column({ type: 'uuid', nullable: true })
  salespersonId: string;

  @Column({ type: 'enum', enum: CustomerStatus, default: CustomerStatus.ACTIVE })
  status: CustomerStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'salespersonId' })
  salesperson: User;

  @OneToMany(() => SalesOrder, (order) => order.customer)
  salesOrders: SalesOrder[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;
}
