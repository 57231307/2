import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product, ProductStatus } from '../entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(data: Partial<Product>): Promise<Product> {
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

  async findAll(
    page: number = 1,
    limit: number = 20,
    search?: string,
    type?: string,
    status?: ProductStatus,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const where: any = {};
    if (search) {
      where.name = Like(`%${search}%`);
    }
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.productRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('产品不存在');
    }
    return product;
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
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

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    product.status = ProductStatus.DISCONTINUED;
    await this.productRepository.save(product);
  }

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
}
