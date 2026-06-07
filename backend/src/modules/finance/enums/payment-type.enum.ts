/**
 * 财务模块枚举
 * 包含收款、付款、账户状态等枚举
 */

/**
 * 收付款类型枚举
 * RECEIVE - 收款
 * PAY - 付款
 */
export enum PaymentType {
  RECEIVE = 'RECEIVE',
  PAY = 'PAY',
}

/**
 * 收付款方式枚举
 * CASH - 现金
 * BANK_TRANSFER - 银行转账
 * ALIPAY - 支付宝
 * WECHAT - 微信
 */
export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  ALIPAY = 'ALIPAY',
  WECHAT = 'WECHAT',
}

/**
 * 应收应付状态枚举
 * PENDING - 待核销
 * PARTIAL - 部分核销
 * CLEARED - 已核销
 * OVERDUE - 已逾期
 */
export enum ArApStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  CLEARED = 'CLEARED',
  OVERDUE = 'OVERDUE',
}

/**
 * 单据来源类型枚举
 * SALE_ORDER - 销售订单
 * PURCHASE_ORDER - 采购订单
 * DELIVERY - 发货单
 * RECEIPT - 入库单
 */
export enum SourceType {
  SALE_ORDER = 'SALE_ORDER',
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  DELIVERY = 'DELIVERY',
  RECEIPT = 'RECEIPT',
}
