import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductStatus } from '../enums';
import { ProductColorVariant } from '../entities/product-color-variant.entity';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from '../dto';
import { CreateColorVariantDto, UpdateColorVariantDto } from '../dto';

/**
 * 产品服务
 * 提供产品的CRUD操作和颜色变体管理
 */
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductColorVariant)
    private variantRepository: Repository<ProductColorVariant>,
  ) {}

  // ========== 产品基础操作 ==========

  /**
   * 创建产品
   */
  async create(data: CreateProductDto): Promise<Product> {
    const code = data.code || await this.generateCode();
    const existing = await this.productRepository.findOne({ where: { code } });
    if (existing) {
      throw new ConflictException('产品编码已存在');
    }

    const product = this.productRepository.create({
      ...data,
      code,
    });
    return this.productRepository.save(product);
  }

  /**
   * 分页查询产品列表
   */
  async findAll(query: QueryProductDto): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = {};

    if (query.search) {
      where.name = Like(`%${query.search}%`);
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await this.productRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * 获取产品详情（包含颜色变体列表）
   */
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ 
      where: { id },
      relations: ['colorVariants'],
    });
    if (!product) {
      throw new NotFoundException('产品不存在');
    }
    return product;
  }

  /**
   * 更新产品
   */
  async update(id: string, data: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    
    if (data.code && data.code !== product.code) {
      const existing = await this.productRepository.findOne({ 
        where: { code: data.code },
      });
      if (existing) {
        throw new ConflictException('产品编码已存在');
      }
    }

    Object.assign(product, data);
    return this.productRepository.save(product);
  }

  /**
   * 删除产品（软删除 - 设置为停产状态）
   */
  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    product.status = ProductStatus.DISCONTINUED;
    await this.productRepository.save(product);
  }

  /**
   * 生成产品编码
   * 格式：PRD + 日期(YYYYMMDD) + 序号(4位)
   */
  private async generateCode(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `PRD${dateStr}`;
    
    const count = await this.productRepository.count({
      where: { code: Like(`${prefix}%`) },
    });
    
    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}${seq}`;
  }

  // ========== 颜色变体操作 ==========

  /**
   * 创建颜色变体
   * 核心方法 - 每个颜色变体有独立的编号和价格
   */
  async createVariant(productId: string, data: CreateColorVariantDto): Promise<ProductColorVariant> {
    // 验证产品存在
    const product = await this.findOne(productId);

    // 检查同一产品下颜色编号是否重复
    const existing = await this.variantRepository.findOne({
      where: { productId, colorNo: data.colorNo },
    });
    if (existing) {
      throw new ConflictException('该产品下颜色编号已存在');
    }

    const variant = this.variantRepository.create({
      ...data,
      productId,
    });

    const savedVariant = await this.variantRepository.save(variant);

    // 如果设置为默认颜色或这是第一个变体，则更新产品的默认变体
    if (data.isDefault || product.defaultVariantId === null) {
      await this.setDefaultVariant(productId, savedVariant.id);
      savedVariant.isDefault = true;
    }

    // 更新产品的hasColorVariants标志
    await this.productRepository.update(productId, { hasColorVariants: true });

    return savedVariant;
  }

  /**
   * 获取产品的颜色变体列表
   */
  async findVariantsByProduct(productId: string): Promise<ProductColorVariant[]> {
    // 验证产品存在
    await this.findOne(productId);
    
    return this.variantRepository.find({
      where: { productId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * 获取颜色变体详情
   */
  async findVariantById(id: string): Promise<ProductColorVariant> {
    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!variant) {
      throw new NotFoundException('颜色变体不存在');
    }
    return variant;
  }

  /**
   * 更新颜色变体
   */
  async updateVariant(id: string, data: UpdateColorVariantDto): Promise<ProductColorVariant> {
    const variant = await this.findVariantById(id);

    // 如果更新颜色编号，检查是否重复
    if (data.colorNo && data.colorNo !== variant.colorNo) {
      const existing = await this.variantRepository.findOne({
        where: { productId: variant.productId, colorNo: data.colorNo },
      });
      if (existing) {
        throw new ConflictException('该产品下颜色编号已存在');
      }
    }

    Object.assign(variant, data);
    return this.variantRepository.save(variant);
  }

  /**
   * 删除颜色变体
   */
  async removeVariant(id: string): Promise<void> {
    const variant = await this.findVariantById(id);
    await this.variantRepository.remove(variant);

    // 如果删除的是默认变体，需要更新产品的默认变体
    if (variant.isDefault) {
      const remaining = await this.variantRepository.findOne({
        where: { productId: variant.productId },
        order: { createdAt: 'DESC' },
      });
      
      const hasVariants = remaining !== null;
      await this.productRepository.update(variant.productId, { 
        hasColorVariants: hasVariants,
        defaultVariantId: remaining?.id || null,
      });
    }
  }

  /**
   * 获取颜色变体价格（用于订单）
   * 优先级：颜色变体价格 > 产品默认价格
   */
  async getVariantPrice(id: string): Promise<{ salePrice: number; standardCost: number }> {
    const variant = await this.findVariantById(id);
    return {
      salePrice: Number(variant.salePrice),
      standardCost: variant.standardCost ? Number(variant.standardCost) : 0,
    };
  }

  /**
   * 设置默认颜色变体
   */
  async setDefaultVariant(productId: string, variantId: string): Promise<void> {
    // 验证产品和变体存在
    await this.findOne(productId);
    const variant = await this.findVariantById(variantId);

    if (variant.productId !== productId) {
      throw new ConflictException('颜色变体不属于该产品');
    }

    // 取消该产品的所有默认标记
    await this.variantRepository.update(
      { productId },
      { isDefault: false },
    );

    // 设置新的默认变体
    await this.variantRepository.update(variantId, { isDefault: true });

    // 更新产品的默认变体ID
    await this.productRepository.update(productId, { defaultVariantId: variantId });
  }
}