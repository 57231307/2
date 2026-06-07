/**
 * 工艺路线状态枚举
 */
export enum ProcessRouteStatus {
  草稿 = 'draft',
  生效 = 'active',
  废弃 = 'deprecated',
}

/**
 * 工序类型枚举
 */
export enum StepType {
  染色 = 'dyeing',
  定型 = 'setting',
  裁剪 = 'cutting',
  缝制 = 'sewing',
  包装 = 'packaging',
  印花 = 'printing',
  蒸化 = 'steaming',
  水洗 = 'washing',
  熨烫 = 'ironing',
  检验 = 'inspecting',
  其他 = 'other',
}

/**
 * 派工状态枚举
 */
export enum DispatchStatus {
  待派工 = 'pending',
  已派工 = 'dispatched',
  生产中 = 'in_production',
  已完成 = 'completed',
  已取消 = 'cancelled',
}
