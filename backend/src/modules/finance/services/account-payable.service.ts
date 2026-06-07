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

  /**
   * 获取应付款账龄报表
   * @param supplierId 可选的供应商ID筛选
   * @returns 账龄分析报表数据
   */
  async getAgingReport(supplierId?: string): Promise<{
    总金额: number;
    账龄区间: Array<{ 区间: string; 金额: number; 占比: number; 笔数: number }>;
    供应商分布: Array<{ 供应商名称: string; 金额: number; 占比: number }>;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 构建查询条件
    const whereConditions: FindOptionsWhere<AccountPayable> = {
      status: ArApStatus.PENDING,
    };
    if (supplierId) {
      whereConditions.supplierId = supplierId;
    }

    // 查询所有未结清的应付款
    const payables = await this.payableRepository.find({
      where: whereConditions,
    });

    // 计算总金额
    const 总金额 = payables.reduce((sum, p) => sum + Number(p.balance), 0);

    // 账龄区间统计
    const 账龄区间: Array<{ 区间: string; 金额: number; 占比: number; 笔数: number }> = [
      { 区间: '0-30天', 金额: 0, 占比: 0, 笔数: 0 },
      { 区间: '31-60天', 金额: 0, 占比: 0, 笔数: 0 },
      { 区间: '61-90天', 金额: 0, 占比: 0, 笔数: 0 },
      { 区间: '90天以上', 金额: 0, 占比: 0, 笔数: 0 },
    ];

    payables.forEach((p) => {
      const dueDate = new Date(p.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysPastDue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      const balance = Number(p.balance);
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

    // 供应商分布统计
    const supplierMap = new Map<string, { 金额: number; 名称: string }>();
    payables.forEach((p) => {
      const current = supplierMap.get(p.supplierId) || { 金额: 0, 名称: p.supplierName };
      current.金额 += Number(p.balance);
      supplierMap.set(p.supplierId, current);
    });

    const 供应商分布 = Array.from(supplierMap.entries())
      .map(([id, data]) => ({
        供应商名称: data.名称,
        金额: data.金额,
        占比: 总金额 > 0 ? Math.round((data.金额 / 总金额) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.金额 - a.金额);

    return {
      总金额,
      账龄区间,
      供应商分布,
    };
  }

  /**
   * 获取逾期预警列表
   * @returns 逾期应付款预警信息
   */
  async getOverdueAlerts(): Promise<Array<{
    id: string;
    documentNo: string;
    supplierName: string;
    amount: number;
    balance: number;
    dueDate: Date;
    overdueDays: number;
    severity: 'warning' | 'danger' | 'critical';
  }>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 查询所有未结清的应付款
    const payables = await this.payableRepository.find({
      where: { status: ArApStatus.PENDING },
      order: { dueDate: 'ASC' },
    });

    const alerts: Array<{
      id: string;
      documentNo: string;
      supplierName: string;
      amount: number;
      balance: number;
      dueDate: Date;
      overdueDays: number;
      severity: 'warning' | 'danger' | 'critical';
    }> = [];

    payables.forEach((p) => {
      const dueDate = new Date(p.dueDate);
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
          id: p.id,
          documentNo: p.documentNo,
          supplierName: p.supplierName,
          amount: Number(p.amount),
          balance: Number(p.balance),
          dueDate: p.dueDate,
          overdueDays: daysPastDue,
          severity,
        });
      }
    });

    return alerts;
  }
}
