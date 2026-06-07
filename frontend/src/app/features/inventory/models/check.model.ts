/**
 * 盘点单状态枚举
 */
export enum InventoryCheckStatus {
  待盘点 = 'PENDING',
  盘点中 = 'IN_PROGRESS',
  已完成 = 'COMPLETED',
}

/**
 * 盘点类型枚举
 */
export enum InventoryCheckType {
  全盘 = 'FULL',
  抽盘 = 'SAMPLE',
}
