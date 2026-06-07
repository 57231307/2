/**
 * 生产入库单状态枚举
 * 用于表示生产入库单的处理状态
 */
export enum ProductionReceiptStatus {
  PENDING = 'PENDING',           // 待入库
  QUALITY_CHECK = 'QUALITY_CHECK', // 质检中
  QUALIFIED = 'QUALIFIED',       // 合格
  REJECTED = 'REJECTED'          // 不合格
}
