/**
 * 配方状态枚举
 */
export enum FormulaStatus {
  /** 草稿 */
  DRAFT = 'DRAFT',
  /** 生效中 */
  ACTIVE = 'ACTIVE',
  /** 已停用 */
  DISABLED = 'DISABLED',
}

/**
 * 色差检测结果枚举
 */
export enum ColorDiffResult {
  /** 合格 */
  PASS = 'PASS',
  /** 不合格 */
  FAIL = 'FAIL',
  /** 警告（接近限值） */
  WARNING = 'WARNING',
}

/**
 * 色差标准等级枚举
 */
export enum ColorDiffStandard {
  /** 完美匹配（ΔE ≤ 0.5） */
  PERFECT = 'PERFECT',
  /** 肉眼不可察觉差异（ΔE ≤ 1.0） */
  EXCELLENT = 'EXCELLENT',
  /** 轻微差异（ΔE ≤ 2.0） */
  GOOD = 'GOOD',
  /** 可接受差异（ΔE ≤ 3.0） */
  ACCEPTABLE = 'ACCEPTABLE',
  /** 明显差异（ΔE > 3.0） */
  POOR = 'POOR',
}