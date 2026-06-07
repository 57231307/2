/**
 * 仓库类型枚举
 * 用于区分不同类型的仓库
 */
export enum WarehouseType {
  FINISHED = 'FINISHED',    // 成品仓
  SEMI = 'SEMI',            // 半成品仓
  RAW = 'RAW',              // 原料仓
  DYE = 'DYE',              // 染房
  OTHER = 'OTHER'           // 其他
}