/**
 * 质检状态枚举
 */
export enum QualityStatus {
  PENDING = 'PENDING',      // 待检
  PASSED = 'PASSED',        // 合格
  FAILED = 'FAILED',        // 不合格
  HOLD = 'HOLD'             // 封存
}