import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { CustomerContact } from '../entities/customer-contact.entity';
import { Customer } from '../entities/customer.entity';
import { CreateCustomerContactDto } from './dto/create-customer-contact.dto';
import { UpdateCustomerContactDto } from './dto/update-customer-contact.dto';
import { QueryCustomerContactDto } from './dto/query-customer-contact.dto';

/**
 * 客户联系人服务
 * 提供客户联系人的增删改查功能
 */
@Injectable()
export class CustomerContactService {
  constructor(
    @InjectRepository(CustomerContact)
    private contactRepository: Repository<CustomerContact>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  /**
   * 创建客户联系人
   */
  async create(data: CreateCustomerContactDto): Promise<CustomerContact> {
    // 验证客户存在
    const customer = await this.customerRepository.findOne({ where: { id: data.customerId } });
    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    // 如果设置为默认联系人，先取消该客户的其他默认联系人
    if (data.isDefault) {
      await this.contactRepository.update(
        { customerId: data.customerId, isDefault: true },
        { isDefault: false },
      );
    }

    const contact = this.contactRepository.create(data);
    return this.contactRepository.save(contact);
  }

  /**
   * 查询客户联系人列表
   */
  async findAll(
    query: QueryCustomerContactDto,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: CustomerContact[]; total: number; page: number; limit: number }> {
    const where: any = {};

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.search) {
      where.contactName = Like(`%${query.search}%`);
    }

    const [data, total] = await this.contactRepository.findAndCount({
      where,
      relations: ['customer'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * 获取客户联系人详情
   */
  async findOne(id: string): Promise<CustomerContact> {
    const contact = await this.contactRepository.findOne({
      where: { id },
      relations: ['customer'],
    });
    if (!contact) {
      throw new NotFoundException('客户联系人不存在');
    }
    return contact;
  }

  /**
   * 更新客户联系人
   */
  async update(id: string, data: UpdateCustomerContactDto): Promise<CustomerContact> {
    const contact = await this.findOne(id);

    // 如果设置为默认联系人，先取消该客户的其他默认联系人
    if (data.isDefault) {
      await this.contactRepository.update(
        { customerId: contact.customerId, isDefault: true },
        { isDefault: false },
      );
    }

    Object.assign(contact, data);
    return this.contactRepository.save(contact);
  }

  /**
   * 删除客户联系人
   */
  async remove(id: string): Promise<void> {
    const contact = await this.findOne(id);
    await this.contactRepository.delete(id);
  }

  /**
   * 根据客户ID获取联系人列表
   */
  async findByCustomerId(customerId: string): Promise<CustomerContact[]> {
    return this.contactRepository.find({
      where: { customerId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }
}
