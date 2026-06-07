/**
 * 领料单状态枚举
 * 用于表示领料单的处理状态
 */
export enum RequisitionStatus {
  PENDING = 'PENDING',           // 待领料
  ISSUED = 'ISSUED',             // 已领料
  PARTIALLY_ISSUED = 'PARTIALLY_ISSUED' // 部分领料
}
