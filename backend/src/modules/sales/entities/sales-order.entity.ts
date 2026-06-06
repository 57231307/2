import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Customer } from '../../base-data/entities/customer.entity';
import { User } from '../../system/entities/user.entity';

@Entity('sales_orders')
@Index(['code'], { unique: true })
export class SalesOrder extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ type: 'uuid' })
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'uuid', nullable: true })
  salespersonId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'salespersonId' })
  salesperson: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
