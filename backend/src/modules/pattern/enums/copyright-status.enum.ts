/**
 * 版权状态枚举
 */
export enum CopyrightStatus {
  /** 有效 */
  VALID = 'VALID',
  /** 即将到期 */
  EXPIRING = 'EXPIRING',
  /** 已过期 */
  EXPIRED = 'EXPIRED',
  /** 未授权 */
  UNAUTHORIZED = 'UNAUTHORIZED',
}
