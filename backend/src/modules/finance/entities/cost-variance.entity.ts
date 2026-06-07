/**
 * 成本差异分析实体
 * 用于记录工单/订单的标准成本与实际成本差异分析
 */
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * 成本差异分析实体
 */
@Entity('cost_variances')
@Index(['analysisNo'], { unique: true })
@Index(['orderId'])
@Index(['workOrderId'])
@Index(['analysisDate'])
export class CostVariance extends BaseEntity {
  /**
   * 分析编号
   */
  @Column({ length: 50, name: 'analysis_no' })
  analysisNo: string;

  /**
   * 工单ID（可选）
   */
  @Column({ type: 'uuid', name: 'work_order_id', nullable: true })
  workOrderId: string;

  /**
   * 工单编号（冗余存储）
   */
  @Column({ length: 50, name: 'work_order_no', nullable: true })
  workOrderNo: string;

  /**
   * 订单ID（可选）
   */
  @Column({ type: 'uuid', name: 'order_id', nullable: true })
  orderId: string;

  /**
   * 订单编号（冗余存储）
   */
  @Column({ length: 50, name: 'order_no', nullable: true })
  orderNo: string;

  /**
   * 产品ID
   */
  @Column({ type: 'uuid', name: 'product_id', nullable: true })
  productId: string;

  /**
   * 产品名称（冗余存储）
   */
  @Column({ length: 200, name: 'product_name', nullable: true })
  productName: string;

  /**
   * 产品编码（冗余存储）
   */
  @Column({ length: 50, name: 'product_code', nullable: true })
  productCode: string;

  /**
   * 标准成本
   */
  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'standard_cost' })
  standardCost: number;

  /**
   * 实际成本
   */
  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'actual_cost' })
  actualCost: number;

  /**
   * 差异金额（实际成本 - 标准成本）
   */
  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'variance_amount' })
  varianceAmount: number;

  /**
   * 差异率（差异金额 / 标准成本 * 100%）
   */
  @Column({ type: 'decimal', precision: 10, scale: 4, name: 'variance_rate' })
  varianceRate: number;

  /**
   * 差异原因
   */
  @Column({ type: 'text', name: 'variance_reason', nullable: true })
  varianceReason: string;

  /**
   * 分析日期
   */
  @Column({ type: 'date', name: 'analysis_date' })
  analysisDate: Date;

  /**
   * 分析人
   */
  @Column({ length: 50, name: 'analyst' })
  analyst: string;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;
}
