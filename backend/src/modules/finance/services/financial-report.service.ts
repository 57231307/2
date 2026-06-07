/**
 * 财务报表服务
 * 提供利润表、资产负债表、现金流量表等财务报表
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { AccountReceivable } from '../entities/account-receivable.entity';
import { AccountPayable } from '../entities/account-payable.entity';
import { SaleOrder, SaleOrderItem } from '../../sales/entities';
import { PurchaseOrder, PurchaseOrderItem } from '../../purchase/entities';
import { ProductionReceipt, ProductionReceiptItem } from '../../production/entities';
import { GoodsReceipt, GoodsReceiptItem } from '../../purchase/entities';

/**
 * 利润表数据
 */
export interface ProfitLossReport {
  报表期间: {
    开始日期: string;
    结束日期: string;
  };
  营业收入: {
    销售收入: number;
    其他收入: number;
    合计: number;
  };
  营业成本: {
    销售成本: number;
    其他成本: number;
    合计: number;
  };
  毛利: number;
  营业费用: {
    销售费用: number;
    管理费用: number;
    财务费用: number;
    合计: number;
  };
  营业利润: number;
  所得税: number;
  净利润: number;
}

/**
 * 资产负债表数据
 */
export interface BalanceSheetReport {
  报表日期: string;
  资产: {
    流动资产: {
      货币资金: number;
      应收账款: number;
      存货: number;
      预付账款: number;
      其他流动资产: number;
      合计: number;
    };
    非流动资产: {
      固定资产: number;
      无形资产: number;
      其他非流动资产: number;
      合计: number;
    };
    资产合计: number;
  };
  负债: {
    流动负债: {
      应付账款: number;
      应付票据: number;
      预收账款: number;
      应付职工薪酬: number;
      应交税费: number;
      其他流动负债: number;
      合计: number;
    };
    非流动负债: {
      长期借款: number;
      其他非流动负债: number;
      合计: number;
    };
    负债合计: number;
  };
  所有者权益: {
    实收资本: number;
    未分配利润: number;
    所有者权益合计: number;
  };
  负债和所有者权益合计: number;
}

/**
 * 现金流量表数据
 */
export interface CashFlowReport {
  报表期间: {
    开始日期: string;
    结束日期: string;
  };
  经营活动: {
    销售商品提供劳务收到的现金: number;
    购买商品接受劳务支付的现金: number;
    支付给职工以及为职工支付的现金: number;
    支付的各项税费: number;
    经营活动现金流量净额: number;
  };
  投资活动: {
    处置固定资产收回的现金净额: number;
    购建固定资产支付的现金: number;
    投资活动现金流量净额: number;
  };
  筹资活动: {
    吸收投资收到的现金: number;
    取得借款收到的现金: number;
    偿还债务支付的现金: number;
    筹资活动现金流量净额: number;
  };
  现金及现金等价物净增加额: number;
  期初现金及现金等价物余额: number;
  期末现金及现金等价物余额: number;
}

/**
 * 财务报表服务
 */
@Injectable()
export class FinancialReportService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(AccountReceivable)
    private arRepository: Repository<AccountReceivable>,
    @InjectRepository(AccountPayable)
    private apRepository: Repository<AccountPayable>,
    @InjectRepository(SaleOrder)
    private saleOrderRepository: Repository<SaleOrder>,
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(ProductionReceipt)
    private productionReceiptRepository: Repository<ProductionReceipt>,
    @InjectRepository(GoodsReceipt)
    private goodsReceiptRepository: Repository<GoodsReceipt>,
  ) {}

  /**
   * 获取利润表
   */
  async getProfitLossReport(startDate: string, endDate: string): Promise<ProfitLossReport> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 查询销售订单的收入
    const saleOrders = await this.saleOrderRepository
      .createQueryBuilder('so')
      .leftJoinAndSelect('so.items', 'items')
      .where('so.order_date >= :startDate', { startDate: start })
      .andWhere('so.order_date <= :endDate', { endDate: end })
      .getMany();

    // 计算销售收入
    const 销售收入 = saleOrders.reduce((sum, order) => {
      return sum + (order.items?.reduce((itemSum, item) => {
        return itemSum + (item.quantity * item.unitPrice);
      }, 0) || 0);
    }, 0);

    // 查询采购订单的成本
    const purchaseOrders = await this.purchaseOrderRepository
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.items', 'items')
      .where('po.order_date >= :startDate', { startDate: start })
      .andWhere('po.order_date <= :endDate', { endDate: end })
      .getMany();

    // 计算销售成本
    const 销售成本 = purchaseOrders.reduce((sum, order) => {
      return sum + (order.items?.reduce((itemSum, item) => {
        return itemSum + (item.quantity * item.unitPrice);
      }, 0) || 0);
    }, 0);

    // 毛利
    const 毛利 = 销售收入 - 销售成本;

    // 营业费用（这里简化处理，实际应该从费用模块获取）
    const 销售费用 = 0;
    const 管理费用 = 0;
    const 财务费用 = 0;
    const 营业费用合计 = 销售费用 + 管理费用 + 财务费用;

    // 营业利润
    const 营业利润 = 毛利 - 营业费用合计;

    // 所得税（简化计算，假设15%）
    const 所得税 = Math.max(0, 营业利润) * 0.15;

    // 净利润
    const 净利润 = 营业利润 - 所得税;

    return {
      报表期间: {
        开始日期: startDate,
        结束日期: endDate,
      },
      营业收入: {
        销售收入,
        其他收入: 0,
        合计: 销售收入,
      },
      营业成本: {
        销售成本,
        其他成本: 0,
        合计: 销售成本,
      },
      毛利,
      营业费用: {
        销售费用,
        管理费用,
        财务费用,
        合计: 营业费用合计,
      },
      营业利润,
      所得税,
      净利润,
    };
  }

  /**
   * 获取资产负债表
   */
  async getBalanceSheetReport(asOfDate: string): Promise<BalanceSheetReport> {
    // 查询应收账款（已入库未收款）
    const arAmount = await this.arRepository
      .createQueryBuilder('ar')
      .select('COALESCE(SUM(ar.balance), 0)', 'total')
      .getRawOne();

    // 查询应付账款（已入库未付款）
    const apAmount = await this.apRepository
      .createQueryBuilder('ap')
      .select('COALESCE(SUM(ap.balance), 0)', 'total')
      .getRawOne();

    // 查询存货（简化：通过生产入库单计算）
    const inventoryAmount = await this.productionReceiptRepository
      .createQueryBuilder('pr')
      .select('COALESCE(SUM(pr.quantity * pr.unit_cost), 0)', 'total')
      .getRawOne();

    // 简化数据（实际应该从多个模块汇总）
    const 货币资金 = 0;
    const 应收账款 = parseFloat(arAmount?.total || 0);
    const 存货 = parseFloat(inventoryAmount?.total || 0);
    const 预付账款 = 0;
    const 其他流动资产 = 0;

    const 流动资产合计 = 货币资金 + 应收账款 + 存货 + 预付账款 + 其他流动资产;

    const 固定资产 = 0;
    const 无形资产 = 0;
    const 其他非流动资产 = 0;
    const 非流动资产合计 = 固定资产 + 无形资产 + 其他非流动资产;

    const 资产合计 = 流动资产合计 + 非流动资产合计;

    const 应付账款 = parseFloat(apAmount?.total || 0);
    const 应付票据 = 0;
    const 预收账款 = 0;
    const 应付职工薪酬 = 0;
    const 应交税费 = 0;
    const 其他流动负债 = 0;
    const 流动负债合计 = 应付账款 + 应付票据 + 预收账款 + 应付职工薪酬 + 应交税费 + 其他流动负债;

    const 长期借款 = 0;
    const 其他非流动负债 = 0;
    const 非流动负债合计 = 长期借款 + 其他非流动负债;

    const 负债合计 = 流动负债合计 + 非流动负债合计;

    // 所有者权益（简化）
    const 实收资本 = 1000000; // 假设初始资本
    const 未分配利润 = 资产合计 - 负债合计 - 实收资本;
    const 所有者权益合计 = 实收资本 + 未分配利润;

    const 负债和所有者权益合计 = 负债合计 + 所有者权益合计;

    return {
      报表日期: asOfDate,
      资产: {
        流动资产: {
          货币资金,
          应收账款,
          存货,
          预付账款,
          其他流动资产,
          合计: 流动资产合计,
        },
        非流动资产: {
          固定资产,
          无形资产,
          其他非流动资产,
          合计: 非流动资产合计,
        },
        资产合计,
      },
      负债: {
        流动负债: {
          应付账款,
          应付票据,
          预收账款,
          应付职工薪酬,
          应交税费,
          其他流动负债,
          合计: 流动负债合计,
        },
        非流动负债: {
          长期借款,
          其他非流动负债,
          合计: 非流动负债合计,
        },
        负债合计,
      },
      所有者权益: {
        实收资本,
        未分配利润,
        所有者权益合计,
      },
      负债和所有者权益合计,
    };
  }

  /**
   * 获取现金流量表
   */
  async getCashFlowReport(startDate: string, endDate: string): Promise<CashFlowReport> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 查询收款记录
    const collections = await this.paymentRepository
      .createQueryBuilder('p')
      .where('p.payment_date >= :startDate', { startDate: start })
      .andWhere('p.payment_date <= :endDate', { endDate: end })
      .andWhere('p.direction = :direction', { direction: 'IN' })
      .select('COALESCE(SUM(p.amount), 0)', 'total')
      .getRawOne();

    // 查询付款记录
    const payments = await this.paymentRepository
      .createQueryBuilder('p')
      .where('p.payment_date >= :startDate', { startDate: start })
      .andWhere('p.payment_date <= :endDate', { endDate: end })
      .andWhere('p.direction = :direction', { direction: 'OUT' })
      .select('COALESCE(SUM(p.amount), 0)', 'total')
      .getRawOne();

    const 销售商品提供劳务收到的现金 = parseFloat(collections?.total || 0);
    const 购买商品接受劳务支付的现金 = parseFloat(payments?.total || 0);

    const 经营活动现金流量净额 = 销售商品提供劳务收到的现金 - 购买商品接受劳务支付的现金;

    return {
      报表期间: {
        开始日期: startDate,
        结束日期: endDate,
      },
      经营活动: {
        销售商品提供劳务收到的现金,
        购买商品接受劳务支付的现金,
        支付给职工以及为职工支付的现金: 0,
        支付的各项税费: 0,
        经营活动现金流量净额,
      },
      投资活动: {
        处置固定资产收回的现金净额: 0,
        购建固定资产支付的现金: 0,
        投资活动现金流量净额: 0,
      },
      筹资活动: {
        吸收投资收到的现金: 0,
        取得借款收到的现金: 0,
        偿还债务支付的现金: 0,
        筹资活动现金流量净额: 0,
      },
      现金及现金等价物净增加额: 经营活动现金流量净额,
      期初现金及现金等价物余额: 0,
      期末现金及现金等价物余额: 0,
    };
  }
}
