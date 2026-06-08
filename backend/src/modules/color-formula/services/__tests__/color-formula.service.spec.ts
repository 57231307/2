import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Repository, Like } from 'typeorm';
import { ColorFormulaService } from '../color-formula.service';
import { ColorFormula } from '../../entities/color-formula.entity';
import { ColorFormulaItem } from '../../entities/color-formula-item.entity';
import { ColorDifference } from '../../entities/color-difference.entity';
import { FormulaStatus, ColorDiffResult, ColorDiffStandard } from '../../enums';

/**
 * 颜色配方服务单元测试
 * 测试颜色配方的CRUD操作和色差计算功能
 */
describe('ColorFormulaService', () => {
  let service: ColorFormulaService;
  let formulaRepository: any;
  let itemRepository: any;
  let differenceRepository: any;

  // 测试配方数据
  const mockFormula: any = {
    id: 'formula-id-1',
    code: 'CF202401010001',
    name: '红色标准配方',
    version: '1.0',
    labL: 45.5,
    labA: 70.2,
    labB: 25.3,
    status: FormulaStatus.ACTIVE,
    totalWeight: 1000.0,
    referencePrice: 25.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 测试配方明细
  const mockFormulaItem: any = {
    id: 'item-id-1',
    formulaId: 'formula-id-1',
    materialId: 'mat-1',
    materialName: '红色染料',
    percentage: 80.0,
    weight: 800.0,
  };

  // 测试色差记录
  const mockDifference: any = {
    id: 'diff-id-1',
    formulaId: 'formula-id-1',
    deltaE: 1.5,
    result: ColorDiffResult.WARNING,
    diffStandard: ColorDiffStandard.GOOD,
    inspectedAt: new Date(),
  };

  beforeEach(async () => {
    // 创建模拟Repository
    const mockFormulaRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
    };

    const mockItemRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const mockDifferenceRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColorFormulaService,
        {
          provide: getRepositoryToken(ColorFormula),
          useValue: mockFormulaRepository,
        },
        {
          provide: getRepositoryToken(ColorFormulaItem),
          useValue: mockItemRepository,
        },
        {
          provide: getRepositoryToken(ColorDifference),
          useValue: mockDifferenceRepository,
        },
      ],
    }).compile();

    service = module.get<ColorFormulaService>(ColorFormulaService);
    formulaRepository = module.get(getRepositoryToken(ColorFormula));
    itemRepository = module.get(getRepositoryToken(ColorFormulaItem));
    differenceRepository = module.get(getRepositoryToken(ColorDifference));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create - 创建配方', () => {
    /**
     * 测试正常创建配方
     * 验证：应成功创建配方和明细
     */
    it('应该成功创建配方和明细', async () => {
      const createData = {
        name: '测试红色配方',
        labL: 45.5,
        labA: 70.2,
        labB: 25.3,
        items: [{ materialId: 'mat-1', materialName: '红色染料', materialCode: 'RED-001', percentage: 80.0, weight: 800.0 }],
      };

      formulaRepository.findOne.mockResolvedValue(null);
      formulaRepository.create.mockReturnValue({ ...mockFormula, ...createData });
      formulaRepository.save.mockResolvedValue({ ...mockFormula, ...createData });
      itemRepository.create.mockImplementation((data: any) => data);
      itemRepository.save.mockResolvedValue({});
      formulaRepository.findOne.mockResolvedValue({
        ...mockFormula,
        ...createData,
        items: createData.items,
      });

      const result = await service.create(createData);

      expect(result).toHaveProperty('id');
      expect(formulaRepository.create).toHaveBeenCalled();
      expect(formulaRepository.save).toHaveBeenCalled();
      expect(itemRepository.create).toHaveBeenCalledTimes(1);
      expect(itemRepository.save).toHaveBeenCalled();
    });

    /**
     * 测试配方编码重复
     * 验证：编码已存在时应抛出 ConflictException
     */
    it('配方编码重复时应抛出异常', async () => {
      formulaRepository.findOne.mockResolvedValue(mockFormula);

      await expect(
        service.create({
          code: 'CF202401010001',
          name: '重复编码配方',
          labL: 45.5,
          labA: 70.2,
          labB: 25.3,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll - 查询配方列表', () => {
    /**
     * 测试分页查询配方
     * 验证：应返回分页数据
     */
    it('应该返回分页配方列表', async () => {
      const formulas = [mockFormula];
      formulaRepository.findAndCount.mockResolvedValue([formulas, 1]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    /**
     * 测试按名称搜索
     * 验证：应使用Like查询
     */
    it('应该支持按名称搜索', async () => {
      formulaRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ search: '红色' });

      expect(formulaRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: Like('%红色%'),
          }),
        }),
      );
    });
  });

  describe('findOne - 获取配方详情', () => {
    /**
     * 测试获取已存在的配方
     * 验证：应返回配方详情和明细
     */
    it('应该返回配方详情', async () => {
      formulaRepository.findOne.mockResolvedValue({
        ...mockFormula,
        items: [mockFormulaItem],
      });

      const result = await service.findOne('formula-id-1');

      expect(result.id).toBe('formula-id-1');
      expect(formulaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'formula-id-1' },
        relations: ['items', 'colorVariant'],
      });
    });

    /**
     * 测试获取不存在的配方
     * 验证：应抛出 NotFoundException
     */
    it('配方不存在时应抛出异常', async () => {
      formulaRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update - 更新配方', () => {
    /**
     * 测试正常更新配方
     * 验证：应更新配方信息并返回
     */
    it('应该成功更新配方', async () => {
      const updateData = { name: '更新后的红色配方' };
      formulaRepository.findOne.mockResolvedValue(mockFormula);
      formulaRepository.save.mockImplementation((formula: any) =>
        Promise.resolve({ ...formula, ...updateData }),
      );

      const result = await service.update('formula-id-1', updateData);

      expect(result.name).toBe('更新后的红色配方');
      expect(formulaRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove - 删除配方', () => {
    /**
     * 测试软删除配方（设置为停用状态）
     * 验证：应将配方状态设置为DISABLED
     */
    it('应该软删除配方（设置为停用状态）', async () => {
      formulaRepository.findOne.mockResolvedValue(mockFormula);
      formulaRepository.save.mockImplementation((formula: any) =>
        Promise.resolve(formula),
      );

      await service.remove('formula-id-1');

      expect(formulaRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: FormulaStatus.DISABLED }),
      );
    });
  });

  describe('配方明细操作', () => {
    /**
     * 测试添加配方明细
     */
    it('应该成功添加配方明细', async () => {
      formulaRepository.findOne.mockResolvedValue(mockFormula);
      itemRepository.create.mockReturnValue(mockFormulaItem);
      itemRepository.save.mockResolvedValue(mockFormulaItem);

      const result = await service.addItem('formula-id-1', {
        materialId: 'mat-1',
        materialName: '红色染料',
      });

      expect(result).toHaveProperty('id');
      expect(itemRepository.create).toHaveBeenCalled();
      expect(itemRepository.save).toHaveBeenCalled();
    });

    /**
     * 测试更新配方明细
     */
    it('应该成功更新配方明细', async () => {
      const updateData = { percentage: 85.0 };
      itemRepository.findOne.mockResolvedValue(mockFormulaItem);
      itemRepository.save.mockImplementation((item: any) =>
        Promise.resolve({ ...item, ...updateData }),
      );

      const result = await service.updateItem('item-id-1', updateData);

      expect(result.percentage).toBe(85.0);
    });

    /**
     * 测试删除配方明细
     */
    it('应该成功删除配方明细', async () => {
      itemRepository.findOne.mockResolvedValue(mockFormulaItem);
      itemRepository.remove.mockResolvedValue(mockFormulaItem);

      await service.removeItem('item-id-1');

      expect(itemRepository.remove).toHaveBeenCalledWith(mockFormulaItem);
    });
  });

  describe('calculate - 配方计算', () => {
    /**
     * 测试配方计算和调整建议
     * 验证：应返回当前LAB、目标LAB、DeltaE和调整建议
     */
    it('应该计算并返回调整建议', async () => {
      const formulaWithItems = {
        ...mockFormula,
        items: [
          { materialId: 'mat-1', materialName: '红色染料', percentage: 80.0 },
        ],
      };
      formulaRepository.findOne.mockResolvedValue(formulaWithItems);

      const result = await service.calculate('formula-id-1', {
        l: 50.0,
        a: 75.0,
        b: 30.0,
      });

      expect(result).toHaveProperty('deltaE');
      expect(result).toHaveProperty('currentLab');
      expect(result).toHaveProperty('targetLab');
      expect(result).toHaveProperty('suggestedAdjustments');
    });
  });

  describe('色差检测', () => {
    /**
     * 测试记录色差检测
     * 验证：应计算DeltaE并保存检测记录
     */
    it('应该成功记录色差检测', async () => {
      formulaRepository.findOne.mockResolvedValue(mockFormula);
      differenceRepository.create.mockReturnValue(mockDifference);
      differenceRepository.save.mockResolvedValue(mockDifference);

      const result = await service.createDifference({
        formulaId: 'formula-id-1',
        standardLabL: 45.5,
        standardLabA: 70.2,
        standardLabB: 25.3,
        sampleLabL: 46.0,
        sampleLabA: 71.0,
        sampleLabB: 26.0,
      });

      expect(result).toHaveProperty('deltaE');
      expect(differenceRepository.create).toHaveBeenCalled();
      expect(differenceRepository.save).toHaveBeenCalled();
    });

    /**
     * 测试快速色差检查（不保存记录）
     * 验证：应计算DeltaE并返回检查结果
     */
    it('应该快速检查色差（不保存记录）', async () => {
      const result = await service.checkDifference({
        standardLabL: 45.5,
        standardLabA: 70.2,
        standardLabB: 25.3,
        sampleLabL: 46.0,
        sampleLabA: 71.0,
        sampleLabB: 26.0,
      });

      expect(result).toHaveProperty('deltaE');
      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('standard');
    });

    /**
     * 测试获取色差历史
     */
    it('应该返回配方的色差检测历史', async () => {
      formulaRepository.findOne.mockResolvedValue(mockFormula);
      differenceRepository.find.mockResolvedValue([mockDifference]);

      const result = await service.getDifferenceHistory('formula-id-1');

      expect(result).toHaveLength(1);
      expect(differenceRepository.find).toHaveBeenCalledWith({
        where: { formulaId: 'formula-id-1' },
        order: { inspectedAt: 'DESC' },
      });
    });
  });

  describe('createVersion - 创建配方版本', () => {
    /**
     * 测试创建配方新版本
     * 验证：应复制原配方并生成新版本
     */
    it('应该成功创建配方新版本', async () => {
      const originalFormula = {
        ...mockFormula,
        items: [mockFormulaItem],
      };
      formulaRepository.findOne.mockResolvedValue(originalFormula);
      formulaRepository.create.mockImplementation((data: any) => data);
      formulaRepository.save.mockImplementation((data: any) =>
        Promise.resolve({ ...data, id: 'new-formula-id' }),
      );

      const result = await service.createVersion('formula-id-1', '2.0');

      expect(result.version).toBe('2.0');
      expect(result.status).toBe(FormulaStatus.DRAFT);
      expect(result).toHaveProperty('parentId');
      expect(formulaRepository.save).toHaveBeenCalled();
    });
  });

  describe('DeltaE计算', () => {
    /**
     * 测试DeltaE计算逻辑（通过checkDifference验证）
     */
    it('应该正确计算DeltaE', async () => {
      const result = await service.checkDifference({
        standardLabL: 50,
        standardLabA: 50,
        standardLabB: 50,
        sampleLabL: 50,
        sampleLabA: 50,
        sampleLabB: 50,
      });

      // 完全相同应该返回0
      expect(result.deltaE).toBe(0);
      expect(result.result).toBe(ColorDiffResult.PASS);
      expect(result.standard).toBe(ColorDiffStandard.PERFECT);
    });

    it('应该在DeltaE为1.0时返回PASS', async () => {
      const result = await service.checkDifference({
        standardLabL: 50,
        standardLabA: 50,
        standardLabB: 50,
        sampleLabL: 50.80,
        sampleLabA: 50.40,
        sampleLabB: 50.44,
      });

      // 计算：sqrt(0.8² + 0.4² + 0.44²) ≈ 1.0
      expect(result.result).toBe(ColorDiffResult.PASS);
    });

    it('应该在DeltaE为2.5时返回WARNING', async () => {
      const result = await service.checkDifference({
        standardLabL: 50,
        standardLabA: 50,
        standardLabB: 50,
        sampleLabL: 48.5,
        sampleLabA: 51.5,
        sampleLabB: 51.5,
      });

      expect(result.result).toBe(ColorDiffResult.WARNING);
    });

    it('应该在DeltaE大于3.0时返回FAIL', async () => {
      const result = await service.checkDifference({
        standardLabL: 50,
        standardLabA: 50,
        standardLabB: 50,
        sampleLabL: 45,
        sampleLabA: 55,
        sampleLabB: 55,
      });

      expect(result.result).toBe(ColorDiffResult.FAIL);
    });
  });
});
