import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, ILike } from 'typeorm';
import { Customer, CustomerType, CustomerStatus } from '../entities/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';

/**
 * 客户查询参数 DTO
 */
export interface CustomerQueryDto {
  page?: number;
  pageSize?: number;
  keyword?: string;
  type?: CustomerType;
  status?: CustomerStatus;
  salespersonId?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 客户分页结果 DTO
 */
export interface PaginatedCustomerResult {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 信用额度检查结果
 */
export interface CreditLimitCheckResult {
  customerId: string;
  customerName: string;
  creditLimit: number;
  usedAmount: number;
  availableAmount: number;
  isEnough: boolean;
}

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  /**
   * 创建客户
   */
  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // 生成客户编码
    const code = await this.generateCode();

    // 创建客户实体
    const customer = this.customerRepository.create({
      ...createCustomerDto,
      code,
    });

    return this.customerRepository.save(customer);
  }

  /**
   * 分页查询客户列表
   */
  async findAll(queryDto: CustomerQueryDto): Promise<PaginatedCustomerResult> {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      type,
      status,
      salespersonId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.customerRepository.createQueryBuilder('customer');

    // 关键词搜索
    if (keyword) {
      queryBuilder.where(
        '(customer.name LIKE :keyword OR customer.code LIKE :keyword OR customer.contactPerson LIKE :keyword OR customer.phone LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    // 按类型筛选
    if (type) {
      queryBuilder.andWhere('customer.type = :type', { type });
    }

    // 按状态筛选
    if (status) {
      queryBuilder.andWhere('customer.status = :status', { status });
    }

    // 按销售员筛选
    if (salespersonId) {
      queryBuilder.andWhere('customer.salespersonId = :salespersonId', {
        salespersonId,
      });
    }

    // 只查询未删除的客户
    queryBuilder.andWhere('customer.isActive = :isActive', { isActive: true });

    // 排序
    const allowedSortFields = ['createdAt', 'updatedAt', 'name', 'code', 'type', 'status'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`customer.${sortField}`, sortOrder);

    // 分页
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    // 关联销售员信息
    queryBuilder.leftJoinAndSelect('customer.salesperson', 'salesperson');

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根据ID查询客户详情
   */
  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id, isActive: true },
      relations: ['salesperson'],
    });

    if (!customer) {
      throw new NotFoundException(`客户ID ${id} 不存在`);
    }

    return customer;
  }

  /**
   * 更新客户信息
   */
  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);

    // 合并更新
    Object.assign(customer, updateCustomerDto);

    return this.customerRepository.save(customer);
  }

  /**
   * 删除客户（软删除）
   */
  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);

    customer.isActive = false;
    await this.customerRepository.save(customer);
  }

  /**
   * 生成客户编码
   * 格式：CUS-YYYYMMDD-0001
   */
  async generateCode(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    // 查找今天最大的序号
    const prefix = `CUS-${dateStr}-`;
    const latestCustomer = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.code LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('customer.code', 'DESC')
      .getOne();

    let sequence = 1;
    if (latestCustomer) {
      const lastSequence = parseInt(latestCustomer.code.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * 检查客户信用额度
   */
  async checkCreditLimit(
    customerId: string,
    requiredAmount: number,
  ): Promise<CreditLimitCheckResult> {
    const customer = await this.findOne(customerId);

    // 计算已使用额度（这里需要根据实际的业务逻辑来计算）
    // 假设通过查询客户的订单来计算已使用额度
    // const usedAmount = await this.calculateUsedCredit(customerId);

    // 暂时设置为0，实际项目中需要根据业务逻辑计算
    const usedAmount = 0;
    const availableAmount = customer.creditLimit - usedAmount;

    return {
      customerId: customer.id,
      customerName: customer.name,
      creditLimit: customer.creditLimit,
      usedAmount,
      availableAmount,
      isEnough: availableAmount >= requiredAmount,
    };
  }

  /**
   * 根据客户编码查询客户
   */
  async findByCode(code: string): Promise<Customer | null> {
    return this.customerRepository.findOne({
      where: { code, isActive: true },
      relations: ['salesperson'],
    });
  }

  /**
   * 检查客户编码是否存在
   */
  async isCodeExists(code: string): Promise<boolean> {
    const count = await this.customerRepository.count({
      where: { code },
    });
    return count > 0;
  }
}
