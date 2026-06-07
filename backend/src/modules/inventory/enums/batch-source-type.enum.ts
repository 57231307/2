/**
 * 批次来源类型枚举
 * 用于区分库存批次的不同来源
 */
export enum BatchSourceType {
  PURCHASE = 'PURCHASE',    // 采购入库
  PRODUCTION = 'PRODUCTION', // 生产入库
  TRANSFER = 'TRANSFER',    // 调拨入库
  RETURN = 'RETURN',         // 退货入库
  ADJUSTMENT = 'ADJUSTMENT'  // 盘点调整
}