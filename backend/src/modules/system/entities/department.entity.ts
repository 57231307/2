/**
 * 部门实体
 * 用于管理系统组织架构中的部门信息
 */
import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * 部门状态枚举
 */
export enum DepartmentStatus {
  /** 启用 */
  ACTIVE = 'ACTIVE',
  /** 停用 */
  INACTIVE = 'INACTIVE',
}

/**
 * 部门实体
 */
@Entity('departments')
@Index(['departmentCode'], { unique: true })
@Index(['parentId'])
export class Department extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 部门编号
   */
  @Column({ length: 50, name: 'department_code', unique: true })
  departmentCode: string;

  /**
   * 部门名称
   */
  @Column({ length: 100, name: 'department_name' })
  departmentName: string;

  /**
   * 上级部门ID
   */
  @Column({ type: 'uuid', name: 'parent_id', nullable: true })
  parentId: string;

  /**
   * 上级部门（树形结构）
   */
  @ManyToOne(() => Department, (department) => department.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Department;

  /**
   * 子部门列表
   */
  children: Department[];

  /**
   * 部门负责人ID
   */
  @Column({ type: 'uuid', name: 'manager_id', nullable: true })
  managerId: string;

  /**
   * 部门负责人姓名
   */
  @Column({ length: 100, name: 'manager_name', nullable: true })
  managerName: string;

  /**
   * 部门负责人电话
   */
  @Column({ length: 20, name: 'manager_phone', nullable: true })
  managerPhone: string;

  /**
   * 部门负责人邮箱
   */
  @Column({ length: 100, name: 'manager_email', nullable: true })
  managerEmail: string;

  /**
   * 部门状态
   */
  @Column({
    type: 'enum',
    enum: DepartmentStatus,
    default: DepartmentStatus.ACTIVE,
    name: 'status',
  })
  status: DepartmentStatus;

  /**
   * 排序号
   */
  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number;

  /**
   * 部门描述
   */
  @Column({ type: 'text', nullable: true, name: 'description' })
  description: string;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;
}
