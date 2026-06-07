import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Supplier, SupplierStatus } from '../entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { QuerySupplierDto } from './dto/query-supplier.dto';

/**
 * 供应商服务
 * 提供供应商的增删改查等功能
 */
@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  /**
   * 创建供应商
   */
  async create(data: CreateSupplierDto): Promise<Supplier> {
    const code = data.code || await this.generateCode();

    const existing = await this.supplierRepository.findOne({ where: { code } });
    if (existing) {
      throw new ConflictException('供应商编码已存在');
    }

    const supplier = this.supplierRepository.create({
      ...data,
      code,
    });
    return this.supplierRepository.save(supplier);
  }

  /**
   * 查询供应商列表
   */
  async findAll(query: QuerySupplierDto): Promise<{ data: Supplier[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, search, type, status } = query;

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

    const [data, total] = await this.supplierRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * 获取供应商详情
   */
  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }
    return supplier;
  }

  /**
   * 更新供应商
   */
  async update(id: string, data: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findOne(id);

    if (data.code && data.code !== supplier.code) {
      const existing = await this.supplierRepository.findOne({ where: { code: data.code } });
      if (existing) {
        throw new ConflictException('供应商编码已存在');
      }
    }

    Object.assign(supplier, data);
    return this.supplierRepository.save(supplier);
  }

  /**
   * 删除供应商（软删除）
   */
  async remove(id: string): Promise<void> {
    const supplier = await this.findOne(id);
    supplier.status = SupplierStatus.INACTIVE;
    await this.supplierRepository.save(supplier);
  }

  /**
   * 生成供应商编码
   * 格式：SUP + 日期(YYYYMMDD) + 序号(4位)
   */
  async generateCode(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `SUP${dateStr}`;

    const count = await this.supplierRepository.count({
      where: { code: Like(`${prefix}%`) },
    });

    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}${seq}`;
  }
}
