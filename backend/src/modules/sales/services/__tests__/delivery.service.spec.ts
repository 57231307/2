import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository, Like } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DeliveryService } from '../delivery.service';
import { DeliveryNote, DeliveryNoteItem, SaleOrder, SaleOrderItem } from '../../entities';
import { DeliveryStatus, OrderStatus } from '../../enums';
import { InventoryBatch } from '../../../inventory/entities/inventory-batch.entity';

/**
 * 发货服务单元测试
 * 测试发货处理功能
 */
describe('DeliveryService', () => {
  let service: DeliveryService;
  let deliveryNoteRepository: any;
  let deliveryNoteItemRepository: any;
  let saleOrderRepository: any;
  let saleOrderItemRepository: any;
  let inventoryBatchRepository: any;
  let dataSource: any;
  let mockQueryRunner: any;

  // 测试发货单数据
  const mockDeliveryNote: any = {
    id: 'note-id-1',
    noteNo: 'DN202401010001',
    orderId: 'order-id-1',
    deliveryDate: new Date('2024-01-15'),
    status: DeliveryStatus.PENDING,
    logisticsCompany: '顺丰速运',
    trackingNo: 'SF1234567890',
    shipperName: '发货员A',
    shipperPhone: '13800138001',
    receiverName: '张三',
    receiverPhone: '13800138000',
    receiverAddress: '北京市朝阳区',
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
    order: {} as SaleOrder,
  };

  // 测试发货明细
  const mockDeliveryNoteItem: any = {
    id: 'item-id-1',
    noteId: 'note-id-1',
    orderItemId: 'order-item-id-1',
    batchId: 'batch-id-1',
    rollNo: 'P001',
    quantity: 50,
    unit: 'meter',
  };

  // 测试销售订单
  const mockSaleOrder: any = {
    id: 'order-id-1',
    orderNo: 'SO202401010001',
    customerId: 'customer-id-1',
    orderDate: new Date('2024-01-01'),
    totalAmount: 2550,
    status: OrderStatus.APPROVED,
    receiverName: '张三',
    receiverPhone: '13800138000',
    receiverAddress: '北京市朝阳区',
    items: [] as SaleOrderItem[],
  };

  // 测试销售订单明细
  const mockSaleOrderItem: any = {
    id: 'order-item-id-1',
    orderId: 'order-id-1',
    productId: 'product-id-1',
    colorVariantId: 'variant-id-1',
    quantity: 100,
    unit: 'meter',
    unitPrice: 25.5,
    amount: 2550,
    shippedQuantity: 0,
  };

  // 测试库存批次
  const mockBatch: any = {
    id: 'batch-id-1',
    batchNo: 'GD20240101001',
    rollNo: 'P001',
    productId: 'product-id-1',
    colorVariantId: 'variant-id-1',
    warehouseId: 'warehouse-id-1',
    quantity: 100,
    unit: 'meter',
    status: 'ACTIVE' as any,
    createdAt: new Date(),
    updatedAt: new Date(),
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
    const mockDeliveryNoteRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      }),
      save: jest.fn(),
      count: jest.fn(),
    };

    const mockDeliveryNoteItemRepository = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
      }),
    };

    const mockSaleOrderRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const mockSaleOrderItemRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const mockInventoryBatchRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryService,
        {
          provide: getRepositoryToken(DeliveryNote),
          useValue: mockDeliveryNoteRepository,
        },
        {
          provide: getRepositoryToken(DeliveryNoteItem),
          useValue: mockDeliveryNoteItemRepository,
        },
        {
          provide: getRepositoryToken(SaleOrder),
          useValue: mockSaleOrderRepository,
        },
        {
          provide: getRepositoryToken(SaleOrderItem),
          useValue: mockSaleOrderItemRepository,
        },
        {
          provide: getRepositoryToken(InventoryBatch),
          useValue: mockInventoryBatchRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<DeliveryService>(DeliveryService);
    deliveryNoteRepository = module.get(getRepositoryToken(DeliveryNote));
    deliveryNoteItemRepository = module.get(getRepositoryToken(DeliveryNoteItem));
    saleOrderRepository = module.get(getRepositoryToken(SaleOrder));
    saleOrderItemRepository = module.get(getRepositoryToken(SaleOrderItem));
    inventoryBatchRepository = module.get(getRepositoryToken(InventoryBatch));
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDeliveryNote - 创建发货单', () => {
    /**
     * 测试正常创建发货单
     * 验证：应成功创建发货单
     */
    it('应该成功创建发货单', async () => {
      saleOrderRepository.findOne.mockResolvedValue({
        ...mockSaleOrder,
        items: [mockSaleOrderItem as SaleOrderItem],
      } as SaleOrder);

      // 模拟批次查询
      inventoryBatchRepository.findOne.mockResolvedValue(mockBatch as InventoryBatch);

      // 模拟manager方法
      mockQueryRunner.manager.create.mockImplementation((entity: any, data: any) => ({
        ...data,
        id: entity === DeliveryNote ? 'new-note-id' : 'new-item-id',
      }));
      mockQueryRunner.manager.save.mockImplementation((data: any) => Promise.resolve(data));

      // 模拟订单编号生成
      deliveryNoteRepository.count.mockResolvedValue(0);

      // 模拟查询新创建的发货单
      deliveryNoteRepository.findOne.mockResolvedValue({
        ...mockDeliveryNote,
        id: 'new-note-id',
        items: [mockDeliveryNoteItem as DeliveryNoteItem],
      } as DeliveryNote);

      const result = await service.createDeliveryNote({
        orderId: 'order-id-1',
        deliveryDate: '2024-01-15',
        items: [
          {
            orderItemId: 'order-item-id-1',
            batchId: 'batch-id-1',
            rollNo: 'P001',
            quantity: 50,
          },
        ],
      });

      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    /**
     * 测试订单不存在
     * 验证：应抛出 NotFoundException
     */
    it('订单不存在时应抛出异常', async () => {
      saleOrderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createDeliveryNote({
          orderId: 'nonexistent-order',
          deliveryDate: '2024-01-15',
          items: [],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    /**
     * 测试订单未审批不能发货
     * 验证：只有已审批订单可以发货
     */
    it('订单未审批不能发货', async () => {
      saleOrderRepository.findOne.mockResolvedValue({
        ...mockSaleOrder,
        status: OrderStatus.PENDING,
      } as SaleOrder);

      await expect(
        service.createDeliveryNote({
          orderId: 'order-id-1',
          deliveryDate: '2024-01-15',
          items: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * 测试批次不存在
     * 验证：应抛出 NotFoundException
     */
    it('批次不存在时应抛出异常', async () => {
      saleOrderRepository.findOne.mockResolvedValue({
        ...mockSaleOrder,
        items: [mockSaleOrderItem as SaleOrderItem],
      } as SaleOrder);
      inventoryBatchRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createDeliveryNote({
          orderId: 'order-id-1',
          deliveryDate: '2024-01-15',
          items: [
            {
              orderItemId: 'order-item-id-1',
              batchId: 'nonexistent-batch',
              rollNo: 'P001',
              quantity: 50,
            },
          ],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    /**
     * 测试事务回滚
     * 验证：创建失败时应回滚事务
     */
    it('创建失败时应回滚事务', async () => {
      saleOrderRepository.findOne.mockResolvedValue({
        ...mockSaleOrder,
        items: [mockSaleOrderItem as SaleOrderItem],
      } as SaleOrder);
      inventoryBatchRepository.findOne.mockImplementation(() => {
        throw new Error('数据库错误');
      });

      await expect(
        service.createDeliveryNote({
          orderId: 'order-id-1',
          deliveryDate: '2024-01-15',
          items: [
            {
              orderItemId: 'order-item-id-1',
              batchId: 'batch-id-1',
              rollNo: 'P001',
              quantity: 50,
            },
          ],
        }),
      ).rejects.toThrow();

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findDeliveryNotes - 查询发货单列表', () => {
    /**
     * 测试分页查询
     * 验证：应返回分页数据
     */
    it('应该返回分页发货单列表', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockDeliveryNote], 1]),
      };
      deliveryNoteRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findDeliveryNotes({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    /**
     * 测试按订单筛选
     * 验证：应正确筛选订单
     */
    it('应该支持按订单筛选', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      deliveryNoteRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findDeliveryNotes({ orderId: 'order-id-1' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'note.orderId = :orderId',
        { orderId: 'order-id-1' },
      );
    });

    /**
     * 测试按状态筛选
     * 验证：应正确筛选发货状态
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
      deliveryNoteRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findDeliveryNotes({ status: DeliveryStatus.PENDING });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'note.status = :status',
        { status: DeliveryStatus.PENDING },
      );
    });
  });

  describe('getDeliveryNoteDetail - 获取发货单详情', () => {
    /**
     * 测试获取已存在发货单
     * 验证：应返回发货单详情
     */
    it('应该返回发货单详情', async () => {
      deliveryNoteRepository.findOne.mockResolvedValue({
        ...mockDeliveryNote,
        items: [mockDeliveryNoteItem as DeliveryNoteItem],
        order: mockSaleOrder,
      } as DeliveryNote);

      const result = await service.getDeliveryNoteDetail('note-id-1');

      expect(result.id).toBe('note-id-1');
      expect(result.items).toHaveLength(1);
    });

    /**
     * 测试获取不存在发货单
     * 验证：应抛出 NotFoundException
     */
    it('发货单不存在时应抛出异常', async () => {
      deliveryNoteRepository.findOne.mockResolvedValue(null);

      await expect(service.getDeliveryNoteDetail('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('confirmDelivery - 确认发货', () => {
    /**
     * 测试正常确认发货
     * 验证：应扣减库存并更新状态
     */
    it('应该成功确认发货', async () => {
      deliveryNoteRepository.findOne
        .mockResolvedValueOnce({
          ...mockDeliveryNote,
          status: DeliveryStatus.PENDING,
          items: [mockDeliveryNoteItem as DeliveryNoteItem],
          order: mockSaleOrder,
        } as DeliveryNote)
        .mockResolvedValueOnce({
          ...mockDeliveryNote,
          status: DeliveryStatus.SHIPPED,
          items: [mockDeliveryNoteItem as DeliveryNoteItem],
          order: { ...mockSaleOrder, status: OrderStatus.COMPLETED },
        } as DeliveryNote);

      // 模拟批次查询
      inventoryBatchRepository.findOne.mockResolvedValue({
        ...mockBatch,
        quantity: 100,
      } as InventoryBatch);

      // 模拟匹号查询（未使用）
      deliveryNoteItemRepository.createQueryBuilder.mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });

      // 模拟manager方法
      mockQueryRunner.manager.save.mockImplementation((data: any) => Promise.resolve(data));

      // 模拟订单明细查询
      saleOrderItemRepository.findOne.mockResolvedValue({
        ...mockSaleOrderItem,
        shippedQuantity: 0,
      } as SaleOrderItem);

      // 模拟更新后的订单查询
      saleOrderRepository.findOne.mockResolvedValue({
        ...mockSaleOrder,
        items: [{ ...mockSaleOrderItem, shippedQuantity: 50 }],
      } as SaleOrder);

      const result = await service.confirmDelivery('note-id-1');

      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    /**
     * 测试非待发货状态不能确认
     * 验证：应抛出 BadRequestException
     */
    it('非待发货状态不能确认', async () => {
      deliveryNoteRepository.findOne.mockResolvedValue({
        ...mockDeliveryNote,
        status: DeliveryStatus.SHIPPED,
      } as DeliveryNote);

      await expect(service.confirmDelivery('note-id-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    /**
     * 测试批次库存不足
     * 验证：应抛出 BadRequestException
     */
    it('批次库存不足时应抛出异常', async () => {
      deliveryNoteRepository.findOne.mockResolvedValue({
        ...mockDeliveryNote,
        status: DeliveryStatus.PENDING,
        items: [{ ...mockDeliveryNoteItem, quantity: 150 } as DeliveryNoteItem],
        order: mockSaleOrder,
      } as DeliveryNote);

      inventoryBatchRepository.findOne.mockResolvedValue({
        ...mockBatch,
        quantity: 100,
      } as InventoryBatch);

      await expect(service.confirmDelivery('note-id-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    /**
     * 测试匹号已被使用
     * 验证：同一缸号内匹号唯一，应抛出异常
     */
    it('匹号已被使用时应该抛出异常', async () => {
      deliveryNoteRepository.findOne.mockResolvedValue({
        ...mockDeliveryNote,
        status: DeliveryStatus.PENDING,
        items: [mockDeliveryNoteItem as DeliveryNoteItem],
        order: mockSaleOrder,
      } as DeliveryNote);

      inventoryBatchRepository.findOne.mockResolvedValue(mockBatch as InventoryBatch);

      // 模拟匹号已被其他发货单使用
      deliveryNoteItemRepository.createQueryBuilder.mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 'existing-item-id' }), // 存在已使用的记录
      });

      await expect(service.confirmDelivery('note-id-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAvailableBatches - 获取可选批次', () => {
    /**
     * 测试获取可用批次
     * 验证：应返回库存充足的颜色变体批次
     */
    it('应该返回可选批次列表', async () => {
      saleOrderItemRepository.findOne.mockResolvedValue({
        ...mockSaleOrderItem,
        quantity: 50,
      } as SaleOrderItem);

      inventoryBatchRepository.find.mockResolvedValue([
        { ...mockBatch, quantity: 100 },
        { ...mockBatch, id: 'batch-id-2', quantity: 30 }, // 库存不足
      ] as InventoryBatch[]);

      const result = await service.getAvailableBatches('order-item-id-1', 50);

      // 应该过滤掉库存不足的批次
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('batch-id-1');
    });

    /**
     * 测试订单明细不存在
     * 验证：应抛出 NotFoundException
     */
    it('订单明细不存在时应抛出异常', async () => {
      saleOrderItemRepository.findOne.mockResolvedValue(null);

      await expect(service.getAvailableBatches('nonexistent', 50)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
