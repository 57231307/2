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

  /**
   * 获取应收款账龄报表
   * @param customerId 可选的客户ID筛选
   * @returns 账龄分析报表数据
   */
  async getAgingReport(customerId?: string): Promise<{
    总金额: number;
    账龄区间: Array<{ 区间: string; 金额: number; 占比: number; 笔数: number }>;
    客户分布: Array<{ 客户名称: string; 金额: number; 占比: number }>;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 构建查询条件
    const whereConditions: FindOptionsWhere<AccountReceivable> = {
      status: ArApStatus.PENDING,
    };
    if (customerId) {
      whereConditions.customerId = customerId;
    }

    // 查询所有未结清的应收款
    const receivables = await this.receivableRepository.find({
      where: whereConditions,
    });

    // 计算总金额
    const 总金额 = receivables.reduce((sum, r) => sum + Number(r.balance), 0);

    // 账龄区间统计
    const 账龄区间: Array<{ 区间: string; 金额: number; 占比: number; 笔数: number }> = [
      { 区间: '0-30天', 金额: 0, 占比: 0, 笔数: 0 },
      { 区间: '31-60天', 金额: 0, 占比: 0, 笔数: 0 },
      { 区间: '61-90天', 金额: 0, 占比: 0, 笔数: 0 },
      { 区间: '90天以上', 金额: 0, 占比: 0, 笔数: 0 },
    ];

    receivables.forEach((r) => {
      const dueDate = new Date(r.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysPastDue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      const balance = Number(r.balance);
      let index: number;

      if (daysPastDue <= 0) {
        index = 0; // 0-30天（未到期或刚到期）
      } else if (daysPastDue <= 30) {
        index = 0; // 0-30天
      } else if (daysPastDue <= 60) {
        index = 1; // 31-60天
      } else if (daysPastDue <= 90) {
        index = 2; // 61-90天
      } else {
        index = 3; // 90天以上
      }

      账龄区间[index].金额 += balance;
      账龄区间[index].笔数 += 1;
    });

    // 计算占比
    账龄区间.forEach((item) => {
      item.占比 = 总金额 > 0 ? Math.round((item.金额 / 总金额) * 10000) / 100 : 0;
    });

    // 客户分布统计
    const customerMap = new Map<string, { 金额: number; 名称: string }>();
    receivables.forEach((r) => {
      const current = customerMap.get(r.customerId) || { 金额: 0, 名称: r.customerName };
      current.金额 += Number(r.balance);
      customerMap.set(r.customerId, current);
    });

    const 客户分布 = Array.from(customerMap.entries())
      .map(([id, data]) => ({
        客户名称: data.名称,
        金额: data.金额,
        占比: 总金额 > 0 ? Math.round((data.金额 / 总金额) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.金额 - a.金额);

    return {
      总金额,
      账龄区间,
      客户分布,
    };
  }

  /**
   * 获取逾期预警列表
   * @returns 逾期应收款预警信息
   */
  async getOverdueAlerts(): Promise<Array<{
    id: string;
    documentNo: string;
    customerName: string;
    amount: number;
    balance: number;
    dueDate: Date;
    overdueDays: number;
    severity: 'warning' | 'danger' | 'critical';
  }>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 查询所有未结清的应收款
    const receivables = await this.receivableRepository.find({
      where: { status: ArApStatus.PENDING },
      order: { dueDate: 'ASC' },
    });

    const alerts: Array<{
      id: string;
      documentNo: string;
      customerName: string;
      amount: number;
      balance: number;
      dueDate: Date;
      overdueDays: number;
      severity: 'warning' | 'danger' | 'critical';
    }> = [];

    receivables.forEach((r) => {
      const dueDate = new Date(r.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysPastDue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysPastDue > 0) {
        let severity: 'warning' | 'danger' | 'critical';
        if (daysPastDue > 90) {
          severity = 'critical';
        } else if (daysPastDue > 60) {
          severity = 'danger';
        } else {
          severity = 'warning';
        }

        alerts.push({
          id: r.id,
          documentNo: r.documentNo,
          customerName: r.customerName,
          amount: Number(r.amount),
          balance: Number(r.balance),
          dueDate: r.dueDate,
          overdueDays: daysPastDue,
          severity,
        });
      }
    });

    return alerts;
  }
}
