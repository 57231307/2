import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { format } from 'date-fns';
import { InventoryCheck, InventoryCheckStatus, InventoryCheckType } from '../entities/inventory-check.entity';
import { InventoryCheckItem } from '../entities/inventory-check-item.entity';
import { InventoryBatch } from '../entities/inventory-batch.entity';
import { BatchStatus } from '../enums/batch-status.enum';
import { Warehouse } from '../../base-data/entities/warehouse.entity';

/**
 * 创建盘点单DTO
 */
export interface CreateInventoryCheckDto {
  warehouseId: string;
  checkType: InventoryCheckType;
  checkDate: string;
  manager?: string;
  notes?: string;
  batchIds?: string[];
}

/**
 * 盘点单查询DTO
 */
export interface QueryInventoryCheckDto {
  warehouseId?: string;
  status?: InventoryCheckStatus;
  checkType?: InventoryCheckType;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * 更新盘点单DTO
 */
export interface UpdateInventoryCheckDto {
  checkType?: InventoryCheckType;
  checkDate?: string;
  manager?: string;
  notes?: string;
}

/**
 * 提交盘点结果DTO
 */
export interface SubmitCheckResultDto {
  items: {
    batchId: string;
    actualQuantity: number;
    notes?: string;
  }[];
}

/**
 * 审批差异DTO
 */
export interface ApproveDifferenceDto {
  approved: boolean;
  notes?: string;
}

/**
 * 盘点单服务
 * 提供盘点单的CRUD操作和盘点流程管理
 */
@Injectable()
export class InventoryCheckService {
  constructor(
    @InjectRepository(InventoryCheck)
    private checkRepository: Repository<InventoryCheck>,
    @InjectRepository(InventoryCheckItem)
    private checkItemRepository: Repository<InventoryCheckItem>,
    @InjectRepository(InventoryBatch)
    private batchRepository: Repository<InventoryBatch>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    private dataSource: DataSource,
  ) {}

  /**
   * 生成盘点单号
   * 规则：PD-YYYYMMDD-XXX
   */
  private async generateCheckNo(): Promise<string> {
    const today = new Date();
    const dateStr = format(today, 'yyyyMMdd');
    const prefix = `PD${dateStr}`;

    const maxCheck = await this.checkRepository
      .createQueryBuilder('check')
      .where('check.check_no LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('check.check_no', 'DESC')
      .select(['check.check_no'])
      .getOne();

    let nextNumber = 1;
    if (maxCheck) {
      const lastNo = maxCheck.checkNo.slice(-3);
      nextNumber = parseInt(lastNo, 10) + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * 创建盘点单
   * 根据盘点类型自动生成盘点明细
   */
  async create(data: CreateInventoryCheckDto): Promise<InventoryCheck> {
    // 验证仓库存在
    const warehouse = await this.warehouseRepository.findOne({ where: { id: data.warehouseId } });
    if (!warehouse) {
      throw new NotFoundException('仓库不存在');
    }

    // 生成盘点单号
    const checkNo = await this.generateCheckNo();

    // 创建盘点单
    const check = this.checkRepository.create({
      checkNo,
      warehouseId: data.warehouseId,
      checkType: data.checkType,
      checkDate: new Date(data.checkDate),
      manager: data.manager,
      notes: data.notes,
      status: InventoryCheckStatus.待盘点,
    });

    const savedCheck = await this.checkRepository.save(check);

    // 如果指定了批次ID，创建盘点明细
    if (data.batchIds && data.batchIds.length > 0) {
      const batches = await this.batchRepository.findBy({ id: data.batchIds as any });
      
      for (const batch of batches) {
        const item = this.checkItemRepository.create({
          inventoryCheckId: savedCheck.id,
          batchId: batch.id,
          colorVariantId: batch.colorVariantId,
          bookQuantity: batch.quantity,
          actualQuantity: 0,
          differenceQuantity: 0,
          differenceAmount: 0,
        });
        await this.checkItemRepository.save(item);
      }
    } else if (data.checkType === InventoryCheckType.全盘) {
      // 全盘：获取仓库下所有批次
      const batches = await this.batchRepository.find({
        where: { warehouseId: data.warehouseId, status: BatchStatus.ACTIVE },
      });

      for (const batch of batches) {
        const item = this.checkItemRepository.create({
          inventoryCheckId: savedCheck.id,
          batchId: batch.id,
          colorVariantId: batch.colorVariantId,
          bookQuantity: batch.quantity,
          actualQuantity: 0,
          differenceQuantity: 0,
          differenceAmount: 0,
        });
        await this.checkItemRepository.save(item);
      }
    }

    return this.findOne(savedCheck.id);
  }

  /**
   * 查询盘点单列表
   */
  async findAll(
    query: QueryInventoryCheckDto,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: InventoryCheck[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.checkRepository
      .createQueryBuilder('check')
      .leftJoinAndSelect('check.items', 'items')
      .where('1=1');

    if (query.warehouseId) {
      queryBuilder.andWhere('check.warehouse_id = :warehouseId', { warehouseId: query.warehouseId });
    }
    if (query.status) {
      queryBuilder.andWhere('check.status = :status', { status: query.status });
    }
    if (query.checkType) {
      queryBuilder.andWhere('check.check_type = :checkType', { checkType: query.checkType });
    }
    if (query.startDate) {
      queryBuilder.andWhere('check.check_date >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      queryBuilder.andWhere('check.check_date <= :endDate', { endDate: query.endDate });
    }
    if (query.search) {
      queryBuilder.andWhere('check.check_no LIKE :search', { search: `%${query.search}%` });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('check.created_at', 'DESC')
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * 获取盘点单详情（含明细）
   */
  async findOne(id: string): Promise<InventoryCheck> {
    const check = await this.checkRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!check) {
      throw new NotFoundException('盘点单不存在');
    }

    return check;
  }

  /**
   * 更新盘点单
   */
  async update(id: string, data: UpdateInventoryCheckDto): Promise<InventoryCheck> {
    const check = await this.findOne(id);

    if (check.status === InventoryCheckStatus.已完成) {
      throw new BadRequestException('已完成的盘点单不允许修改');
    }

    if (data.checkType) {
      check.checkType = data.checkType;
    }
    if (data.checkDate) {
      check.checkDate = new Date(data.checkDate);
    }
    if (data.manager !== undefined) {
      check.manager = data.manager;
    }
    if (data.notes !== undefined) {
      check.notes = data.notes;
    }

    return this.checkRepository.save(check);
  }

  /**
   * 提交盘点结果
   * 更新每个批次的实盘数量和差异
   */
  async submitCheck(id: string, items: SubmitCheckResultDto['items']): Promise<InventoryCheck> {
    const check = await this.findOne(id);

    if (check.status === InventoryCheckStatus.已完成) {
      throw new BadRequestException('已完成的盘点单不允许再提交');
    }

    // 更新盘点状态为盘点中
    if (check.status === InventoryCheckStatus.待盘点) {
      check.status = InventoryCheckStatus.盘点中;
      await this.checkRepository.save(check);
    }

    // 更新每个明细项
    for (const itemData of items) {
      const item = await this.checkItemRepository.findOne({
        where: { inventoryCheckId: id, batchId: itemData.batchId },
      });

      if (item) {
        item.actualQuantity = itemData.actualQuantity;
        item.differenceQuantity = itemData.actualQuantity - Number(item.bookQuantity);
        if (itemData.notes) {
          item.notes = itemData.notes;
        }
        await this.checkItemRepository.save(item);
      }
    }

    return this.findOne(id);
  }

  /**
   * 审批差异
   */
  async approveDifference(id: string, approved: boolean, notes?: string): Promise<InventoryCheck> {
    const check = await this.findOne(id);

    if (check.status !== InventoryCheckStatus.盘点中) {
      throw new BadRequestException('只有盘点中的盘点单可以审批差异');
    }

    if (notes) {
      check.notes = check.notes ? `${check.notes}\n审批备注：${notes}` : `审批备注：${notes}`;
    }

    return this.checkRepository.save(check);
  }

  /**
   * 完成盘点
   * 根据差异调整库存
   */
  async complete(id: string): Promise<InventoryCheck> {
    const check = await this.findOne(id);

    if (check.status === InventoryCheckStatus.已完成) {
      throw new BadRequestException('盘点单已经完成');
    }

    // 检查是否所有明细都已录入实盘数量
    const uninformedItems = check.items.filter(item => Number(item.actualQuantity) === 0);
    if (uninformedItems.length > 0) {
      throw new BadRequestException(`还有 ${uninformedItems.length} 个批次未录入实盘数量`);
    }

    // 开启事务，调整库存
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of check.items) {
        if (Number(item.differenceQuantity) !== 0) {
          // 获取批次
          const batch = await this.batchRepository.findOne({ where: { id: item.batchId } });
          if (batch) {
            // 调整库存：账面数量 -> 实际数量
            batch.quantity = Number(item.actualQuantity);
            await queryRunner.manager.save(batch);

            // 更新差异金额（假设单价为1）
            item.differenceAmount = Math.abs(Number(item.differenceQuantity));
          }
        }
      }

      // 更新盘点单状态
      check.status = InventoryCheckStatus.已完成;
      check.completedAt = new Date();
      await queryRunner.manager.save(check);

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 删除盘点单（仅允许删除待盘点的单据）
   */
  async remove(id: string): Promise<void> {
    const check = await this.findOne(id);

    if (check.status !== InventoryCheckStatus.待盘点) {
      throw new BadRequestException('只有待盘点的盘点单允许删除');
    }

    // 删除明细
    await this.checkItemRepository.delete({ inventoryCheckId: id });

    // 删除盘点单
    await this.checkRepository.delete(id);
  }

  /**
   * 生成盘点报告
   */
  async generateReport(id: string): Promise<InventoryCheckReport> {
    const check = await this.findOne(id);

    // 获取仓库信息
    const warehouse = await this.warehouseRepository.findOne({ where: { id: check.warehouseId } });

    // 计算汇总数据
    let totalBookQuantity = 0;
    let totalActualQuantity = 0;
    let totalDifferenceQuantity = 0;
    let totalDifferenceAmount = 0;

    for (const item of check.items) {
      totalBookQuantity += Number(item.bookQuantity);
      totalActualQuantity += Number(item.actualQuantity);
      totalDifferenceQuantity += Number(item.differenceQuantity);
      totalDifferenceAmount += Number(item.differenceAmount);
    }

    const itemCount = check.items.length;
    const qualifiedCount = check.items.filter(i => Number(i.differenceQuantity) === 0).length;
    const qualifiedRate = itemCount > 0 ? (qualifiedCount / itemCount) * 100 : 0;

    // 构建报告数据
    const report: InventoryCheckReport = {
      checkId: check.id,
      checkNo: check.checkNo,
      checkDate: check.checkDate,
      warehouseName: warehouse?.name || '',
      checkType: check.checkType,
      status: check.status,
      manager: check.manager || '',
      completedAt: check.completedAt || new Date(),
      summary: {
        totalBookQuantity,
        totalActualQuantity,
        totalDifferenceQuantity,
        totalDifferenceAmount,
        itemCount,
        qualifiedRate,
      },
      items: check.items.map(item => ({
        batchNo: item.batchId || '',
        productName: '',
        colorName: item.colorVariantId || '',
        unit: '米',
        bookQuantity: Number(item.bookQuantity),
        actualQuantity: Number(item.actualQuantity),
        differenceQuantity: Number(item.differenceQuantity),
        differenceAmount: Number(item.differenceAmount),
      })),
    };

    return report;
  }

  /**
   * 获取盘点报告详情
   */
  async getReport(id: string): Promise<InventoryCheckReport> {
    const check = await this.findOne(id);

    if (check.status !== InventoryCheckStatus.已完成) {
      throw new BadRequestException('只有已完成的盘点单才能生成报告');
    }

    return this.generateReport(id);
  }
}

/**
 * 盘点报告DTO
 */
export interface InventoryCheckReport {
  checkId: string;
  checkNo: string;
  checkDate: Date;
  warehouseName: string;
  checkType: InventoryCheckType;
  status: InventoryCheckStatus;
  manager: string;
  completedAt: Date;
  summary: {
    totalBookQuantity: number;
    totalActualQuantity: number;
    totalDifferenceQuantity: number;
    totalDifferenceAmount: number;
    itemCount: number;
    qualifiedRate: number;
  };
  items: {
    batchNo: string;
    productName: string;
    colorName: string;
    unit: string;
    bookQuantity: number;
    actualQuantity: number;
    differenceQuantity: number;
    differenceAmount: number;
  }[];
}
