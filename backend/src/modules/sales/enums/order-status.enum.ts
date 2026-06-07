/**
 * 销售订单状态枚举
 */
export enum OrderStatus {
  /** 待审批 */
  PENDING = 'PENDING',
  /** 已审批 */
  APPROVED = 'APPROVED',
  /** 执行中 */
  IN_PROGRESS = 'IN_PROGRESS',
  /** 已完成 */
  COMPLETED = 'COMPLETED',
  /** 已取消 */
  CANCELLED = 'CANCELLED',
}

/**
 * 审批状态枚举
 */
export enum ApprovalStatus {
  /** 无需审批 */
  NONE = 'NONE',
  /** 待审批 */
  PENDING = 'PENDING',
  /** 已审批 */
  APPROVED = 'APPROVED',
  /** 已驳回 */
  REJECTED = 'REJECTED',
}
