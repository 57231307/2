import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Customer } from './customer.entity';

/**
 * 客户联系人实体
 * 记录客户的联系人信息
 */
@Entity('customer_contacts')
@Index(['customerId'])
@Index(['isDefault'])
export class CustomerContact extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 客户ID
   */
  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string;

  /**
   * 联系人姓名
   */
  @Column({ length: 100, name: 'contact_name' })
  contactName: string;

  /**
   * 职务
   */
  @Column({ length: 50, nullable: true })
  position: string;

  /**
   * 电话
   */
  @Column({ length: 20, nullable: true })
  phone: string;

  /**
   * 邮箱
   */
  @Column({ length: 100, nullable: true })
  email: string;

  /**
   * 是否默认联系人
   */
  @Column({ type: 'boolean', name: 'is_default', default: false })
  isDefault: boolean;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  /**
   * 所属客户
   */
  @ManyToOne(() => Customer, (customer) => customer.contacts)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}
