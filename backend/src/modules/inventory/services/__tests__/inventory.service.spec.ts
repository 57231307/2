import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Repository, Like, In } from 'typeorm';
import { format } from 'date-fns';
import { BatchService, WarehouseService } from '../inventory.service';
import { Warehouse, WarehouseStatus } from '../../entities/warehouse.entity';
import { InventoryBatch } from '../../entities/inventory-batch.entity';
import { BatchSourceType } from '../../enums/batch-source-type.enum';
import { BatchStatus } from '../../enums/batch-status.enum';
import { QualityStatus } from '../../enums/quality-status.enum';

/**
 * 库存服务单元测试
 * 测试批次创建、缸号匹号唯一性验证
 */
describe('BatchService', () => {
  let service: BatchService;
  let batchRepository: any;
  let warehouseRepository: any;

  // 测试批次数据
  const mockBatch: any = {
    id: 'batch-id-1',
    batchNo: 'GD20240101001',
    rollNo: 'P001',
    productId: 'product-id-1',
    colorVariantId: 'variant-id-1',
    warehouseId: 'warehouse-id-1',
    locationCode: 'A01-01-01',
    quantity: 100,
    unit: 'meter',
    status: BatchStatus.ACTIVE,
    qualityStatus: QualityStatus.PASSED,
    sourceType: BatchSourceType.PRODUCTION,
    productionDate: new Date('2024-01-01'),
    gramWeight: 120,
    width: 150,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 测试仓库数据
  const mockWarehouse: any = {
    id: 'warehouse-id-1',
    code: 'WH001',
    name: '主仓库',
    type: 'FABRIC' as any,
    status: WarehouseStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // 创建模拟批次仓库
    const mockBatchRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    // 创建模拟仓库仓库
    const mockWarehouseRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    // 模拟QueryBuilder
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getManyAndCount: jest.fn(),
      leftJoin: jest.fn().mockReturnThis(),
    };
    mockBatchRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchService,
        {
          provide: getRepositoryToken(InventoryBatch),
          useValue: mockBatchRepository,
        },
        {
          provide: getRepositoryToken(Warehouse),
          useValue: mockWarehouseRepository,
        },
      ],
    }).compile();

    service = module.get<BatchService>(BatchService);
    batchRepository = module.get(getRepositoryToken(InventoryBatch));
    warehouseRepository = module.get(getRepositoryToken(Warehouse));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBatch - 创建批次', () => {
    /**
     * 测试正常创建批次
     * 验证：匹号唯一时应成功创建
     */
    it('应该成功创建批次', async () => {
      const createData = {
        batchNo: 'GD20240101001',
        rollNo: 'P002',
        productId: 'product-id-1',
        colorVariantId: 'variant-id-1',
        warehouseId: 'warehouse-id-1',
        quantity: 50,
        unit: 'meter',
        sourceType: BatchSourceType.PRODUCTION,
      };

      batchRepository.findOne.mockResolvedValue(null); // 验证匹号唯一
      batchRepository.create.mockReturnValue({ ...mockBatch, ...createData });
      batchRepository.save.mockResolvedValue({
        ...mockBatch,
        ...createData,
        id: 'new-batch-id',
      });

      const result = await service.createBatch(createData);

      expect(result).toHaveProperty('id');
      expect(batchRepository.create).toHaveBeenCalled();
      expect(batchRepository.save).toHaveBeenCalled();
    });

    /**
     * 测试匹号重复
     * 验证：同一缸号内匹号重复时应抛出异常
     */
    it('匹号重复时应抛出异常', async () => {
      batchRepository.findOne.mockResolvedValue(mockBatch);

      await expect(
        service.createBatch({
          batchNo: 'GD20240101001',
          rollNo: 'P001',
          productId: 'product-id-1',
          colorVariantId: 'variant-id-1',
          warehouseId: 'warehouse-id-1',
          quantity: 50,
          sourceType: BatchSourceType.PRODUCTION,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('generateBatchNo - 生成缸号', () => {
    /**
     * 测试生成新缸号
     * 验证：应返回正确格式的缸号
     */
    it('应该生成正确格式的缸号', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      batchRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.generateBatchNo('product-id-1', 'variant-id-1');

      // 验证格式：GD + 日期 + 001
      expect(result).toMatch(/^GD\d{8}001$/);
    });

    /**
     * 测试生成递增缸号
     * 验证：已有批次时应递增序号
     */
    it('已有批次时应递增序号', async () => {
      const today = new Date();
      const dateStr = format(today, 'yyyyMMdd');
      const lastBatchNo = `GD${dateStr}005`;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ batchNo: lastBatchNo }),
      };
      batchRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.generateBatchNo('product-id-1');

      expect(result).toBe(`GD${dateStr}006`);
    });
  });

  describe('generateRollNo - 生成匹号', () => {
    /**
     * 测试生成新匹号
     * 验证：缸号内无匹号时应返回P001
     */
    it('缸号内无匹号时应返回P001', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      batchRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.generateRollNo('GD20240101001');

      expect(result).toBe('P001');
    });

    /**
     * 测试生成递增匹号
     * 验证：已有匹号时应递增
     */
    it('已有匹号时应递增', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ rollNo: 'P005' }),
      };
      batchRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.generateRollNo('GD20240101001');

      expect(result).toBe('P006');
    });
  });

  describe('validateRollNoUnique - 匹号唯一性验证', () => {
    /**
     * 测试匹号唯一
     * 验证：不存在的匹号应通过验证
     */
    it('不存在的匹号应通过验证', async () => {
      batchRepository.findOne.mockResolvedValue(null);

      await expect(
        service.validateRollNoUnique(
          'product-id-1',
          'variant-id-1',
          'GD20240101001',
          'P099',
        ),
      ).resolves.not.toThrow();
    });

    /**
     * 测试匹号重复
     * 验证：已存在的匹号应抛出异常
     */
    it('已存在的匹号应抛出异常', async () => {
      batchRepository.findOne.mockResolvedValue(mockBatch);

      await expect(
        service.validateRollNoUnique(
          'product-id-1',
          'variant-id-1',
          'GD20240101001',
          'P001',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findBatches - 查询批次列表', () => {
    /**
     * 测试分页查询批次
     * 验证：应返回分页数据
     */
    it('应该返回分页批次列表', async () => {
      const batches = [mockBatch];
      batchRepository.findAndCount.mockResolvedValue([batches, 1]);

      const result = await service.findBatches({}, 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    /**
     * 测试按产品筛选
     * 验证：应正确筛选产品
     */
    it('应该支持按产品筛选', async () => {
      batchRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findBatches({ productId: 'product-id-1' });

      expect(batchRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ productId: 'product-id-1' }),
        }),
      );
    });

    /**
     * 测试按颜色变体筛选
     * 验证：应正确筛选颜色变体
     */
    it('应该支持按颜色变体筛选', async () => {
      batchRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findBatches({ colorVariantId: 'variant-id-1' });

      expect(batchRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ colorVariantId: 'variant-id-1' }),
        }),
      );
    });

    /**
     * 测试按状态筛选
     * 验证：应正确筛选批次状态
     */
    it('应该支持按状态筛选', async () => {
      batchRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findBatches({ status: BatchStatus.ACTIVE });

      expect(batchRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: BatchStatus.ACTIVE }),
        }),
      );
    });
  });

  describe('findBatchById - 获取批次详情', () => {
    /**
     * 测试获取已存在批次
     * 验证：应返回批次详情
     */
    it('应该返回批次详情', async () => {
      batchRepository.findOne.mockResolvedValue(mockBatch);

      const result = await service.findBatchById('batch-id-1');

      expect(result.id).toBe('batch-id-1');
    });

    /**
     * 测试获取不存在批次
     * 验证：应抛出 NotFoundException
     */
    it('批次不存在时应抛出异常', async () => {
      batchRepository.findOne.mockResolvedValue(null);

      await expect(service.findBatchById('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deductBatch - 扣减批次库存', () => {
    /**
     * 测试正常扣减库存
     * 验证：库存充足时应成功扣减
     */
    it('应该成功扣减库存', async () => {
      batchRepository.findOne.mockResolvedValue({ ...mockBatch, quantity: 100 });
      batchRepository.save.mockImplementation((batch) => Promise.resolve(batch));

      const result = await service.deductBatch('batch-id-1', 30);

      expect(result.quantity).toBe(70);
    });

    /**
     * 测试库存不足
     * 验证：扣减量大于库存时应抛出异常
     */
    it('库存不足时应抛出异常', async () => {
      batchRepository.findOne.mockResolvedValue({ ...mockBatch, quantity: 10 });

      await expect(service.deductBatch('batch-id-1', 30)).rejects.toThrow(
        BadRequestException,
      );
    });

    /**
     * 测试批次状态不允许出库
     * 验证：非ACTIVE状态应抛出异常
     */
    it('批次状态不允许出库时应抛出异常', async () => {
      batchRepository.findOne.mockResolvedValue({
        ...mockBatch,
        status: BatchStatus.FROZEN,
      });

      await expect(service.deductBatch('batch-id-1', 10)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('addBatch - 增加批次库存', () => {
    /**
     * 测试增加库存
     * 验证：应正确增加库存数量
     */
    it('应该成功增加库存', async () => {
      batchRepository.findOne.mockResolvedValue({ ...mockBatch, quantity: 100 });
      batchRepository.save.mockImplementation((batch) => Promise.resolve(batch));

      const result = await service.addBatch('batch-id-1', 50);

      expect(result.quantity).toBe(150);
    });
  });

  describe('inbound - 执行入库', () => {
    /**
     * 测试正常入库流程
     * 验证：应创建批次并返回入库结果
     */
    it('应该成功执行入库', async () => {
      warehouseRepository.findOne.mockResolvedValue(mockWarehouse);

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      batchRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      batchRepository.findOne.mockResolvedValue(null); // 匹号验证
      batchRepository.create.mockImplementation((data) => data);
      batchRepository.save.mockImplementation((data) =>
        Promise.resolve({ ...data, id: `batch-${Math.random()}` }),
      );

      const result = await service.inbound({
        productId: 'product-id-1',
        colorVariantId: 'variant-id-1',
        warehouseId: 'warehouse-id-1',
        batchNo: 'GD20240101001',
        rolls: [
          { rollNo: 'P001', quantity: 100, locationCode: 'A01-01-01' },
          { rollNo: 'P002', quantity: 100, locationCode: 'A01-01-02' },
        ],
        sourceType: BatchSourceType.PRODUCTION,
      });

      expect(result.batchNo).toBe('GD20240101001');
      expect(result.batches).toHaveLength(2);
    });

    /**
     * 测试仓库不存在
     * 验证：应抛出 NotFoundException
     */
    it('仓库不存在时应抛出异常', async () => {
      warehouseRepository.findOne.mockResolvedValue(null);

      await expect(
        service.inbound({
          productId: 'product-id-1',
          warehouseId: 'nonexistent',
          rolls: [{ rollNo: 'P001', quantity: 100 }],
          sourceType: BatchSourceType.PRODUCTION,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    /**
     * 测试匹号重复时入库失败
     * 验证：匹号已存在时应抛出异常
     */
    it('匹号重复时应抛出异常', async () => {
      warehouseRepository.findOne.mockResolvedValue(mockWarehouse);

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      batchRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      batchRepository.findOne.mockResolvedValue(mockBatch); // 匹号已存在

      await expect(
        service.inbound({
          productId: 'product-id-1',
          colorVariantId: 'variant-id-1',
          warehouseId: 'warehouse-id-1',
          batchNo: 'GD20240101001',
          rolls: [{ rollNo: 'P001', quantity: 100 }],
          sourceType: BatchSourceType.PRODUCTION,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('outbound - 执行出库', () => {
    /**
     * 测试正常出库流程
     * 验证：应成功扣减库存
     */
    it('应该成功执行出库', async () => {
      batchRepository.findOne
        .mockResolvedValueOnce({ ...mockBatch, quantity: 100 }) // 第一次查询
        .mockResolvedValueOnce({ ...mockBatch, quantity: 100 }); // 循环中的查询
      batchRepository.save.mockImplementation((batch) => Promise.resolve(batch));

      const result = await service.outbound({
        productId: 'product-id-1',
        colorVariantId: 'variant-id-1',
        sourceType: 'TRANSFER',
        items: [{ batchId: 'batch-id-1', quantity: 30 }],
      });

      expect(result.successCount).toBe(1);
      expect(result.failedCount).toBe(0);
    });

    /**
     * 测试产品不匹配
     * 验证：产品ID不匹配时应失败
     */
    it('产品不匹配时应失败', async () => {
      batchRepository.findOne.mockResolvedValue({
        ...mockBatch,
        productId: 'different-product-id',
      });

      const result = await service.outbound({
        productId: 'product-id-1',
        sourceType: 'TRANSFER',
        items: [{ batchId: 'batch-id-1', quantity: 30 }],
      });

      expect(result.failedCount).toBe(1);
      expect(result.items[0].success).toBe(false);
    });

    /**
     * 测试库存不足
     * 验证：库存不足时应失败
     */
    it('库存不足时应失败', async () => {
      batchRepository.findOne.mockResolvedValue({
        ...mockBatch,
        quantity: 10,
      });

      const result = await service.outbound({
        productId: 'product-id-1',
        sourceType: 'TRANSFER',
        items: [{ batchId: 'batch-id-1', quantity: 30 }],
      });

      expect(result.failedCount).toBe(1);
      expect(result.items[0].success).toBe(false);
    });
  });

  describe('findByProduct - 按产品查询批次', () => {
    /**
     * 测试按产品查询批次
     * 验证：应返回该产品的所有批次
     */
    it('应该返回产品的批次列表', async () => {
      batchRepository.find.mockResolvedValue([mockBatch]);

      const result = await service.findByProduct('product-id-1');

      expect(result).toHaveLength(1);
      expect(batchRepository.find).toHaveBeenCalledWith({
        where: { productId: 'product-id-1', status: BatchStatus.ACTIVE },
        order: { batchNo: 'DESC', rollNo: 'ASC' },
      });
    });

    /**
     * 测试按产品和颜色查询
     * 验证：应正确筛选颜色变体
     */
    it('应该支持按颜色变体筛选', async () => {
      batchRepository.find.mockResolvedValue([]);

      await service.findByProduct('product-id-1', 'variant-id-1');

      expect(batchRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            productId: 'product-id-1',
            colorVariantId: 'variant-id-1',
            status: BatchStatus.ACTIVE,
          }),
        }),
      );
    });
  });

  describe('traceRollNo - 匹号追溯', () => {
    /**
     * 测试匹号追溯
     * 验证：应返回批次的完整信息
     */
    it('应该返回匹号追溯信息', async () => {
      batchRepository.findOne.mockResolvedValue(mockBatch);

      const result = await service.traceRollNo('batch-id-1');

      expect(result).toHaveProperty('batch');
      expect(result.batch.batchNo).toBe('GD20240101001');
      expect(result.batch.rollNo).toBe('P001');
      expect(result).toHaveProperty('sourceTrace');
      expect(result).toHaveProperty('destinationTrace');
    });
  });
});

/**
 * 仓库服务单元测试
 */
describe('WarehouseService', () => {
  let service: WarehouseService;
  let warehouseRepository: any;

  const mockWarehouse: any = {
    id: 'warehouse-id-1',
    code: 'WH001',
    name: '主仓库',
    type: 'FABRIC' as any,
    status: WarehouseStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockWarehouseRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WarehouseService,
        {
          provide: getRepositoryToken(Warehouse),
          useValue: mockWarehouseRepository,
        },
      ],
    }).compile();

    service = module.get<WarehouseService>(WarehouseService);
    warehouseRepository = module.get(getRepositoryToken(Warehouse));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create - 创建仓库', () => {
    /**
     * 测试正常创建仓库
     * 验证：仓库编码唯一时应成功创建
     */
    it('应该成功创建仓库', async () => {
      warehouseRepository.findOne.mockResolvedValue(null);
      warehouseRepository.create.mockReturnValue(mockWarehouse);
      warehouseRepository.save.mockResolvedValue(mockWarehouse);

      const result = await service.create({
        code: 'WH001',
        name: '主仓库',
        type: 'FABRIC' as any,
      });

      expect(result).toHaveProperty('id');
      expect(warehouseRepository.create).toHaveBeenCalled();
    });

    /**
     * 测试仓库编码重复
     * 验证：编码已存在时应抛出异常
     */
    it('仓库编码重复时应抛出异常', async () => {
      warehouseRepository.findOne.mockResolvedValue(mockWarehouse);

      await expect(
        service.create({ code: 'WH001', name: '新仓库', type: 'FABRIC' as any }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll - 查询仓库列表', () => {
    /**
     * 测试分页查询
     * 验证：应返回分页数据
     */
    it('应该返回分页仓库列表', async () => {
      warehouseRepository.findAndCount.mockResolvedValue([[mockWarehouse], 1]);

      const result = await service.findAll({}, 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne - 获取仓库详情', () => {
    /**
     * 测试获取已存在仓库
     * 验证：应返回仓库详情
     */
    it('应该返回仓库详情', async () => {
      warehouseRepository.findOne.mockResolvedValue(mockWarehouse);

      const result = await service.findOne('warehouse-id-1');

      expect(result.id).toBe('warehouse-id-1');
    });

    /**
     * 测试获取不存在仓库
     * 验证：应抛出 NotFoundException
     */
    it('仓库不存在时应抛出异常', async () => {
      warehouseRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update - 更新仓库', () => {
    /**
     * 测试正常更新仓库
     * 验证：应更新仓库信息
     */
    it('应该成功更新仓库', async () => {
      warehouseRepository.findOne.mockResolvedValue(mockWarehouse);
      warehouseRepository.save.mockImplementation((w) => Promise.resolve(w));

      const result = await service.update('warehouse-id-1', { name: '新名称' });

      expect(result.name).toBe('新名称');
    });
  });

  describe('remove - 删除仓库', () => {
    /**
     * 测试软删除仓库
     * 验证：应将状态设置为INACTIVE
     */
    it('应该软删除仓库', async () => {
      warehouseRepository.findOne.mockResolvedValue(mockWarehouse);
      warehouseRepository.save.mockImplementation((w) => Promise.resolve(w));

      await service.remove('warehouse-id-1');

      expect(warehouseRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: WarehouseStatus.INACTIVE }),
      );
    });
  });
});
