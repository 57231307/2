import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ProductionReceipt } from '../entities/production-receipt.entity';
import { ProductionReceiptItem } from '../entities/production-receipt-item.entity';
import { InventoryBatch } from '../../inventory/entities/inventory-batch.entity';
import { BatchSourceType } from '../../inventory/enums/batch-source-type.enum';
import { BatchStatus } from '../../inventory/enums/batch-status.enum';
import { ProductionReceiptStatus } from '../enums/production-receipt-status.enum';
import { CreateProductionReceiptDto, GenerateBatchDto, ConfirmReceiptDto, QueryProductionReceiptDto } from '../dto/production-receipt.dto';
import { CodeGenerator } from '../../../common/utils';

/**
 * 生产入库服务
 * 负责生产入库单的增删改查及批次生成
 */
@Injectable()
export class ProductionReceiptService {
  constructor(
    @InjectRepository(ProductionReceipt)
    private readonly receiptRepository: Repository<ProductionReceipt>,
    @InjectRepository(ProductionReceiptItem)
    private readonly receiptItemRepository: Repository<ProductionReceiptItem>,
    @InjectRepository(InventoryBatch)
    private readonly batchRepository: Repository<InventoryBatch>,
  ) {}

  /**
   * 创建生产入库单
   */
  async createReceipt(dto: CreateProductionReceiptDto, userId?: string): Promise<ProductionReceipt> {
    const receiptNo = await CodeGenerator.generateOrderNo('RK');

    const receipt = this.receiptRepository.create({
      receiptNo,
      productionOrderId: dto.productionOrderId,
      receiptDate: dto.receiptDate,
      warehouseId: dto.warehouseId,
      receiverName: dto.receiverName,
      remark: dto.remark,
      status: ProductionReceiptStatus.PENDING,
      createdBy: userId,
    });

    const savedReceipt = await this.receiptRepository.save(receipt);

    // 保存入库明细
    if (dto.items && dto.items.length > 0) {
      const items = dto.items.map((item) =>
        this.receiptItemRepository.create({
          ...item,
          receiptId: savedReceipt.id,
          unit: item.unit || 'meter',
          createdBy: userId,
        }),
      );
      await this.receiptItemRepository.save(items);
    }

    return this.findOne(savedReceipt.id);
  }

  /**
   * 查询生产入库单列表
   */
  async findReceipts(query: QueryProductionReceiptDto): Promise<{ list: ProductionReceipt[]; total: number }> {
    const where: FindOptionsWhere<ProductionReceipt> = {};

    if (query.receiptNo) {
      where.receiptNo = query.receiptNo;
    }
    if (query.productionOrderId) {
      where.productionOrderId = query.productionOrderId;
    }
    if (query.warehouseId) {
      where.warehouseId = query.warehouseId;
    }
    if (query.status) {
      where.status = query.status;
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [list, total] = await this.receiptRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
      relations: ['items'],
    });

    return { list, total };
  }

  /**
   * 获取生产入库单详情
   */
  async findOne(id: string): Promise<ProductionReceipt> {
    const receipt = await this.receiptRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!receipt) {
      throw new NotFoundException(`生产入库单不存在: ${id}`);
    }

    return receipt;
  }

  /**
   * 生成缸号匹号 - 核心业务
   * 为每个入库明细生成新的批次号
   */
  async generateBatchForReceipt(id: string, dto: GenerateBatchDto, userId?: string): Promise<ProductionReceipt> {
    const receipt = await this.findOne(id);

    if (receipt.status !== ProductionReceiptStatus.PENDING) {
      throw new BadRequestException('只有待入库状态的单据才能生成批次');
    }

    // 生成缸号
    const batchNo = await CodeGenerator.generateBatchNo();

    // 为每个明细项生成匹号并创建批次
    for (let i = 0; i < dto.items.length; i++) {
      const itemDto = dto.items[i];
      const receiptItem = receipt.items.find((item) => !item.batchId);

      if (!receiptItem) {
        continue;
      }

      // 生成匹号
      const rollNo = await CodeGenerator.generateRollNo();

      // 创建新批次 - 完工入库生成新批次
      const batch = this.batchRepository.create({
        batchNo,
        rollNo: itemDto.rollNo || rollNo,
        productId: receipt.productionOrderId, // 需要关联到产品
        colorVariantId: undefined, // 从工单获取
        warehouseId: receipt.warehouseId,
        quantity: itemDto.qualifiedQuantity,
        unit: receiptItem.unit || 'meter',
        productionDate: receipt.receiptDate,
        sourceType: BatchSourceType.PRODUCTION,
        sourceId: receipt.id,
        sourceNo: receipt.receiptNo,
        status: BatchStatus.ACTIVE,
        createdBy: userId,
      });

      const savedBatch = await this.batchRepository.save(batch);

      // 更新入库明细的批次信息
      await this.receiptItemRepository.update(receiptItem.id, {
        batchId: savedBatch.id,
        batchNo,
        rollNo: savedBatch.rollNo,
        qualifiedQuantity: itemDto.qualifiedQuantity,
        updatedBy: userId,
      });
    }

    return this.findOne(id);
  }

  /**
   * 确认入库
   */
  async confirmReceipt(id: string, dto: ConfirmReceiptDto, userId?: string): Promise<ProductionReceipt> {
    const receipt = await this.findOne(id);

    if (receipt.status === ProductionReceiptStatus.QUALIFIED || receipt.status === ProductionReceiptStatus.REJECTED) {
      throw new BadRequestException('该单据已完成入库确认');
    }

    // 更新入库单状态
    await this.receiptRepository.update(id, {
      status: dto.status,
      qualityInspector: dto.qualityInspector,
      qualityCheckedAt: new Date(),
      receiverName: dto.receiverName,
      receivedAt: dto.status === ProductionReceiptStatus.QUALIFIED ? new Date() : undefined,
      updatedBy: userId,
    });

    // 如果是合格状态，更新批次状态为活跃
    if (dto.status === ProductionReceiptStatus.QUALIFIED) {
      for (const item of receipt.items) {
        if (item.batchId) {
          await this.batchRepository.update(item.batchId, {
            status: BatchStatus.ACTIVE,
            updatedBy: userId,
          });
        }
      }
    }

    return this.findOne(id);
  }

  /**
   * 取消入库单
   */
  async cancelReceipt(id: string, userId?: string): Promise<ProductionReceipt> {
    const receipt = await this.findOne(id);

    if (receipt.status === ProductionReceiptStatus.QUALIFIED) {
      throw new BadRequestException('已完成的入库单不能取消');
    }

    // 删除生成的批次
    for (const item of receipt.items) {
      if (item.batchId) {
        await this.batchRepository.delete(item.batchId);
      }
    }

    await this.receiptRepository.update(id, {
      status: ProductionReceiptStatus.PENDING,
      updatedBy: userId,
    });

    return this.findOne(id);
  }
}
