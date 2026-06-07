/**
 * 供应商类型枚举
 * FABRIC - 面料供应商
 * DYE - 染料供应商
 * AUXILIARY - 辅料供应商
 * MACHINE - 设备供应商
 * OTHER - 其他
 */
export enum SupplierType {
  FABRIC = 'FABRIC',
  DYE = 'DYE',
  AUXILIARY = 'AUXILIARY',
  MACHINE = 'MACHINE',
  OTHER = 'OTHER',
}

/**
 * 供应商状态枚举
 * ACTIVE - 活跃
 * INACTIVE - 未激活
 * SUSPENDED - 停用
 */
export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}
