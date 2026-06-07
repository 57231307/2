import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { format } from 'date-fns';
import { ColorMatchingResult } from '../entities/color-matching-result.entity';
import { ColorFormula } from '../entities/color-formula.entity';
import { Customer } from '../../base-data/entities/customer.entity';

/**
 * 创建配色结果DTO
 */
export interface CreateColorMatchingResultDto {
  formulaId: string;
  customerId: string;
  matchingDate: string;
  matchingPerson: string;
  targetColor: string;
  actualColor: string;
  colorDifference: number;
  isQualified: boolean;
  adjustmentRecord?: string;
  remark?: string;
}

/**
 * 更新配色结果DTO
 */
export interface UpdateColorMatchingResultDto {
  matchingDate?: string;
  matchingPerson?: string;
  targetColor?: string;
  actualColor?: string;
  colorDifference?: number;
  isQualified?: boolean;
  adjustmentRecord?: string;
  remark?: string;
}

/**
 * 配色结果查询DTO
 */
export interface QueryColorMatchingResultDto {
  formulaId?: string;
  customerId?: string;
  isQualified?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * 配色结果服务
 * 提供配色结果的CRUD操作
 */
@Injectable()
export class ColorMatchingResultService {
  constructor(
    @InjectRepository(ColorMatchingResult)
    private resultRepository: Repository<ColorMatchingResult>,
    @InjectRepository(ColorFormula)
    private formulaRepository: Repository<ColorFormula>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  /**
   * 生成记录编号
   * 规则：CMR-YYYYMMDD-XXX
   */
  private async generateResultNo(): Promise<string> {
    const today = new Date();
    const dateStr = format(today, 'yyyyMMdd');
    const prefix = `CMR${dateStr}`;

    const maxResult = await this.resultRepository
      .createQueryBuilder('result')
      .where('result.result_no LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('result.result_no', 'DESC')
      .select(['result.result_no'])
      .getOne();

    let nextNumber = 1;
    if (maxResult) {
      const lastNo = maxResult.resultNo.slice(-3);
      nextNumber = parseInt(lastNo, 10) + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * 创建配色结果记录
   */
  async create(data: CreateColorMatchingResultDto): Promise<ColorMatchingResult> {
    // 验证配方存在
    const formula = await this.formulaRepository.findOne({ where: { id: data.formulaId } });
    if (!formula) {
      throw new NotFoundException('配色配方不存在');
    }

    // 验证客户存在
    const customer = await this.customerRepository.findOne({ where: { id: data.customerId } });
    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    // 生成记录编号
    const resultNo = await this.generateResultNo();

    // 创建记录
    const result = this.resultRepository.create({
      resultNo,
      formulaId: data.formulaId,
      customerId: data.customerId,
      matchingDate: new Date(data.matchingDate),
      matchingPerson: data.matchingPerson,
      targetColor: data.targetColor,
      actualColor: data.actualColor,
      colorDifference: data.colorDifference,
      isQualified: data.isQualified,
      adjustmentRecord: data.adjustmentRecord,
      remark: data.remark,
    });

    return this.resultRepository.save(result);
  }

  /**
   * 查询配色结果列表
   */
  async findAll(
    query: QueryColorMatchingResultDto,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: ColorMatchingResult[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.resultRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.formula', 'formula')
      .leftJoinAndSelect('result.customer', 'customer')
      .where('1=1');

    if (query.formulaId) {
      queryBuilder.andWhere('result.formula_id = :formulaId', { formulaId: query.formulaId });
    }
    if (query.customerId) {
      queryBuilder.andWhere('result.customer_id = :customerId', { customerId: query.customerId });
    }
    if (query.isQualified !== undefined) {
      queryBuilder.andWhere('result.is_qualified = :isQualified', { isQualified: query.isQualified });
    }
    if (query.startDate) {
      queryBuilder.andWhere('result.matching_date >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      queryBuilder.andWhere('result.matching_date <= :endDate', { endDate: query.endDate });
    }
    if (query.search) {
      queryBuilder.andWhere('result.result_no LIKE :search', { search: `%${query.search}%` });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('result.created_at', 'DESC')
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * 获取配色结果详情
   */
  async findOne(id: string): Promise<ColorMatchingResult> {
    const result = await this.resultRepository.findOne({
      where: { id },
      relations: ['formula', 'customer'],
    });
    if (!result) {
      throw new NotFoundException('配色结果不存在');
    }
    return result;
  }

  /**
   * 更新配色结果
   */
  async update(id: string, data: UpdateColorMatchingResultDto): Promise<ColorMatchingResult> {
    const result = await this.findOne(id);

    if (data.matchingDate) {
      result.matchingDate = new Date(data.matchingDate);
    }
    if (data.matchingPerson !== undefined) {
      result.matchingPerson = data.matchingPerson;
    }
    if (data.targetColor !== undefined) {
      result.targetColor = data.targetColor;
    }
    if (data.actualColor !== undefined) {
      result.actualColor = data.actualColor;
    }
    if (data.colorDifference !== undefined) {
      result.colorDifference = data.colorDifference;
      // 自动判断是否合格
      result.isQualified = data.colorDifference <= 1.0;
    }
    if (data.isQualified !== undefined) {
      result.isQualified = data.isQualified;
    }
    if (data.adjustmentRecord !== undefined) {
      result.adjustmentRecord = data.adjustmentRecord;
    }
    if (data.remark !== undefined) {
      result.remark = data.remark;
    }

    return this.resultRepository.save(result);
  }

  /**
   * 删除配色结果
   */
  async remove(id: string): Promise<void> {
    const result = await this.findOne(id);
    await this.resultRepository.delete(id);
  }

  /**
   * 获取配色合格率统计
   */
  async getQualificationRate(
    startDate?: string,
    endDate?: string,
  ): Promise<{ total: number; qualified: number; unqualified: number; rate: number }> {
    const queryBuilder = this.resultRepository.createQueryBuilder('result').where('1=1');

    if (startDate) {
      queryBuilder.andWhere('result.matching_date >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('result.matching_date <= :endDate', { endDate });
    }

    const total = await queryBuilder.getCount();
    const qualified = await queryBuilder.clone().andWhere('result.is_qualified = :isQualified', { isQualified: true }).getCount();
    const unqualified = total - qualified;
    const rate = total > 0 ? (qualified / total) * 100 : 0;

    return { total, qualified, unqualified, rate };
  }
}
