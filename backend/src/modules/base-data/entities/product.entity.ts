import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum ProductType {
  FABRIC = 'FABRIC',
  GREIGE_GOODS = 'GREIGE_GOODS',
  AUXILIARY = 'AUXILIARY',
  DYE = 'DYE',
  OTHER = 'OTHER',
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED',
}

@Entity('products')
@Index(['code'], { unique: true })
@Index(['type'])
@Index(['status'])
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 200 })
  name: string;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.FABRIC,
  })
  type: ProductType;

  @Column({ type: 'text', nullable: true })
  spec: string;

  @Column({ length: 20, default: 'meter' })
  unit: string;

  @Column({ type: 'uuid', name: 'color_formula_id', nullable: true })
  colorFormulaId: string;

  @Column({ type: 'uuid', name: 'pattern_id', nullable: true })
  patternId: string;

  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'standard_cost', nullable: true })
  standardCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'sale_price', nullable: true })
  salePrice: number;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @Column({ type: 'jsonb', nullable: true })
  images: any[];

  @Column({ type: 'jsonb', nullable: true })
  attachments: any[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  remark: string;
}
