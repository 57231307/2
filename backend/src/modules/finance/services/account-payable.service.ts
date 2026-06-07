/**
 * 应付款服务
 * 提供应付款的完整操作流程
 */
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere } from 'typeorm';
import { AccountPayable } from '../entities/account-payable.entity';
import { Payment } from '../entities/payment.entity';
import { 
  GeneratePayableDto, 
  QueryPayableDto, 
  RecordPayablePaymentDto,
  ReconcileDto 
} from '../dto';
import { ArApStatus, PaymentType, PaymentMethod } from '../enums';

/**
 * 应付款服务
 */
@Injectable()
export class AccountPayableService {
  constructor(
    @InjectRepository(AccountPayable)
    private payableRepository: Repository<AccountPayable>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  /**
   * 从入库单生成应付
   */
  async generateFromReceipt(data: GeneratePayableDto): Promise<AccountPayable> {
    // 检查是否已存在相同来源的应付
    const existing = await this.payableRepository.findOne({
      where: { sourceId: data.sourceId, sourceType: data.sourceType },
    });
    if (existing) {
      throw new ConflictException('该单据已生成应付');
    }

    const documentNo = await this.generateDocumentNo();

    const payable = this.payableRepository.create({
      documentNo,
      sourceType: data.sourceType,
      sourceId: data.sourceId,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      amount: data.amount,
      paidAmount: 0,
      balance: data.amount,
      dueDate: new Date(data.dueDate),
      status: ArApStatus.PENDING,
      remark: data.remark,
    });

    return this.payableRepository.save(payable);
  }

  /**
   * 查询应付列表
   */
  async findPayables(query: QueryPayableDto): Promise<{ data: AccountPayable[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: FindOptionsWhere<AccountPayable> = {};

    if (query.supplierId) {
      where.supplierId = query.supplierId;
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

    const [data, total] = await this.payableRepository.findAndCount({
      where: whereConditions,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * 获取应付详情
   */
  async getPayableDetail(id: string): Promise<AccountPayable> {
    const payable = await this.payableRepository.findOne({
      where: { id },
    });
    if (!payable) {
      throw new NotFoundException('应付单不存在');
    }
    return payable;
  }

  /**
   * 付款登记
   * 记录付款并更新应付余额
   */
  async recordPayment(id: string, data: RecordPayablePaymentDto): Promise<AccountPayable> {
    const payable = await this.getPayableDetail(id);

    if (payable.status === ArApStatus.CLEARED) {
      throw new BadRequestException('应付已结清，不能再付款');
    }

    const paymentAmount = Number(data.amount);
    if (paymentAmount <= 0) {
      throw new BadRequestException('付款金额必须大于0');
    }

    // 创建付款记录
    const payment = this.paymentRepository.create({
      documentNo: await this.generatePaymentNo(PaymentType.PAY),
      type: PaymentType.PAY,
      amount: paymentAmount,
      date: new Date(data.date),
      paymentMethod: (data.paymentMethod as PaymentMethod) || PaymentMethod.BANK_TRANSFER,
      counterpartyId: payable.supplierId,
      counterpartyName: payable.supplierName,
      referenceId: id,
      referenceType: 'AP',
      remark: data.remark,
    });
    await this.paymentRepository.save(payment);

    // 更新应付
    const newPaidAmount = Number(payable.paidAmount) + paymentAmount;
    const newBalance = Number(payable.amount) - newPaidAmount;

    payable.paidAmount = newPaidAmount;
    payable.balance = Math.max(0, newBalance);

    if (newBalance <= 0) {
      payable.status = ArApStatus.CLEARED;
      payable.settledAt = new Date();
    } else if (newPaidAmount > 0) {
      payable.status = ArApStatus.PARTIAL;
    }

    return this.payableRepository.save(payable);
  }

  /**
   * 核销应付
   */
  async reconcile(id: string, data: ReconcileDto): Promise<AccountPayable> {
    const payable = await this.getPayableDetail(id);

    if (payable.status === ArApStatus.CLEARED) {
      throw new BadRequestException('应付已结清');
    }

    const reconcileAmount = Number(data.amount);
    if (reconcileAmount <= 0) {
      throw new BadRequestException('核销金额必须大于0');
    }

    const newBalance = Number(payable.balance) - reconcileAmount;
    payable.balance = Math.max(0, newBalance);
    payable.paidAmount = Number(payable.amount) - payable.balance;

    if (payable.balance <= 0) {
      payable.status = ArApStatus.CLEARED;
      payable.settledAt = new Date();
    } else {
      payable.status = ArApStatus.PARTIAL;
    }

    return this.payableRepository.save(payable);
  }

  /**
   * 生成应付单号
   */
  private async generateDocumentNo(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `AP${dateStr}`;

    const count = await this.payableRepository.count({
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
