import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProcessRoute } from './process-route.entity';

/**
 * 工序实体
 * 属于某个工艺路线的具体工序
 */
@Entity('process_steps')
@Index(['routeId'])
@Index(['sequence'])
export class ProcessStep extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 工序编号
   */
  @Column({ length: 50, name: 'step_no' })
  stepNo: string;

  /**
   * 工序名称
   */
  @Column({ length: 100, name: 'step_name' })
  stepName: string;

  /**
   * 工艺路线ID
   */
  @Column({ type: 'uuid', name: 'route_id' })
  routeId: string;

  /**
   * 工序顺序
   */
  @Column({ type: 'int', name: 'sequence' })
  sequence: number;

  /**
   * 标准工时（小时）
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'standard_hours' })
  standardHours: number;

  /**
   * 标准工价（元）
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'standard_price' })
  standardPrice: number;

  /**
   * 工序类型：染色/定型/裁剪/缝制/包装等
   */
  @Column({ length: 50, name: 'step_type' })
  stepType: string;

  /**
   * 工艺参数 - JSON格式存储温度、时间等参数
   */
  @Column({ type: 'jsonb', nullable: true })
  parameters: Record<string, any>;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  notes: string;

  /**
   * 所属工艺路线
   */
  @ManyToOne(() => ProcessRoute, (route) => route.steps)
  @JoinColumn({ name: 'route_id' })
  processRoute: ProcessRoute;
}
