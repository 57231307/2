/**
 * 生产工单状态枚举
 * 用于表示生产工单的生命周期状态
 */
export enum ProductionOrderStatus {
  DRAFT = 'DRAFT',           // 草稿
  RELEASED = 'RELEASED',     // 已下达
  IN_PROGRESS = 'IN_PROGRESS', // 生产中
  COMPLETED = 'COMPLETED',   // 已完工
  CANCELLED = 'CANCELLED'    // 已取消
}
