/**
 * 应收款服务
 * 提供应收款的完整操作流程
 */
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere } from 'typeorm';
import { AccountReceivable } from '../entities/account-receivable.entity';
import { Payment } from '../entities/payment.entity';
import { 
  GenerateReceivableDto, 
  QueryReceivableDto, 
  RecordReceivablePaymentDto,
  ReconcileDto 
} from '../dto';
import { ArApStatus, PaymentType, PaymentMethod } from '../enums';

/**
 * 应收款服务
 */
@Injectable()
export class AccountReceivableService {
  constructor(
    @InjectRepository(AccountReceivable)
    private receivableRepository: Repository<AccountReceivable>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  /**
   * 从发货单生成应收
   */
  async generateFromDelivery(data: GenerateReceivableDto): Promise<AccountReceivable> {
    // 检查是否已存在相同来源的应收
    const existing = await this.receivableRepository.findOne({
      where: { sourceId: data.sourceId, sourceType: data.sourceType },
    });
    if (existing) {
      throw new ConflictException('该单据已生成应收');
    }

    const documentNo = await this.generateDocumentNo();

    const receivable = this.receivableRepository.create({
      documentNo,
      sourceType: data.sourceType,
      sourceId: data.sourceId,
      customerId: data.customerId,
      customerName: data.customerName,
      amount: data.amount,
      receivedAmount: 0,
      balance: data.amount,
      dueDate: new Date(data.dueDate),
      status: ArApStatus.PENDING,
      remark: data.remark,
    });

    return this.receivableRepository.save(receivable);
  }

  /**
   * 查询应收列表
   */
  async findReceivables(query: QueryReceivableDto): Promise<{ data: AccountReceivable[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: FindOptionsWhere<AccountReceivable> = {};

    if (query.customerId) {
      where.customerId = query.customerId;
    }
    if (query.status) {
      where.status = query.status;
    }

    let whereConditions: any = where;
    if (query.startDate && query.endDate) {
      whereConditions = {
        ...where,
        dueDate: Between(new Date(query.startDate), new Date(query.endDate)),
      };
    }

    if (query.search) {
      whereConditions.documentNo = Like(`%${query.search}%`);
    }

    const [data, total] = await this.receivableRepository.findAndCount({
      where: whereConditions,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * 获取应收详情
   */
  async getReceivableDetail(id: string): Promise<AccountReceivable> {
    const receivable = await this.receivableRepository.findOne({
      where: { id },
    });
    if (!receivable) {
      throw new NotFoundException('应收单不存在');
    }
    return receivable;
  }

  /**
   * 收款登记
   * 记录收款并更新应收余额
   */
  async recordPayment(id: string, data: RecordReceivablePaymentDto): Promise<AccountReceivable> {
    const receivable = await this.getReceivableDetail(id);

    if (receivable.status === ArApStatus.CLEARED) {
      throw new BadRequestException('应收已结清，不能再收款');
    }

    const paymentAmount = Number(data.amount);
    if (paymentAmount <= 0) {
      throw new BadRequestException('收款金额必须大于0');
    }

    // 创建收款记录
    const payment = this.paymentRepository.create({
      documentNo: await this.generatePaymentNo(PaymentType.RECEIVE),
      type: PaymentType.RECEIVE,
      amount: paymentAmount,
      date: new Date(data.date),
      paymentMethod: (data.paymentMethod as PaymentMethod) || PaymentMethod.BANK_TRANSFER,
      counterpartyId: receivable.customerId,
      counterpartyName: receivable.customerName,
      referenceId: id,
      referenceType: 'AR',
      remark: data.remark,
    });
    await this.paymentRepository.save(payment);

    // 更新应收
    const newReceivedAmount = Number(receivable.receivedAmount) + paymentAmount;
    const newBalance = Number(receivable.amount) - newReceivedAmount;

    receivable.receivedAmount = newReceivedAmount;
    receivable.balance = Math.max(0, newBalance);

    if (newBalance <= 0) {
      receivable.status = ArApStatus.CLEARED;
      receivable.settledAt = new Date();
    } else if (newReceivedAmount > 0) {
      receivable.status = ArApStatus.PARTIAL;
    }

    return this.receivableRepository.save(receivable);
  }

  /**
   * 核销应收
   */
  async reconcile(id: string, data: ReconcileDto): Promise<AccountReceivable> {
    const receivable = await this.getReceivableDetail(id);

    if (receivable.status === ArApStatus.CLEARED) {
      throw new BadRequestException('应收已结清');
    }

    const reconcileAmount = Number(data.amount);
    if (reconcileAmount <= 0) {
      throw new BadRequestException('核销金额必须大于0');
    }

    const newBalance = Number(receivable.balance) - reconcileAmount;
    receivable.balance = Math.max(0, newBalance);
    receivable.receivedAmount = Number(receivable.amount) - receivable.balance;

    if (receivable.balance <= 0) {
      receivable.status = ArApStatus.CLEARED;
      receivable.settledAt = new Date();
    } else {
      receivable.status = ArApStatus.PARTIAL;
    }

    return this.receivableRepository.save(receivable);
  }

  /**
   * 生成应收单号
   */
  private async generateDocumentNo(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `AR${dateStr}`;

    const count = await this.receivableRepository.count({
      where: { documentNo: Like(`${prefix}%`) },
    });

    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}${seq}`;
  }

  /**
   * 生成收付款单号
   */
  private async generatePaymentNo(type: PaymentType): Promise<string> {
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
