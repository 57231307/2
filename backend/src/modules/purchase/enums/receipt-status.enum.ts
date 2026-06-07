/**
 * 入库单状态枚举
 * 用于表示采购入库单的状态
 */
export enum ReceiptStatus {
  /** 待确认 - 入库单创建，待确认 */
  PENDING = 'PENDING',
  /** 质检中 - 正在执行质检 */
  QUALITY_CHECK = 'QUALITY_CHECK',
  /** 已合格 - 质检通过 */
  QUALIFIED = 'QUALIFIED',
  /** 已拒绝 - 质检不通过 */
  REJECTED = 'REJECTED',
}
