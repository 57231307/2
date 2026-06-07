/**
 * 批次状态枚举
 * 用于表示库存批次的状态
 */
export enum BatchStatus {
  ACTIVE = 'ACTIVE',        // 活跃
  FROZEN = 'FROZEN',       // 冻结
  CLOSED = 'CLOSED'         // 关闭
}