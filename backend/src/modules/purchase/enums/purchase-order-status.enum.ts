/**
 * 采购订单状态枚举
 * 用于表示采购订单的生命周期状态
 */
export enum PurchaseOrderStatus {
  /** 待提交 - 订单创建后，待提交审批 */
  PENDING = 'PENDING',
  /** 已审批 - 订单已通过审批，可以执行 */
  APPROVED = 'APPROVED',
  /** 执行中 - 订单正在执行（部分入库） */
  IN_PROGRESS = 'IN_PROGRESS',
  /** 已完成 - 订单全部入库完成 */
  COMPLETED = 'COMPLETED',
  /** 已取消 - 订单被取消 */
  CANCELLED = 'CANCELLED',
}

/**
 * 采购订单审批状态枚举
 */
export enum ApprovalStatus {
  /** 未提交 */
  DRAFT = 'DRAFT',
  /** 审批中 */
  PENDING = 'PENDING',
  /** 已通过 */
  APPROVED = 'APPROVED',
  /** 已拒绝 */
  REJECTED = 'REJECTED',
}
