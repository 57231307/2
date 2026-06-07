import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository, Like } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SaleOrderService } from '../sale-order.service';
import { SaleOrder, SaleOrderItem } from '../../entities';
import { OrderStatus, ApprovalStatus } from '../../enums';
import { ProductColorVariant } from '../../../product/entities/product-color-variant.entity';

/**
 * 销售订单服务单元测试
 * 测试订单创建、价格计算
 */
describe('SaleOrderService', () => {
  let service: SaleOrderService;
  let saleOrderRepository: any;
  let saleOrderItemRepository: any;
  let colorVariantRepository: any;
  let dataSource: any;
  let mockQueryRunner: any;

  // 测试订单数据
  const mockOrder: any = {
    id: 'order-id-1',
    orderNo: 'SO202401010001',
    customerId: 'customer-id-1',
    orderDate: new Date('2024-01-01'),
    totalAmount: 2550,
    paidAmount: 0,
    discountAmount: 0,
    status: OrderStatus.PENDING,
    approvalStatus: ApprovalStatus.NONE,
    receiverName: '张三',
    receiverPhone: '13800138000',
    receiverAddress: '北京市朝阳区',
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
  };

  // 测试订单明细
  const mockOrderItem: any = {
    id: 'item-id-1',
    orderId: 'order-id-1',
    productId: 'product-id-1',
    colorVariantId: 'variant-id-1',
    quantity: 100,
    unit: 'meter',
    unitPrice: 25.5,
    amount: 2550,
    shippedQuantity: 0,
  };

  // 测试颜色变体
  const mockColorVariant: any = {
    id: 'variant-id-1',
    productId: 'product-id-1',
    colorNo: 'C001',
    colorName: '红色',
    salePrice: 25.5,
    standardCost: 15.0,
  };

  beforeEach(async () => {
    // 创建模拟QueryRunner
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        create: jest.fn(),
        save: jest.fn(),
      },
    };

    // 创建模拟数据源
    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    // 创建模拟仓库
    const mockSaleOrderRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      }),
      save: jest.fn(),
      count: jest.fn(),
    };

    const mockSaleOrderItemRepository = {
      findOne: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockColorVariantRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaleOrderService,
        {
          provide: getRepositoryToken(SaleOrder),
          useValue: mockSaleOrderRepository,
        },
        {
          provide: getRepositoryToken(SaleOrderItem),
          useValue: mockSaleOrderItemRepository,
        },
        {
          provide: getRepositoryToken(ProductColorVariant),
          useValue: mockColorVariantRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<SaleOrderService>(SaleOrderService);
    saleOrderRepository = module.get(getRepositoryToken(SaleOrder));
    saleOrderItemRepository = module.get(getRepositoryToken(SaleOrderItem));
    colorVariantRepository = module.get(getRepositoryToken(ProductColorVariant));
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create - 创建订单', () => {
    /**
     * 测试正常创建订单
     * 验证：应生成订单编号并计算总金额
     */
    it('应该成功创建订单', async () => {
      const createData = {
        customerId: 'customer-id-1',
        orderDate: '2024-01-01',
        items: [
          {
            productId: 'product-id-1',
            colorVariantId: 'variant-id-1',
            quantity: 100,
          },
        ],
        receiverName: '张三',
        receiverPhone: '13800138000',
        receiverAddress: '北京市朝阳区',
      };

      // 模拟颜色变体查询
      colorVariantRepository.findOne.mockResolvedValue(mockColorVariant as ProductColorVariant);

      // 模拟manager.create和save
      mockQueryRunner.manager.create.mockImplementation((entity: any, data: any) => ({
        ...data,
        id: entity === SaleOrder ? 'new-order-id' : 'new-item-id',
      }));
      mockQueryRunner.manager.save.mockImplementation((data: any) => Promise.resolve(data));

      // 模拟订单编号生成
      saleOrderRepository.count.mockResolvedValue(0);

      // 模拟findOne返回新订单
      saleOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        id: 'new-order-id',
        items: [mockOrderItem as SaleOrderItem],
      } as SaleOrder);

      const result = await service.create(createData);

      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    /**
     * 测试颜色变体不存在
     * 验证：应抛出 NotFoundException
     */
    it('颜色变体不存在时应抛出异常', async () => {
      colorVariantRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          customerId: 'customer-id-1',
          orderDate: '2024-01-01',
          items: [
            {
              productId: 'product-id-1',
              colorVariantId: 'nonexistent-variant',
              quantity: 100,
            },
          ],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    /**
     * 测试价格计算
     * 验证：应使用颜色变体的销售价格计算
     */
    it('应该使用颜色变体价格计算订单金额', async () => {
      const createData = {
        customerId: 'customer-id-1',
        orderDate: '2024-01-01',
        items: [
          {
            productId: 'product-id-1',
            colorVariantId: 'variant-id-1',
            quantity: 100,
          },
        ],
      };

      colorVariantRepository.findOne.mockResolvedValue(mockColorVariant as ProductColorVariant);
      mockQueryRunner.manager.create.mockImplementation((entity: any, data: any) => data);
      mockQueryRunner.manager.save.mockImplementation((data: any) => Promise.resolve(data));
      saleOrderRepository.count.mockResolvedValue(0);
      saleOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        items: [{ ...mockOrderItem, amount: 2550 }],
      } as SaleOrder);

      await service.create(createData);

      // 验证计算：100 * 25.5 = 2550
      expect(mockQueryRunner.manager.create).toHaveBeenCalledWith(
        SaleOrderItem,
        expect.objectContaining({ amount: 2550 }),
      );
    });

    /**
     * 测试自定义单价
     * 验证：应优先使用自定义单价
     */
    it('应该优先使用自定义单价', async () => {
      const createData = {
        customerId: 'customer-id-1',
        orderDate: '2024-01-01',
        items: [
          {
            productId: 'product-id-1',
            colorVariantId: 'variant-id-1',
            quantity: 100,
            unitPrice: 30.0, // 自定义单价
          },
        ],
      };

      colorVariantRepository.findOne.mockResolvedValue(mockColorVariant as ProductColorVariant);
      mockQueryRunner.manager.create.mockImplementation((entity: any, data: any) => data);
      mockQueryRunner.manager.save.mockImplementation((data: any) => Promise.resolve(data));
      saleOrderRepository.count.mockResolvedValue(0);
      saleOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        items: [{ ...mockOrderItem, amount: 3000 }],
      } as SaleOrder);

      await service.create(createData);

      // 验证计算：100 * 30 = 3000
      expect(mockQueryRunner.manager.create).toHaveBeenCalledWith(
        SaleOrderItem,
        expect.objectContaining({ amount: 3000 }),
      );
    });

    /**
     * 测试事务回滚
     * 验证：创建失败时应回滚事务
     */
    it('创建失败时应回滚事务', async () => {
      colorVariantRepository.findOne.mockResolvedValue(mockColorVariant as ProductColorVariant);
      mockQueryRunner.manager.create.mockImplementation(() => {
        throw new Error('创建失败');
      });

      await expect(
        service.create({
          customerId: 'customer-id-1',
          orderDate: '2024-01-01',
          items: [{ productId: 'product-id-1', colorVariantId: 'variant-id-1', quantity: 100 }],
        }),
      ).rejects.toThrow();

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findAll - 查询订单列表', () => {
    /**
     * 测试分页查询
     * 验证：应返回分页数据
     */
    it('应该返回分页订单列表', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockOrder], 1]),
      };
      saleOrderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    /**
     * 测试按客户筛选
     * 验证：应正确筛选客户
     */
    it('应该支持按客户筛选', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      saleOrderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ customerId: 'customer-id-1' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.customerId = :customerId',
        { customerId: 'customer-id-1' },
      );
    });

    /**
     * 测试按状态筛选
     * 验证：应正确筛选订单状态
     */
    it('应该支持按状态筛选', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      saleOrderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ status: OrderStatus.PENDING });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.status = :status',
        { status: OrderStatus.PENDING },
      );
    });

    /**
     * 测试按审批状态筛选
     * 验证：应正确筛选审批状态
     */
    it('应该支持按审批状态筛选', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      saleOrderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ approvalStatus: ApprovalStatus.PENDING });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.approvalStatus = :approvalStatus',
        { approvalStatus: ApprovalStatus.PENDING },
      );
    });
  });

  describe('findOne - 获取订单详情', () => {
    /**
     * 测试获取已存在订单
     * 验证：应返回订单详情和明细
     */
    it('应该返回订单详情', async () => {
      saleOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        items: [mockOrderItem],
      } as SaleOrder);

      const result = await service.findOne('order-id-1');

      expect(result.id).toBe('order-id-1');
      expect(result.items).toHaveLength(1);
    });

    /**
     * 测试获取不存在订单
     * 验证：应抛出 NotFoundException
     */
    it('订单不存在时应抛出异常', async () => {
      saleOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update - 更新订单', () => {
    /**
     * 测试正常更新订单
     * 验证：应更新订单信息
     */
    it('应该成功更新订单', async () => {
      const updatedOrder = { ...mockOrder, items: [], receiverName: '李四', receiverPhone: '13900139000' };
      saleOrderRepository.findOne
        .mockResolvedValueOnce({ ...mockOrder, items: [] } as SaleOrder)
        .mockResolvedValueOnce(updatedOrder as SaleOrder);
      saleOrderRepository.save.mockImplementation((order: any) => Promise.resolve(order));

      const result = await service.update('order-id-1', {
        receiverName: '李四',
        receiverPhone: '13900139000',
      });

      expect(result.receiverName).toBe('李四');
    });

    /**
     * 测试已审批订单不允许修改
     * 验证：已审批订单应抛出 BadRequestException
     */
    it('已审批订单不应允许修改', async () => {
      saleOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        approvalStatus: ApprovalStatus.APPROVED,
      } as SaleOrder);

      await expect(
        service.update('order-id-1', { receiverName: '新名字' }),
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * 测试非待处理状态订单不允许修改
     * 验证：只有PENDING状态可修改
     */
    it('非待处理订单不应允许修改', async () => {
      saleOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.COMPLETED,
        approvalStatus: ApprovalStatus.NONE,
      } as SaleOrder);

      await expect(
        service.update('order-id-1', { receiverName: '新名字' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('submitForApproval - 提交审批', () => {
    /**
     * 测试正常提交审批
     * 验证：待处理订单应成功提交
     */
    it('应该成功提交审批', async () => {
      saleOrderRepository.findOne
        .mockResolvedValueOnce({ ...mockOrder, items: [] } as SaleOrder)
        .mockResolvedValueOnce({ ...mockOrder, items: [], approvalStatus: ApprovalStatus.PENDING } as SaleOrder);
      saleOrderRepository.save.mockImplementation((order) => Promise.resolve(order));

      const result = await service.submitForApproval('order-id-1');

      expect(result.approvalStatus).toBe(ApprovalStatus.PENDING);
    });

    /**
     * 测试非待处理状态不能提交审批
     * 验证：应抛出 BadRequestException
     */
    it('非待处理订单不能提交审批', async () => {
      saleOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.COMPLETED,
      } as SaleOrder);

      await expect(service.submitForApproval('order-id-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('approve - 审批通过', () => {
    /**
     * 测试正常审批通过
     * 验证：待审批订单应成功审批
     */
    it('应该成功审批通过', async () => {
      saleOrderRepository.findOne
        .mockResolvedValueOnce({ ...mockOrder, items: [], approvalStatus: ApprovalStatus.PENDING } as SaleOrder)
        .mockResolvedValueOnce({ ...mockOrder, items: [], approvalStatus: ApprovalStatus.APPROVED, status: OrderStatus.APPROVED } as SaleOrder);
      saleOrderRepository.save.mockImplementation((order) => Promise.resolve(order));

      const result = await service.approve('order-id-1', 'approver-id');

      expect(result.approvalStatus).toBe(ApprovalStatus.APPROVED);
      expect(result.status).toBe(OrderStatus.APPROVED);
    });

    /**
     * 测试非待审批状态不能审批
     * 验证：应抛出 BadRequestException
     */
    it('非待审批订单不能审批', async () => {
      saleOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        approvalStatus: ApprovalStatus.APPROVED,
      } as SaleOrder);

      await expect(service.approve('order-id-1', 'approver-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('reject - 审批驳回', () => {
    /**
     * 测试正常审批驳回
     * 验证：待审批订单应成功驳回
     */
    it('应该成功驳回审批', async () => {
      saleOrderRepository.findOne
        .mockResolvedValueOnce({ ...mockOrder, items: [], approvalStatus: ApprovalStatus.PENDING } as SaleOrder)
        .mockResolvedValueOnce({ ...mockOrder, items: [], approvalStatus: ApprovalStatus.REJECTED } as SaleOrder);
      saleOrderRepository.save.mockImplementation((order) => Promise.resolve(order));

      const result = await service.reject('order-id-1', 'approver-id', { remark: '材料不全' });

      expect(result.approvalStatus).toBe(ApprovalStatus.REJECTED);
    });
  });

  describe('cancel - 取消订单', () => {
    /**
     * 测试正常取消订单
     * 验证：可取消状态的订单应成功取消
     */
    it('应该成功取消订单', async () => {
      saleOrderRepository.findOne
        .mockResolvedValueOnce({ ...mockOrder, items: [], status: OrderStatus.PENDING } as SaleOrder)
        .mockResolvedValueOnce({ ...mockOrder, items: [], status: OrderStatus.CANCELLED } as SaleOrder);
      saleOrderRepository.save.mockImplementation((order) => Promise.resolve(order));

      const result = await service.cancel('order-id-1');

      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    /**
     * 测试已完成订单不能取消
     * 验证：应抛出 BadRequestException
     */
    it('已完成订单不能取消', async () => {
      saleOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.COMPLETED,
      } as SaleOrder);

      await expect(service.cancel('order-id-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    /**
     * 测试已取消订单不能再次取消
     * 验证：应抛出 BadRequestException
     */
    it('已取消订单不能再次取消', async () => {
      saleOrderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      } as SaleOrder);

      await expect(service.cancel('order-id-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
