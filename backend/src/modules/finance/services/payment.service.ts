/**
 * 收付款服务
 * 提供收付款记录的完整操作
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { AccountReceivable } from '../entities/account-receivable.entity';
import { AccountPayable } from '../entities/account-payable.entity';
import { CreatePaymentDto, QueryPaymentDto } from '../dto';
import { PaymentType, ArApStatus } from '../enums';

/**
 * 收付款服务
 */
@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(AccountReceivable)
    private receivableRepository: Repository<AccountReceivable>,
    @InjectRepository(AccountPayable)
    private payableRepository: Repository<AccountPayable>,
  ) {}

  /**
   * 创建收付款记录
   */
  async createPayment(data: CreatePaymentDto): Promise<Payment> {
    const documentNo = await this.generateDocumentNo(data.type);

    const payment = this.paymentRepository.create({
      ...data,
      documentNo,
      date: new Date(data.date),
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // 如果有关联的应收/应付，更新其状态
    if (data.referenceId) {
      await this.updateReferenceBalance(data.referenceId, data.referenceType, data.amount, data.type);
    }

    return savedPayment;
  }

  /**
   * 查询收付款列表
   */
  async findPayments(query: QueryPaymentDto): Promise<{ data: Payment[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: FindOptionsWhere<Payment> = {};

    if (query.type) {
      where.type = query.type;
    }
    if (query.counterpartyId) {
      where.counterpartyId = query.counterpartyId;
    }
    if (query.paymentMethod) {
      where.paymentMethod = query.paymentMethod;
    }

    let whereConditions: any = where;
    if (query.startDate && query.endDate) {
      whereConditions = {
        ...where,
        date: Between(new Date(query.startDate), new Date(query.endDate)),
      };
    }

    if (query.search) {
      whereConditions.documentNo = Like(`%${query.search}%`);
    }

    const [data, total] = await this.paymentRepository.findAndCount({
      where: whereConditions,
      skip: (page - 1) * limit,
      take: limit,
      order: { date: 'DESC', createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * 获取收付款详情
   */
  async getPaymentDetail(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
    });
    if (!payment) {
      throw new NotFoundException('收付款记录不存在');
    }
    return payment;
  }

  /**
   * 更新关联单据的余额
   */
  private async updateReferenceBalance(
    referenceId: string,
    referenceType: string,
    amount: number,
    paymentType: PaymentType,
  ): Promise<void> {
    if (referenceType === 'AR') {
      const receivable = await this.receivableRepository.findOne({
        where: { id: referenceId },
      });
      if (receivable) {
        if (paymentType === PaymentType.RECEIVE) {
          receivable.receivedAmount = Number(receivable.receivedAmount) + Number(amount);
          receivable.balance = Math.max(0, Number(receivable.amount) - receivable.receivedAmount);
        }
        
        if (receivable.balance <= 0) {
          receivable.status = ArApStatus.CLEARED;
          receivable.settledAt = new Date();
        } else if (receivable.receivedAmount > 0) {
          receivable.status = ArApStatus.PARTIAL;
        }
        
        await this.receivableRepository.save(receivable);
      }
    } else if (referenceType === 'AP') {
      const payable = await this.payableRepository.findOne({
        where: { id: referenceId },
      });
      if (payable) {
        if (paymentType === PaymentType.PAY) {
          payable.paidAmount = Number(payable.paidAmount) + Number(amount);
          payable.balance = Math.max(0, Number(payable.amount) - payable.paidAmount);
        }
        
        if (payable.balance <= 0) {
          payable.status = ArApStatus.CLEARED;
          payable.settledAt = new Date();
        } else if (payable.paidAmount > 0) {
          payable.status = ArApStatus.PARTIAL;
        }
        
        await this.payableRepository.save(payable);
      }
    }
  }

  /**
   * 生成收付款单号
   */
  private async generateDocumentNo(type: PaymentType): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = type === PaymentType.RECEIVE ? `RV${dateStr}` : `PV${dateStr}`;

    const count = await this.paymentRepository.count({
      where: { documentNo: Like(`${prefix}%`) },
    });

    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}${seq}`;
  }
}
