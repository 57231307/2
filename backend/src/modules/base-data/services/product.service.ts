import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, ILike } from 'typeorm';
import { Product, ProductType, ProductStatus } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

/**
 * 产品分页查询 DTO
 */
export interface ProductPaginationOptions {
  page?: number;
  pageSize?: number;
  type?: ProductType;
  status?: ProductStatus;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 产品分页结果 DTO
 */
export interface ProductPaginationResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 产品服务
 */
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * 创建产品
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    // 如果没有提供编码，则自动生成
    if (!createProductDto.code) {
      createProductDto.code = await this.generateCode();
    } else {
      // 检查编码是否已存在
      const existingProduct = await this.productRepository.findOne({
        where: { code: createProductDto.code },
      });
      if (existingProduct) {
        throw new ConflictException('产品编码已存在');
      }
    }

    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  /**
   * 分页查询产品列表
   */
  async findAll(options: ProductPaginationOptions): Promise<ProductPaginationResult> {
    const {
      page = 1,
      pageSize = 10,
      type,
      status,
      keyword,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = options;

    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: FindOptionsWhere<Product> = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    // 处理关键词搜索
    let queryBuilder = this.productRepository.createQueryBuilder('product');

    if (type) {
      queryBuilder = queryBuilder.andWhere('product.type = :type', { type });
    }

    if (status) {
      queryBuilder = queryBuilder.andWhere('product.status = :status', { status });
    }

    if (keyword) {
      queryBuilder = queryBuilder.andWhere(
        '(product.name LIKE :keyword OR product.code LIKE :keyword OR product.spec LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    // 排序
    const allowedSortFields = ['createdAt', 'updatedAt', 'name', 'code', 'type', 'status', 'salePrice', 'standardCost'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder = queryBuilder.orderBy(`product.${sortField}`, sortOrder);

    // 分页
    queryBuilder = queryBuilder.skip(skip).take(pageSize);

    // 获取总数
    const total = await queryBuilder.getCount();

    // 获取数据
    const items = await queryBuilder.getMany();

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根据ID查询产品
   */
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['colorFormula', 'pattern'],
    });

    if (!product) {
      throw new NotFoundException(`产品不存在: ${id}`);
    }

    return product;
  }

  /**
   * 更新产品
   */
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    // 如果更新编码，检查是否与已有产品冲突
    if (updateProductDto.code && updateProductDto.code !== product.code) {
      const existingProduct = await this.productRepository.findOne({
        where: { code: updateProductDto.code },
      });
      if (existingProduct) {
        throw new ConflictException('产品编码已存在');
      }
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  /**
   * 删除产品（软删除）
   */
  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    product.isActive = false;
    product.status = ProductStatus.DISCONTINUED;
    await this.productRepository.save(product);
  }

  /**
   * 永久删除产品
   */
  async forceRemove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  /**
   * 自动生成产品编码
   * 格式: PRD-YYYYMMDD-XXXX
   */
  async generateCode(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `PRD-${dateStr}-`;

    // 查找当天最大的序号
    const latestProduct = await this.productRepository
      .createQueryBuilder('product')
      .where('product.code LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('product.code', 'DESC')
      .getOne();

    let sequence = 1;
    if (latestProduct) {
      const lastSequence = parseInt(latestProduct.code.split('-')[2], 10);
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }
}
