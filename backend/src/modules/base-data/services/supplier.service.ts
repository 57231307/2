import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Supplier, SupplierStatus } from '../entities/supplier.entity';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  /**
   * 创建供应商
   */
  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    // 检查编码是否已存在
    const existingSupplier = await this.supplierRepository.findOne({
      where: { code: createSupplierDto.code },
    });

    if (existingSupplier) {
      throw new ConflictException('供应商编码已存在');
    }

    const supplier = this.supplierRepository.create(createSupplierDto);
    return this.supplierRepository.save(supplier);
  }

  /**
   * 分页查询供应商列表
   */
  async findAll(
    options: PaginationOptions,
    filters: {
      keyword?: string;
      type?: string;
      status?: SupplierStatus;
    },
  ): Promise<PaginatedResult<Supplier>> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'DESC' } = options;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Supplier> = {};

    if (filters.keyword) {
      where.name = Like(`%${filters.keyword}%`);
    }

    if (filters.type) {
      where.type = filters.type as any;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const [items, total] = await this.supplierRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { [sortBy]: sortOrder },
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 根据ID查询供应商
   */
  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException(`供应商ID ${id} 不存在`);
    }

    return supplier;
  }

  /**
   * 更新供应商
   */
  async update(id: string, updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findOne(id);

    // 如果更新编码，检查编码是否已被其他供应商使用
    if (updateSupplierDto.code && updateSupplierDto.code !== supplier.code) {
      const existingSupplier = await this.supplierRepository.findOne({
        where: { code: updateSupplierDto.code },
      });

      if (existingSupplier) {
        throw new ConflictException('供应商编码已被使用');
      }
    }

    Object.assign(supplier, updateSupplierDto);
    return this.supplierRepository.save(supplier);
  }

  /**
   * 删除供应商（软删除）
   */
  async remove(id: string): Promise<void> {
    const supplier = await this.findOne(id);
    supplier.isActive = false;
    await this.supplierRepository.save(supplier);
  }

  /**
   * 自动生成供应商编码
   * 格式: SUP-YYYYMMDD-0001
   */
  async generateCode(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `SUP-${dateStr}-`;

    // 查找当天最大的序号
    const latestSupplier = await this.supplierRepository
      .createQueryBuilder('supplier')
      .where('supplier.code LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('supplier.code', 'DESC')
      .getOne();

    let nextSeq = 1;
    if (latestSupplier) {
      const lastSeq = parseInt(latestSupplier.code.split('-')[2], 10);
      nextSeq = lastSeq + 1;
    }

    return `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  }
}
