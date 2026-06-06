import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ColorFormula } from '../../color-formula/entities/color-formula.entity';
import { Pattern } from '../../pattern/entities/pattern.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';

export enum ProductType {
  FABRIC = 'FABRIC', // 面料
  GREIGE_GOODS = 'GREIGE_GOODS', // 坯布
  AUXILIARY = 'AUXILIARY', // 助剂
  DYE = 'DYE', // 染料
  OTHER = 'OTHER', // 其他
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

  @Column({ type: 'enum', enum: ProductType, default: ProductType.FABRIC })
  type: ProductType;

  @Column({ type: 'text', nullable: true })
  spec: string; // 规格描述

  @Column({ length: 20, default: 'meter' })
  unit: string; // 单位：米/千克/卷等

  @Column({ type: 'uuid', nullable: true })
  colorFormulaId: string;

  @Column({ type: 'uuid', nullable: true })
  patternId: string;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  standardCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  salePrice: number;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @Column({ type: 'jsonb', nullable: true })
  images: any[];

  @Column({ type: 'jsonb', nullable: true })
  attachments: any[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @ManyToOne(() => ColorFormula, { nullable: true })
  @JoinColumn({ name: 'colorFormulaId' })
  colorFormula: ColorFormula;

  @ManyToOne(() => Pattern, { nullable: true })
  @JoinColumn({ name: 'patternId' })
  pattern: Pattern;

  @OneToMany(() => Inventory, (inventory) => inventory.product)
  inventory: Inventory[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;
}
