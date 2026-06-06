import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Warehouse, WarehouseStatus } from '../entities/warehouse.entity';
import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface WarehouseFilters {
  code?: string;
  name?: string;
  type?: string;
  status?: WarehouseStatus;
  isActive?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  /**
   * 创建仓库
   */
  async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    // 检查编码是否已存在
    const existingWarehouse = await this.warehouseRepository.findOne({
      where: { code: createWarehouseDto.code },
    });

    if (existingWarehouse) {
      throw new ConflictException('仓库编码已存在');
    }

    const warehouse = this.warehouseRepository.create(createWarehouseDto);
    return this.warehouseRepository.save(warehouse);
  }

  /**
   * 分页查询仓库列表
   */
  async findAll(
    options: PaginationOptions,
    filters: WarehouseFilters,
  ): Promise<PaginatedResult<Warehouse>> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'DESC' } = options;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Warehouse> = {};

    if (filters.code) {
      where.code = Like(`%${filters.code}%`);
    }

    if (filters.name) {
      where.name = Like(`%${filters.name}%`);
    }

    if (filters.type) {
      where.type = filters.type as any;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [data, total] = await this.warehouseRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: {
        [sortBy]: sortOrder,
      },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 根据ID查询仓库详情
   */
  async findOne(id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id },
    });

    if (!warehouse) {
      throw new NotFoundException('仓库不存在');
    }

    return warehouse;
  }

  /**
   * 更新仓库信息
   */
  async update(id: string, updateWarehouseDto: UpdateWarehouseDto): Promise<Warehouse> {
    const warehouse = await this.findOne(id);

    // 如果更新编码，检查编码是否已被其他仓库使用
    if (updateWarehouseDto.code && updateWarehouseDto.code !== warehouse.code) {
      const existingWarehouse = await this.warehouseRepository.findOne({
        where: { code: updateWarehouseDto.code },
      });

      if (existingWarehouse) {
        throw new ConflictException('仓库编码已被其他仓库使用');
      }
    }

    Object.assign(warehouse, updateWarehouseDto);
    return this.warehouseRepository.save(warehouse);
  }

  /**
   * 删除仓库（软删除）
   */
  async remove(id: string): Promise<void> {
    const warehouse = await this.findOne(id);

    warehouse.isActive = false;
    await this.warehouseRepository.save(warehouse);
  }

  /**
   * 永久删除仓库
   */
  async forceRemove(id: string): Promise<void> {
    const warehouse = await this.findOne(id);
    await this.warehouseRepository.remove(warehouse);
  }

  /**
   * 自动生成仓库编码
   * 格式: WH-YYYYMMDD-XXXX
   */
  async generateCode(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `WH-${dateStr}-`;

    // 查找今天已经生成的最大的编号
    const lastWarehouse = await this.warehouseRepository
      .createQueryBuilder('warehouse')
      .where('warehouse.code LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('warehouse.code', 'DESC')
      .getOne();

    let nextNumber = 1;

    if (lastWarehouse) {
      const lastCode = lastWarehouse.code;
      const lastNumber = parseInt(lastCode.split('-')[2], 10);

      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const nextCode = `${prefix}${nextNumber.toString().padStart(4, '0')}`;

    return nextCode;
  }

  /**
   * 批量创建仓库（用于初始化）
   */
  async createBatch(warehouses: CreateWarehouseDto[]): Promise<Warehouse[]> {
    // 验证所有编码唯一
    const codes = warehouses.map((w) => w.code);
    const existingWarehouses = await this.warehouseRepository
      .createQueryBuilder('warehouse')
      .where('warehouse.code IN (:...codes)', { codes })
      .getMany();

    if (existingWarehouses.length > 0) {
      const existingCodes = existingWarehouses.map((w) => w.code).join(', ');
      throw new ConflictException(`以下仓库编码已存在: ${existingCodes}`);
    }

    const entities = warehouses.map((dto) => this.warehouseRepository.create(dto));
    return this.warehouseRepository.save(entities);
  }

  /**
   * 检查仓库编码是否可用
   */
  async isCodeAvailable(code: string, excludeId?: string): Promise<boolean> {
    const where: FindOptionsWhere<Warehouse> = { code };

    if (excludeId) {
      where.id = excludeId as any;
    }

    const count = await this.warehouseRepository.count({ where });
    return count === 0;
  }
}
