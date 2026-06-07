import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { format } from 'date-fns';
import { Warehouse, WarehouseStatus } from '../entities/warehouse.entity';
import { InventoryBatch } from '../entities/inventory-batch.entity';
import { BatchSourceType } from '../enums/batch-source-type.enum';
import { BatchStatus } from '../enums/batch-status.enum';
import { QualityStatus } from '../enums/quality-status.enum';
import { CreateWarehouseDto, UpdateWarehouseDto, QueryWarehouseDto } from '../dto/warehouse.dto';
import { CreateBatchDto, UpdateBatchDto, QueryBatchDto } from '../dto/inventory-batch.dto';
import { InboundDto, InboundResultDto } from '../dto/inbound.dto';
import { OutboundDto, OutboundResultDto } from '../dto/outbound.dto';

/**
 * 仓库服务
 * 提供仓库的CRUD操作
 */
@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
  ) {}

  /**
   * 创建仓库
   */
  async create(data: CreateWarehouseDto): Promise<Warehouse> {
    const existing = await this.warehouseRepository.findOne({ where: { code: data.code } });
    if (existing) {
      throw new ConflictException('仓库编码已存在');
    }

    const warehouse = this.warehouseRepository.create(data);
    return this.warehouseRepository.save(warehouse);
  }

  /**
   * 查询仓库列表
   */
  async findAll(
    query: QueryWarehouseDto,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Warehouse[]; total: number; page: number; limit: number }> {
    const where: any = {};
    
    if (query.search) {
      where.name = Like(`%${query.search}%`);
    }
    if (query.type) {
      where.type = query.type;
    }

    const [data, total] = await this.warehouseRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * 获取仓库详情
   */
  async findOne(id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({ where: { id } });
    if (!warehouse) {
      throw new NotFoundException('仓库不存在');
    }
    return warehouse;
  }

  /**
   * 更新仓库
   */
  async update(id: string, data: UpdateWarehouseDto): Promise<Warehouse> {
    const warehouse = await this.findOne(id);
    Object.assign(warehouse, data);
    return this.warehouseRepository.save(warehouse);
  }

  /**
   * 删除仓库（软删除）
   */
  async remove(id: string): Promise<void> {
    const warehouse = await this.findOne(id);
    warehouse.status = WarehouseStatus.INACTIVE;
    await this.warehouseRepository.save(warehouse);
  }
}

/**
 * 批次服务 - 核心！
 * 提供缸号匹号管理、入库出库等核心功能
 */
@Injectable()
export class BatchService {
  constructor(
    @InjectRepository(InventoryBatch)
    private batchRepository: Repository<InventoryBatch>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
  ) {}

  /**
   * 创建批次（单个批次入库）
   */
  async createBatch(data: CreateBatchDto): Promise<InventoryBatch> {
    // 校验缸号匹号唯一性
    await this.validateRollNoUnique(data.productId, data.colorVariantId, data.batchNo, data.rollNo);

    const batch = this.batchRepository.create({
      ...data,
      productionDate: data.productionDate ? new Date(data.productionDate) : undefined,
    });

    return this.batchRepository.save(batch);
  }

  /**
   * 生成缸号
   * 规则：GD-YYYYMMDD-XXX，同一产品+颜色+日期下唯一
   */
  async generateBatchNo(productId: string, colorVariantId?: string): Promise<string> {
    const today = new Date();
    const dateStr = format(today, 'yyyyMMdd');
    const prefix = `GD${dateStr}`;

    // 查询当日该产品+颜色的最大序号
    const queryBuilder = this.batchRepository
      .createQueryBuilder('batch')
      .where('batch.product_id = :productId', { productId })
      .andWhere('batch.batch_no LIKE :prefix', { prefix: `${prefix}%` });

    if (colorVariantId) {
      queryBuilder.andWhere('batch.color_variant_id = :colorVariantId', { colorVariantId });
    }

    queryBuilder.orderBy('batch.batch_no', 'DESC').select(['batch.batch_no']);

    const maxBatch = await queryBuilder.getOne();

    let nextNumber = 1;
    if (maxBatch) {
      const lastNo = maxBatch.batchNo.slice(-3);
      nextNumber = parseInt(lastNo, 10) + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * 生成匹号
   * 规则：P-XXX，同一缸号内自动递增
   */
  async generateRollNo(batchNo: string): Promise<string> {
    // 查询当前缸号内已有的最大匹号
    const maxRoll = await this.batchRepository
      .createQueryBuilder('batch')
      .where('batch.batch_no = :batchNo', { batchNo })
      .orderBy('batch.roll_no', 'DESC')
      .select(['batch.roll_no'])
      .getOne();

    let nextNumber = 1;
    if (maxRoll) {
      const currentNo = parseInt(maxRoll.rollNo.replace('P', ''), 10);
      nextNumber = currentNo + 1;
    }

    return `P${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * 校验匹号唯一性
   * 规则：同一缸号内匹号不能重复
   */
  async validateRollNoUnique(
    productId: string,
    colorVariantId: string | null,
    batchNo: string,
    rollNo: string,
  ): Promise<void> {
    const where: any = {
      productId,
      batchNo,
      rollNo,
    };

    if (colorVariantId) {
      where.colorVariantId = colorVariantId;
    }

    const existing = await this.batchRepository.findOne({ where });

    if (existing) {
      throw new ConflictException(`匹号 ${rollNo} 在缸号 ${batchNo} 中已存在，请使用其他匹号`);
    }
  }

  /**
   * 查询批次列表
   */
  async findBatches(
    query: QueryBatchDto,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: InventoryBatch[]; total: number; page: number; limit: number }> {
    const where: any = {};

    if (query.productId) {
      where.productId = query.productId;
    }
    if (query.colorVariantId) {
      where.colorVariantId = query.colorVariantId;
    }
    if (query.batchNo) {
      where.batchNo = query.batchNo;
    }
    if (query.warehouseId) {
      where.warehouseId = query.warehouseId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.qualityStatus) {
      where.qualityStatus = query.qualityStatus;
    }

    const [data, total] = await this.batchRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * 获取批次详情
   */
  async findBatchById(id: string): Promise<InventoryBatch> {
    const batch = await this.batchRepository.findOne({ where: { id } });
    if (!batch) {
      throw new NotFoundException('批次不存在');
    }
    return batch;
  }

  /**
   * 更新批次
   */
  async updateBatch(id: string, data: UpdateBatchDto): Promise<InventoryBatch> {
    const batch = await this.findBatchById(id);
    Object.assign(batch, data);
    return this.batchRepository.save(batch);
  }

  /**
   * 扣减批次库存（出库）
   */
  async deductBatch(id: string, quantity: number): Promise<InventoryBatch> {
    const batch = await this.findBatchById(id);

    if (batch.quantity < quantity) {
      throw new BadRequestException(`批次库存不足，当前库存：${batch.quantity}，需要扣减：${quantity}`);
    }

    if (batch.status !== BatchStatus.ACTIVE) {
      throw new BadRequestException(`批次状态不允许出库，当前状态：${batch.status}`);
    }

    batch.quantity = batch.quantity - quantity;
    return this.batchRepository.save(batch);
  }

  /**
   * 增加批次库存（入库）
   */
  async addBatch(id: string, quantity: number): Promise<InventoryBatch> {
    const batch = await this.findBatchById(id);
    batch.quantity = batch.quantity + quantity;
    return this.batchRepository.save(batch);
  }

  /**
   * 执行入库（包含匹号）
   */
  async inbound(data: InboundDto): Promise<InboundResultDto> {
    // 验证仓库存在
    const warehouse = await this.warehouseRepository.findOne({ where: { id: data.warehouseId } });
    if (!warehouse) {
      throw new NotFoundException('仓库不存在');
    }

    // 生成或使用提供的缸号
    let batchNo = data.batchNo;
    if (!batchNo) {
      batchNo = await this.generateBatchNo(data.productId, data.colorVariantId);
    }

    const results: InboundResultDto = {
      batchNo,
      batches: [],
    };

    // 遍历匹号列表，创建批次
    for (const roll of data.rolls) {
      // 校验匹号唯一性
      await this.validateRollNoUnique(data.productId, data.colorVariantId || null, batchNo, roll.rollNo);

      const batch = this.batchRepository.create({
        batchNo,
        rollNo: roll.rollNo,
        productId: data.productId,
        colorVariantId: data.colorVariantId,
        warehouseId: data.warehouseId,
        locationCode: roll.locationCode,
        quantity: roll.quantity,
        unit: 'meter',
        productionDate: roll.productionDate ? new Date(roll.productionDate) : new Date(),
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        sourceNo: data.sourceNo,
        gramWeight: roll.gramWeight,
        width: roll.width,
        remark: roll.remark,
        qualityStatus: QualityStatus.PASSED,
        status: BatchStatus.ACTIVE,
      });

      const saved = await this.batchRepository.save(batch);
      results.batches.push({
        rollNo: saved.rollNo,
        quantity: saved.quantity,
        locationCode: saved.locationCode,
        id: saved.id,
      });
    }

    return results;
  }

  /**
   * 执行出库
   */
  async outbound(data: OutboundDto): Promise<OutboundResultDto> {
    const result: OutboundResultDto = {
      successCount: 0,
      failedCount: 0,
      items: [],
    };

    for (const item of data.items) {
      try {
        const batch = await this.findBatchById(item.batchId);

        // 验证产品匹配
        if (batch.productId !== data.productId) {
          throw new BadRequestException('产品不匹配');
        }

        // 验证颜色匹配
        if (data.colorVariantId && batch.colorVariantId !== data.colorVariantId) {
          throw new BadRequestException('颜色不匹配');
        }

        // 验证库存
        if (batch.quantity < item.quantity) {
          throw new BadRequestException(`批次库存不足`);
        }

        // 扣减库存
        batch.quantity = batch.quantity - item.quantity;
        await this.batchRepository.save(batch);

        result.successCount++;
        result.items.push({
          batchId: item.batchId,
          rollNo: batch.rollNo,
          quantity: item.quantity,
          success: true,
        });
      } catch (error) {
        result.failedCount++;
        result.items.push({
          batchId: item.batchId,
          rollNo: '',
          quantity: item.quantity,
          success: false,
          error: error.message,
        });
      }
    }

    return result;
  }

  /**
   * 按产品查询批次列表
   */
  async findByProduct(productId: string, colorVariantId?: string): Promise<InventoryBatch[]> {
    const where: any = { productId, status: BatchStatus.ACTIVE };
    if (colorVariantId) {
      where.colorVariantId = colorVariantId;
    }

    return this.batchRepository.find({
      where,
      order: { batchNo: 'DESC', rollNo: 'ASC' },
    });
  }

  /**
   * 按缸号查询匹号列表
   */
  async findByBatchNo(productId: string, colorVariantId: string, batchNo: string): Promise<InventoryBatch[]> {
    return this.batchRepository.find({
      where: {
        productId,
        colorVariantId,
        batchNo,
        status: In([BatchStatus.ACTIVE, BatchStatus.FROZEN]),
      },
      order: { rollNo: 'ASC' },
    });
  }

  /**
   * 匹号追溯 - 追溯匹号来源和去向
   */
  async traceRollNo(batchId: string): Promise<any> {
    const batch = await this.findBatchById(batchId);

    // TODO: 后续关联发货记录、出库记录等
    // 目前返回批次基本信息
    return {
      batch: {
        id: batch.id,
        batchNo: batch.batchNo,
        rollNo: batch.rollNo,
        productId: batch.productId,
        colorVariantId: batch.colorVariantId,
        warehouseId: batch.warehouseId,
        locationCode: batch.locationCode,
        quantity: batch.quantity,
        unit: batch.unit,
        productionDate: batch.productionDate,
        sourceType: batch.sourceType,
        sourceId: batch.sourceId,
        sourceNo: batch.sourceNo,
        qualityStatus: batch.qualityStatus,
        status: batch.status,
        createdAt: batch.createdAt,
      },
      // 来源追溯（后续扩展）
      sourceTrace: {
        type: batch.sourceType,
        documentId: batch.sourceId,
        documentNo: batch.sourceNo,
      },
      // 去向追溯（后续扩展）
      destinationTrace: [],
    };
  }
}