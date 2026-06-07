/**
 * 客户类型枚举
 * NORMAL - 普通客户
 * VIP - VIP客户
 * STRATEGIC - 战略客户
 */
export enum CustomerType {
  NORMAL = 'NORMAL',
  VIP = 'VIP',
  STRATEGIC = 'STRATEGIC',
}

/**
 * 客户状态枚举
 * ACTIVE - 活跃
 * INACTIVE - 未激活
 * SUSPENDED - 停用
 */
export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}
