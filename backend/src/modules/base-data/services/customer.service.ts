import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer, CustomerStatus } from '../entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';

/**
 * 客户服务
 * 提供客户的增删改查以及信用额度检查等功能
 */
@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  /**
   * 创建客户
   */
  async create(data: CreateCustomerDto): Promise<Customer> {
    const code = data.code || await this.generateCode();

    const existing = await this.customerRepository.findOne({ where: { code } });
    if (existing) {
      throw new ConflictException('客户编码已存在');
    }

    const customer = this.customerRepository.create({
      ...data,
      code,
    });
    return this.customerRepository.save(customer);
  }

  /**
   * 查询客户列表
   */
  async findAll(query: QueryCustomerDto): Promise<{ data: Customer[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, search, type, status, salespersonId } = query;

    const where: any = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }
    if (salespersonId) {
      where.salespersonId = salespersonId;
    }

    const [data, total] = await this.customerRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * 获取客户详情
   */
  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException('客户不存在');
    }
    return customer;
  }

  /**
   * 更新客户
   */
  async update(id: string, data: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);

    if (data.code && data.code !== customer.code) {
      const existing = await this.customerRepository.findOne({ where: { code: data.code } });
      if (existing) {
        throw new ConflictException('客户编码已存在');
      }
    }

    Object.assign(customer, data);
    return this.customerRepository.save(customer);
  }

  /**
   * 删除客户（软删除）
   */
  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    customer.status = CustomerStatus.INACTIVE;
    await this.customerRepository.save(customer);
  }

  /**
   * 生成客户编码
   * 格式：CUS + 日期(YYYYMMDD) + 序号(4位)
   */
  async generateCode(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `CUS${dateStr}`;

    const count = await this.customerRepository.count({
      where: { code: Like(`${prefix}%`) },
    });

    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}${seq}`;
  }

  /**
   * 检查客户信用额度
   * @param customerId 客户ID
   * @param amount 订单金额
   * @returns 是否可以通过信用额度检查
   */
  async checkCreditLimit(customerId: string, amount: number): Promise<{ passed: boolean; message: string }> {
    const customer = await this.findOne(customerId);

    if (customer.status !== CustomerStatus.ACTIVE) {
      return { passed: false, message: '客户状态不是活跃状态' };
    }

    if (customer.creditLimit <= 0) {
      return { passed: false, message: '信用额度为0或未设置' };
    }

    if (amount > customer.creditLimit) {
      return {
        passed: false,
        message: `订单金额${amount}超过客户信用额度${customer.creditLimit}`,
      };
    }

    return { passed: true, message: '信用额度检查通过' };
  }
}
