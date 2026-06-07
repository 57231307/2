import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ColorFormula } from '../entities/color-formula.entity';
import { ColorFormulaItem } from '../entities/color-formula-item.entity';
import { ColorDifference } from '../entities/color-difference.entity';
import { FormulaStatus, ColorDiffResult, ColorDiffStandard } from '../enums';
import { 
  CreateColorFormulaDto, 
  UpdateColorFormulaDto, 
  QueryColorFormulaDto,
  CreateColorDifferenceDto,
  CalculateColorFormulaDto,
  CheckColorDifferenceDto,
} from '../dto';

/**
 * 颜色配方服务
 * 提供颜色配方的CRUD操作和色差计算功能
 */
@Injectable()
export class ColorFormulaService {
  constructor(
    @InjectRepository(ColorFormula)
    private formulaRepository: Repository<ColorFormula>,
    @InjectRepository(ColorFormulaItem)
    private itemRepository: Repository<ColorFormulaItem>,
    @InjectRepository(ColorDifference)
    private differenceRepository: Repository<ColorDifference>,
  ) {}

  // ========== 配方基础操作 ==========

  /**
   * 创建颜色配方
   */
  async create(data: CreateColorFormulaDto): Promise<ColorFormula> {
    const code = data.code || await this.generateCode();
    
    const existing = await this.formulaRepository.findOne({ where: { code } });
    if (existing) {
      throw new ConflictException('配方编码已存在');
    }

    const formula = this.formulaRepository.create({
      ...data,
      code,
    });

    const savedFormula = await this.formulaRepository.save(formula);

    // 保存配方明细
    if (data.items && data.items.length > 0) {
      const items = data.items.map((item) =>
        this.itemRepository.create({
          ...item,
          formulaId: savedFormula.id,
        }),
      );
      await this.itemRepository.save(items);
    }

    return this.findOne(savedFormula.id);
  }

  /**
   * 分页查询配方列表
   */
  async findAll(
    query: QueryColorFormulaDto,
  ): Promise<{ data: ColorFormula[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = {};

    if (query.search) {
      where.name = Like(`%${query.search}%`);
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.applicableProductType) {
      where.applicableProductType = query.applicableProductType;
    }

    const [data, total] = await this.formulaRepository.findAndCount({
      where,
      relations: ['items'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * 获取配方详情
   */
  async findOne(id: string): Promise<ColorFormula> {
    const formula = await this.formulaRepository.findOne({
      where: { id },
      relations: ['items', 'colorVariant'],
    });
    if (!formula) {
      throw new NotFoundException('颜色配方不存在');
    }
    return formula;
  }

  /**
   * 更新配方
   */
  async update(id: string, data: UpdateColorFormulaDto): Promise<ColorFormula> {
    const formula = await this.findOne(id);

    if (data.name !== undefined) {
      formula.name = data.name;
    }
    if (data.version !== undefined) {
      formula.version = data.version;
    }
    if (data.labL !== undefined) {
      formula.labL = data.labL;
    }
    if (data.labA !== undefined) {
      formula.labA = data.labA;
    }
    if (data.labB !== undefined) {
      formula.labB = data.labB;
    }
    if (data.rgbColor !== undefined) {
      formula.rgbColor = data.rgbColor;
    }
    if (data.hexColor !== undefined) {
      formula.hexColor = data.hexColor;
    }
    if (data.status !== undefined) {
      formula.status = data.status;
    }
    if (data.totalWeight !== undefined) {
      formula.totalWeight = data.totalWeight;
    }
    if (data.referencePrice !== undefined) {
      formula.referencePrice = data.referencePrice;
    }
    if (data.applicableProductType !== undefined) {
      formula.applicableProductType = data.applicableProductType;
    }
    if (data.description !== undefined) {
      formula.description = data.description;
    }
    if (data.images !== undefined) {
      formula.images = data.images;
    }
    if (data.attachments !== undefined) {
      formula.attachments = data.attachments;
    }
    if (data.remark !== undefined) {
      formula.remark = data.remark;
    }
    if (data.effectiveDate !== undefined) {
      formula.effectiveDate = data.effectiveDate;
    }
    if (data.expiryDate !== undefined) {
      formula.expiryDate = data.expiryDate;
    }

    return this.formulaRepository.save(formula);
  }

  /**
   * 删除配方（软删除 - 设置为停用状态）
   */
  async remove(id: string): Promise<void> {
    const formula = await this.findOne(id);
    formula.status = FormulaStatus.DISABLED;
    await this.formulaRepository.save(formula);
  }

  /**
   * 生成配方编码
   * 格式：CF + 日期(YYYYMMDD) + 序号(4位)
   */
  private async generateCode(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `CF${dateStr}`;

    const count = await this.formulaRepository.count({
      where: { code: Like(`${prefix}%`) },
    });

    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}${seq}`;
  }

  // ========== 配方明细操作 ==========

  /**
   * 添加配方明细
   */
  async addItem(formulaId: string, data: any): Promise<ColorFormulaItem> {
    await this.findOne(formulaId);

    const item = this.itemRepository.create({
      ...data,
      formulaId,
    } as ColorFormulaItem);

    return this.itemRepository.save(item) as Promise<ColorFormulaItem>;
  }

  /**
   * 更新配方明细
   */
  async updateItem(itemId: string, data: any): Promise<ColorFormulaItem> {
    const item = await this.itemRepository.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException('配方明细不存在');
    }

    Object.assign(item, data);
    return this.itemRepository.save(item);
  }

  /**
   * 删除配方明细
   */
  async removeItem(itemId: string): Promise<void> {
    const item = await this.itemRepository.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException('配方明细不存在');
    }
    await this.itemRepository.remove(item);
  }

  /**
   * 计算配方比例（根据目标颜色LAB值）
   * 这里使用简化的线性计算，实际生产中需要更复杂的算法
   */
  async calculate(formulaId: string, targetLab: { l: number; a: number; b: number }): Promise<{
    currentLab: { l: number; a: number; b: number };
    targetLab: { l: number; a: number; b: number };
    deltaE: number;
    suggestedAdjustments: Array<{ materialId: string; materialName: string; adjustment: number }>;
  }> {
    const formula = await this.findOne(formulaId);

    // 计算当前配方的LAB值（这里简化处理，实际需要根据原料的遮盖力计算）
    const currentLab = {
      l: Number(formula.labL),
      a: Number(formula.labA),
      b: Number(formula.labB),
    };

    // 计算色差
    const deltaE = this.calculateDeltaE(currentLab, targetLab);

    // 生成调整建议（简化版本）
    const suggestedAdjustments = formula.items?.map((item) => ({
      materialId: item.materialId,
      materialName: item.materialName,
      adjustment: (targetLab.l - currentLab.l) * item.percentage * 0.01,
    })) || [];

    return {
      currentLab,
      targetLab,
      deltaE,
      suggestedAdjustments,
    };
  }

  // ========== 色差检测操作 ==========

  /**
   * 记录色差检测
   */
  async createDifference(data: CreateColorDifferenceDto): Promise<ColorDifference> {
    const formula = await this.findOne(data.formulaId);

    // 计算色差
    const standardLab = {
      l: data.standardLabL,
      a: data.standardLabA,
      b: data.standardLabB,
    };

    const sampleLab = {
      l: data.sampleLabL,
      a: data.sampleLabA,
      b: data.sampleLabB,
    };

    const deltaE = this.calculateDeltaE(sampleLab, standardLab);
    const result = this.evaluateDeltaE(deltaE);
    const diffStandard = this.getDiffStandard(deltaE);

    const difference = this.differenceRepository.create({
      ...data,
      deltaE,
      result,
      diffStandard,
      inspectedAt: new Date(),
    });

    return this.differenceRepository.save(difference);
  }

  /**
   * 检查色差（快速检测，不保存记录）
   */
  async checkDifference(data: CheckColorDifferenceDto): Promise<{
    deltaE: number;
    result: ColorDiffResult;
    standard: ColorDiffStandard;
  }> {
    const standardLab = {
      l: data.standardLabL,
      a: data.standardLabA,
      b: data.standardLabB,
    };

    const sampleLab = {
      l: data.sampleLabL,
      a: data.sampleLabA,
      b: data.sampleLabB,
    };

    const deltaE = this.calculateDeltaE(sampleLab, standardLab);
    const result = this.evaluateDeltaE(deltaE);
    const standard = this.getDiffStandard(deltaE);

    return { deltaE, result, standard };
  }

  /**
   * 获取配方的色差检测历史
   */
  async getDifferenceHistory(formulaId: string): Promise<ColorDifference[]> {
    await this.findOne(formulaId);

    return this.differenceRepository.find({
      where: { formulaId },
      order: { inspectedAt: 'DESC' },
    });
  }

  /**
   * 计算CIE76色差
   * ΔE = sqrt((L1-L2)² + (a1-a2)² + (b1-b2)²)
   */
  private calculateDeltaE(
    lab1: { l: number; a: number; b: number },
    lab2: { l: number; a: number; b: number },
  ): number {
    const dL = lab1.l - lab2.l;
    const da = lab1.a - lab2.a;
    const db = lab1.b - lab2.b;
    return Math.sqrt(dL * dL + da * da + db * db);
  }

  /**
   * 评估色差结果
   */
  private evaluateDeltaE(deltaE: number): ColorDiffResult {
    if (deltaE <= 1.0) {
      return ColorDiffResult.PASS;
    } else if (deltaE <= 3.0) {
      return ColorDiffResult.WARNING;
    } else {
      return ColorDiffResult.FAIL;
    }
  }

  /**
   * 获取色差等级
   */
  private getDiffStandard(deltaE: number): ColorDiffStandard {
    if (deltaE <= 0.5) {
      return ColorDiffStandard.PERFECT;
    } else if (deltaE <= 1.0) {
      return ColorDiffStandard.EXCELLENT;
    } else if (deltaE <= 2.0) {
      return ColorDiffStandard.GOOD;
    } else if (deltaE <= 3.0) {
      return ColorDiffStandard.ACCEPTABLE;
    } else {
      return ColorDiffStandard.POOR;
    }
  }

  /**
   * 创建配方版本
   */
  async createVersion(id: string, newVersion: string): Promise<ColorFormula> {
    const original = await this.findOne(id);

    const newFormula = this.formulaRepository.create({
      ...original,
      id: undefined,
      code: await this.generateCode(),
      version: newVersion,
      parentId: original.id,
      status: FormulaStatus.DRAFT,
      items: original.items?.map((item) => ({
        ...item,
        id: undefined,
        formulaId: undefined,
      })),
    });

    return this.formulaRepository.save(newFormula);
  }
}