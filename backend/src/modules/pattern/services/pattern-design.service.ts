import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { format } from 'date-fns';
import { PatternDesign, PatternDesignStatus } from '../entities/pattern-design.entity';
import { Pattern } from '../entities/pattern.entity';
import { CreatePatternDesignDto, UpdatePatternDesignDto, QueryPatternDesignDto, RejectPatternDesignDto } from '../dto/pattern-design.dto';

/**
 * 花型设计服务
 * 提供花型设计的CRUD和审批功能
 */
@Injectable()
export class PatternDesignService {
  constructor(
    @InjectRepository(PatternDesign)
    private designRepository: Repository<PatternDesign>,
    @InjectRepository(Pattern)
    private patternRepository: Repository<Pattern>,
  ) {}

  /**
   * 生成设计编号
   * 格式：SJ-YYYYMMDD-XXXX
   */
  private async generateDesignNo(): Promise<string> {
    const today = new Date();
    const dateStr = format(today, 'yyyyMMdd');
    const prefix = `SJ${dateStr}`;

    // 查询当日最大序号
    const maxDesign = await this.designRepository
      .createQueryBuilder('design')
      .where('design.design_no LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('design.design_no', 'DESC')
      .select(['design.design_no'])
      .getOne();

    let nextNumber = 1;
    if (maxDesign) {
      const lastNo = maxDesign.designNo.slice(-4);
      nextNumber = parseInt(lastNo, 10) + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  /**
   * 创建设计记录
   */
  async create(dto: CreatePatternDesignDto): Promise<PatternDesign> {
    // 如果提供了花型ID，校验花型是否存在
    if (dto.patternId) {
      const pattern = await this.patternRepository.findOne({ where: { id: dto.patternId } });
      if (!pattern) {
        throw new NotFoundException('花型不存在');
      }
    }

    // 生成设计编号
    const designNo = await this.generateDesignNo();

    // 创建设计记录
    const design = this.designRepository.create({
      designNo,
      patternId: dto.patternId || null,
      patternName: dto.patternName || null,
      patternCode: dto.patternCode || null,
      designName: dto.designName,
      designVersion: dto.designVersion || '1.0',
      status: PatternDesignStatus.DRAFT,
      designer: dto.designer,
      designDate: new Date(dto.designDate),
      description: dto.description,
      designImages: dto.designImages || [],
      colorScheme: dto.colorScheme,
      designFileUrl: dto.designFileUrl,
      remark: dto.remark,
    });

    return this.designRepository.save(design);
  }

  /**
   * 查询设计列表
   */
  async findAll(
    query: QueryPatternDesignDto,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: PatternDesign[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.designRepository
      .createQueryBuilder('design')
      .orderBy('design.created_at', 'DESC');

    if (query.keyword) {
      queryBuilder.andWhere(
        '(design.design_no LIKE :keyword OR design.design_name LIKE :keyword OR design.pattern_name LIKE :keyword)',
        { keyword: `%${query.keyword}%` },
      );
    }

    if (query.patternId) {
      queryBuilder.andWhere('design.pattern_id = :patternId', { patternId: query.patternId });
    }

    if (query.designer) {
      queryBuilder.andWhere('design.designer LIKE :designer', { designer: `%${query.designer}%` });
    }

    if (query.status) {
      queryBuilder.andWhere('design.status = :status', { status: query.status });
    }

    if (query.designDateFrom) {
      queryBuilder.andWhere('design.design_date >= :designDateFrom', { designDateFrom: query.designDateFrom });
    }

    if (query.designDateTo) {
      queryBuilder.andWhere('design.design_date <= :designDateTo', { designDateTo: query.designDateTo });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * 获取设计详情
   */
  async findOne(id: string): Promise<PatternDesign> {
    const design = await this.designRepository.findOne({
      where: { id },
    });

    if (!design) {
      throw new NotFoundException('花型设计不存在');
    }

    return design;
  }

  /**
   * 更新设计
   */
  async update(id: string, dto: UpdatePatternDesignDto): Promise<PatternDesign> {
    const design = await this.findOne(id);

    // 仅允许更新草稿状态的设计
    if (design.status !== PatternDesignStatus.DRAFT) {
      throw new BadRequestException('仅允许更新草稿状态的设计');
    }

    // 更新花型信息
    if (dto.patternId) {
      const pattern = await this.patternRepository.findOne({ where: { id: dto.patternId } });
      if (!pattern) {
        throw new NotFoundException('花型不存在');
      }
      design.patternId = dto.patternId;
      design.patternName = pattern.name;
      design.patternCode = pattern.code;
    }

    // 更新设计信息
    if (dto.designName !== undefined) {
      design.designName = dto.designName;
    }
    if (dto.designVersion !== undefined) {
      design.designVersion = dto.designVersion;
    }
    if (dto.designer !== undefined) {
      design.designer = dto.designer;
    }
    if (dto.designDate !== undefined) {
      design.designDate = new Date(dto.designDate);
    }
    if (dto.description !== undefined) {
      design.description = dto.description;
    }
    if (dto.designImages !== undefined) {
      design.designImages = dto.designImages;
    }
    if (dto.colorScheme !== undefined) {
      design.colorScheme = dto.colorScheme;
    }
    if (dto.designFileUrl !== undefined) {
      design.designFileUrl = dto.designFileUrl;
    }
    if (dto.remark !== undefined) {
      design.remark = dto.remark;
    }

    return this.designRepository.save(design);
  }

  /**
   * 提交审核
   * 将设计状态从草稿改为待审核
   */
  async submitForReview(id: string): Promise<PatternDesign> {
    const design = await this.findOne(id);

    if (design.status !== PatternDesignStatus.DRAFT) {
      throw new BadRequestException('仅允许提交草稿状态的设计');
    }

    design.status = PatternDesignStatus.PENDING_REVIEW;

    return this.designRepository.save(design);
  }

  /**
   * 审核通过
   */
  async approve(id: string, auditor: string, remark?: string): Promise<PatternDesign> {
    const design = await this.findOne(id);

    if (design.status !== PatternDesignStatus.PENDING_REVIEW) {
      throw new BadRequestException('仅允许审核待审核状态的设计');
    }

    design.status = PatternDesignStatus.APPROVED;
    design.auditor = auditor;
    design.auditTime = new Date();
    design.auditRemark = remark;

    return this.designRepository.save(design);
  }

  /**
   * 审核驳回
   */
  async reject(id: string, auditor: string, dto: RejectPatternDesignDto): Promise<PatternDesign> {
    const design = await this.findOne(id);

    if (design.status !== PatternDesignStatus.PENDING_REVIEW) {
      throw new BadRequestException('仅允许驳回待审核状态的设计');
    }

    design.status = PatternDesignStatus.DRAFT;
    design.auditor = auditor;
    design.auditTime = new Date();
    design.auditRemark = dto.reason;

    return this.designRepository.save(design);
  }

  /**
   * 归档
   */
  async archive(id: string): Promise<PatternDesign> {
    const design = await this.findOne(id);

    if (design.status !== PatternDesignStatus.APPROVED) {
      throw new BadRequestException('仅允许归档已审核的设计');
    }

    design.status = PatternDesignStatus.ARCHIVED;

    return this.designRepository.save(design);
  }
}
