export enum BatchStatus {
  待入库 = 'PENDING',
  已入库 = 'INBOUND',
  已出库 = 'OUTBOUND',
  冻结 = 'FROZEN'
}

export enum QualityStatus {
  待检 = 'PENDING',
  合格 = 'QUALIFIED',
  不合格 = 'UNQUALIFIED',
  让步接收 = 'ACCEPTED_WITH_CONCESSION'
}
