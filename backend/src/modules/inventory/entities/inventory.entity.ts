import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Warehouse } from '../../base-data/entities/warehouse.entity';
import { Product } from '../../base-data/entities/product.entity';
import { Batch } from '../../batch/entities/batch.entity';

@Entity('inventory')
@Index(['warehouseId', 'productId', 'batchId'], { unique: true })
export class Inventory extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  warehouseId: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'uuid' })
  batchId: string;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  availableQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  lockedQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  unitCost: number;

  @Column({ type: 'timestamp', nullable: true })
  lastMovementAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Batch)
  @JoinColumn({ name: 'batchId' })
  batch: Batch;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;
}
