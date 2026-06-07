import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProcessRouteStatus } from '../enums/process-route-status.enum';
import { ProcessStep } from './process-step.entity';

/**
 * 工艺路线实体
 * 定义产品的生产工艺路线，包含多个工序
 */
@Entity('process_routes')
@Index(['routeNo'])
@Index(['status'])
@Index(['productType'])
export class ProcessRoute extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 工艺路线编号 - 格式：GL-XXXXXXXX
   */
  @Column({ length: 50, name: 'route_no' })
  routeNo: string;

  /**
   * 工艺路线名称
   */
  @Column({ length: 100, name: 'route_name' })
  routeName: string;

  /**
   * 产品类型 - 如：染色布、印花布、坯布等
   */
  @Column({ length: 50, name: 'product_type' })
  productType: string;

  /**
   * 版本号 - 用于工艺变更记录
   */
  @Column({ length: 20, default: '1.0', name: 'version' })
  version: string;

  /**
   * 工艺路线状态：草稿/生效/废弃
   */
  @Column({
    type: 'enum',
    enum: ProcessRouteStatus,
    default: ProcessRouteStatus["草稿"],
  })
  status: ProcessRouteStatus;

  /**
   * 总工序数
   */
  @Column({ type: 'int', default: 0, name: 'total_processes' })
  totalProcesses: number;

  /**
   * 总标准工时（小时）
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_standard_hours' })
  totalStandardHours: number;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  notes: string;

  /**
   * 工序列表
   */
  @OneToMany(() => ProcessStep, (step) => step.processRoute)
  steps: ProcessStep[];
}
