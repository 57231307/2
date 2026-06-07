/**
 * 质检类型枚举
 * ARRIVAL - 来料质检
 * PRODUCTION - 生产质检
 * SHIPMENT - 出货质检
 */
export enum InspectionType {
  ARRIVAL = 'ARRIVAL',
  PRODUCTION = 'PRODUCTION',
  SHIPMENT = 'SHIPMENT',
}

/**
 * 质检结果枚举
 * PASSED - 合格
 * FAILED - 不合格
 * CONDITIONAL - 条件合格
 */
export enum InspectionResult {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  CONDITIONAL = 'CONDITIONAL',
}

/**
 * 质检状态枚举
 * PENDING - 待质检
 * IN_PROGRESS - 质检中
 * COMPLETED - 已完成
 * CANCELLED - 已取消
 */
export enum InspectionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * 质检项结果枚举
 * OK - 合格
 * NG - 不合格
 * NA - 不适用
 */
export enum InspectionItemResult {
  OK = 'OK',
  NG = 'NG',
  NA = 'NA',
}

/**
 * 严重程度枚举
 * CRITICAL - 严重
 * MAJOR - 主要
 * MINOR - 轻微
 */
export enum Severity {
  CRITICAL = 'CRITICAL',
  MAJOR = 'MAJOR',
  MINOR = 'MINOR',
}
