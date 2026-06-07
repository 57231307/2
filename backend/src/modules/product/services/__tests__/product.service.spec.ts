import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Repository, Like } from 'typeorm';
import { ProductService } from '../product.service';
import { Product } from '../../entities/product.entity';
import { ProductColorVariant } from '../../entities/product-color-variant.entity';
import { ProductStatus, ProductType } from '../../enums';

/**
 * 产品服务单元测试
 * 测试产品CRUD操作和颜色变体管理
 */
describe('ProductService', () => {
  let service: ProductService;
  let productRepository: any;
  let variantRepository: any;

  // 测试产品数据
  const mockProduct: any = {
    id: 'product-id-1',
    code: 'PRD202401010001',
    name: '测试面料',
    type: ProductType.FABRIC,
    status: ProductStatus.ACTIVE,
    hasColorVariants: false,
    defaultVariantId: null,
    colorVariants: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 测试颜色变体数据
  const mockVariant: any = {
    id: 'variant-id-1',
    productId: 'product-id-1',
    colorNo: 'C001',
    colorName: '红色',
    salePrice: 25.5,
    standardCost: 15.0,
    isDefault: false,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // 创建模拟产品仓库
    const mockProductRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      remove: jest.fn(),
    };

    // 创建模拟颜色变体仓库
    const mockVariantRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(ProductColorVariant),
          useValue: mockVariantRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get(getRepositoryToken(Product));
    variantRepository = module.get(getRepositoryToken(ProductColorVariant));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create - 创建产品', () => {
    /**
     * 测试正常创建产品
     * 验证：产品编码唯一时应成功创建
     */
    it('应该成功创建新产品', async () => {
      const createData = {
        name: '新面料',
        type: ProductType.FABRIC,
      };

      productRepository.findOne.mockResolvedValue(null);
      productRepository.create.mockReturnValue({ ...mockProduct, ...createData });
      productRepository.save.mockResolvedValue({
        ...mockProduct,
        ...createData,
        id: 'new-product-id',
      });

      const result = await service.create(createData);

      expect(result).toHaveProperty('id');
      expect(productRepository.create).toHaveBeenCalled();
      expect(productRepository.save).toHaveBeenCalled();
    });

    /**
     * 测试产品编码重复
     * 验证：编码已存在时应抛出 ConflictException
     */
    it('产品编码重复时应抛出异常', async () => {
      productRepository.findOne.mockResolvedValue(mockProduct);

      await expect(
        service.create({ code: 'PRD202401010001', name: '新面料' }),
      ).rejects.toThrow(ConflictException);
    });

    /**
     * 测试自定义产品编码
     * 验证：使用提供的编码创建产品
     */
    it('应该使用提供的编码创建产品', async () => {
      const customCode = 'CUSTOM001';
      productRepository.findOne.mockResolvedValue(null);
      productRepository.create.mockImplementation((data: any) => data);
      productRepository.save.mockImplementation((data: any) =>
        Promise.resolve({ ...data, id: 'new-id' }),
      );

      await service.create({ code: customCode, name: '自定义面料' });

      expect(productRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ code: customCode }),
      );
    });
  });

  describe('findAll - 查询产品列表', () => {
    /**
     * 测试分页查询
     * 验证：应返回分页数据和总数
     */
    it('应该返回分页产品列表', async () => {
      const products = [mockProduct];
      productRepository.findAndCount.mockResolvedValue([products, 1]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    /**
     * 测试按名称搜索
     * 验证：应使用Like查询
     */
    it('应该支持按名称搜索', async () => {
      productRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ search: '面料' });

      expect(productRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: Like('%面料%'),
          }),
        }),
      );
    });

    /**
     * 测试按类型筛选
     * 验证：应正确筛选产品类型
     */
    it('应该支持按类型筛选', async () => {
      productRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ type: ProductType.FABRIC });

      expect(productRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: ProductType.FABRIC }),
        }),
      );
    });

    /**
     * 测试按状态筛选
     * 验证：应正确筛选产品状态
     */
    it('应该支持按状态筛选', async () => {
      productRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ status: ProductStatus.ACTIVE });

      expect(productRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: ProductStatus.ACTIVE }),
        }),
      );
    });
  });

  describe('findOne - 获取产品详情', () => {
    /**
     * 测试获取已存在产品
     * 验证：应返回产品详情和颜色变体
     */
    it('应该返回产品详情', async () => {
      productRepository.findOne.mockResolvedValue({
        ...mockProduct,
        colorVariants: [mockVariant],
      });

      const result = await service.findOne('product-id-1');

      expect(result.id).toBe('product-id-1');
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'product-id-1' },
        relations: ['colorVariants'],
      });
    });

    /**
     * 测试获取不存在的产品
     * 验证：应抛出 NotFoundException
     */
    it('产品不存在时应抛出异常', async () => {
      productRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update - 更新产品', () => {
    /**
     * 测试正常更新产品
     * 验证：应更新产品信息并返回
     */
    it('应该成功更新产品', async () => {
      const updateData = { name: '更新后的面料' };
      productRepository.findOne
        .mockResolvedValueOnce(mockProduct) // findOne调用
        .mockResolvedValueOnce(null); // 检查编码重复

      productRepository.save.mockImplementation((product: any) =>
        Promise.resolve(product),
      );

      const result = await service.update('product-id-1', updateData);

      expect(result.name).toBe('更新后的面料');
      expect(productRepository.save).toHaveBeenCalled();
    });

    /**
     * 测试更新产品编码为已存在的编码
     * 验证：应抛出 ConflictException
     */
    it('更新为重复编码时应抛出异常', async () => {
      productRepository.findOne
        .mockResolvedValueOnce(mockProduct) // findOne
        .mockResolvedValueOnce({ ...mockProduct, id: 'other-id' }); // 检查编码

      await expect(
        service.update('product-id-1', { code: 'EXISTING001' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove - 删除产品', () => {
    /**
     * 测试软删除产品（设置为停产状态）
     * 验证：应将产品状态设置为DISCONTINUED
     */
    it('应该软删除产品（设置为停产状态）', async () => {
      productRepository.findOne.mockResolvedValue(mockProduct);
      productRepository.save.mockImplementation((product: any) =>
        Promise.resolve(product),
      );

      await service.remove('product-id-1');

      expect(productRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ProductStatus.DISCONTINUED }),
      );
    });
  });

  describe('createVariant - 创建颜色变体', () => {
    /**
     * 测试正常创建颜色变体
     * 验证：应成功创建变体并关联到产品
     */
    it('应该成功创建颜色变体', async () => {
      const variantData = {
        colorNo: 'C002',
        colorName: '蓝色',
        salePrice: 28.0,
      };

      const newVariant = {
        ...mockVariant,
        ...variantData,
        id: 'new-variant-id',
      };

      // findOne产品存在 - 第137行
      productRepository.findOne.mockResolvedValue({
        ...mockProduct,
        defaultVariantId: null,
      });
      // 检查颜色编号重复 - 第140行
      variantRepository.findOne.mockResolvedValueOnce(null);
      // findVariantById (在 setDefaultVariant 中调用) - 第183行
      variantRepository.findOne.mockResolvedValueOnce(newVariant);
      variantRepository.create.mockReturnValue(newVariant);
      variantRepository.save.mockResolvedValue(newVariant);
      variantRepository.update.mockResolvedValue({} as any);
      productRepository.update.mockResolvedValue({} as any);

      const result = await service.createVariant('product-id-1', variantData);

      expect(result).toHaveProperty('id');
      expect(variantRepository.create).toHaveBeenCalled();
    });

    /**
     * 测试颜色编号重复
     * 验证：同一产品下颜色编号重复时应抛出异常
     */
    it('颜色编号重复时应抛出异常', async () => {
      productRepository.findOne.mockResolvedValue(mockProduct);
      variantRepository.findOne.mockResolvedValue(mockVariant);

      await expect(
        service.createVariant('product-id-1', {
          colorNo: 'C001',
          colorName: '重复颜色',
          salePrice: 25.0,
        }),
      ).rejects.toThrow(ConflictException);
    });

    /**
     * 测试产品不存在
     * 验证：产品不存在时应抛出 NotFoundException
     */
    it('产品不存在时应抛出异常', async () => {
      productRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createVariant('nonexistent', {
          colorNo: 'C001',
          colorName: '测试',
          salePrice: 25.0,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findVariantsByProduct - 查询颜色变体列表', () => {
    /**
     * 测试获取产品的颜色变体列表
     * 验证：应返回该产品的所有颜色变体
     */
    it('应该返回颜色变体列表', async () => {
      const variants = [mockVariant];
      productRepository.findOne.mockResolvedValue(mockProduct);
      variantRepository.find.mockResolvedValue(variants);

      const result = await service.findVariantsByProduct('product-id-1');

      expect(result).toHaveLength(1);
      expect(variantRepository.find).toHaveBeenCalledWith({
        where: { productId: 'product-id-1' },
        order: { isDefault: 'DESC', createdAt: 'DESC' },
      });
    });
  });

  describe('updateVariant - 更新颜色变体', () => {
    /**
     * 测试正常更新颜色变体
     * 验证：应更新变体信息
     */
    it('应该成功更新颜色变体', async () => {
      const updateData = { colorName: '深红色' };
      // findVariantById 调用
      variantRepository.findOne.mockResolvedValueOnce(mockVariant);
      // 检查颜色编号重复调用
      variantRepository.findOne.mockResolvedValueOnce(null);
      // save 需要返回更新后的数据
      variantRepository.save.mockImplementation((v: any) => Promise.resolve({ ...v, ...updateData }));

      const result = await service.updateVariant('variant-id-1', updateData);

      expect(result.colorName).toBe('深红色');
    });

    /**
     * 测试更新为重复的颜色编号
     * 验证：应抛出 ConflictException
     */
    it('更新为重复颜色编号时应抛出异常', async () => {
      variantRepository.findOne
        .mockResolvedValueOnce(mockVariant) // findVariantById
        .mockResolvedValueOnce({ ...mockVariant, id: 'other-variant' }); // 检查重复

      await expect(
        service.updateVariant('variant-id-1', { colorNo: 'C002' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('removeVariant - 删除颜色变体', () => {
    /**
     * 测试正常删除颜色变体
     * 验证：应调用remove方法
     */
    it('应该成功删除颜色变体', async () => {
      variantRepository.findOne.mockResolvedValue(mockVariant);
      variantRepository.remove.mockResolvedValue(mockVariant);

      await service.removeVariant('variant-id-1');

      expect(variantRepository.remove).toHaveBeenCalledWith(mockVariant);
    });

    /**
     * 测试删除默认变体后更新产品
     * 验证：删除默认变体时应更新产品的默认变体设置
     */
    it('删除默认变体时应更新产品默认设置', async () => {
      const defaultVariant = { ...mockVariant, isDefault: true };
      variantRepository.findOne
        .mockResolvedValueOnce(defaultVariant) // findVariantById
        .mockResolvedValueOnce({ ...mockVariant, id: 'remaining-variant' }); // 查找剩余变体
      variantRepository.remove.mockResolvedValue(defaultVariant);
      productRepository.update.mockResolvedValue({} as any);

      await service.removeVariant('variant-id-1');

      expect(productRepository.update).toHaveBeenCalledWith(
        'product-id-1',
        expect.objectContaining({
          hasColorVariants: true,
          defaultVariantId: 'remaining-variant',
        }),
      );
    });
  });

  describe('getVariantPrice - 获取变体价格', () => {
    /**
     * 测试获取颜色变体价格
     * 验证：应返回销售价格和标准成本
     */
    it('应该返回变体价格信息', async () => {
      variantRepository.findOne.mockResolvedValue({
        ...mockVariant,
        salePrice: 30.0,
        standardCost: 18.0,
      });

      const result = await service.getVariantPrice('variant-id-1');

      expect(result.salePrice).toBe(30.0);
      expect(result.standardCost).toBe(18.0);
    });
  });

  describe('setDefaultVariant - 设置默认变体', () => {
    /**
     * 测试正常设置默认变体
     * 验证：应更新变体的默认标记
     */
    it('应该成功设置默认变体', async () => {
      productRepository.findOne.mockResolvedValue(mockProduct);
      variantRepository.findOne.mockResolvedValue(mockVariant);
      variantRepository.update.mockResolvedValue({} as any);
      productRepository.update.mockResolvedValue({} as any);

      await service.setDefaultVariant('product-id-1', 'variant-id-1');

      // 验证取消所有默认标记
      expect(variantRepository.update).toHaveBeenCalledWith(
        { productId: 'product-id-1' },
        { isDefault: false },
      );
      // 验证设置新默认变体
      expect(variantRepository.update).toHaveBeenCalledWith('variant-id-1', {
        isDefault: true,
      });
    });

    /**
     * 测试变体不属于该产品
     * 验证：应抛出 ConflictException
     */
    it('变体不属于该产品时应抛出异常', async () => {
      productRepository.findOne.mockResolvedValue(mockProduct);
      variantRepository.findOne.mockResolvedValue({
        ...mockVariant,
        productId: 'other-product-id',
      });

      await expect(
        service.setDefaultVariant('product-id-1', 'variant-id-1'),
      ).rejects.toThrow(ConflictException);
    });
  });
});
