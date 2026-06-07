/**
 * 创建调拨单数据传输对象
 */
export interface CreateTransferDto {
  sourceWarehouseId: string;
  targetWarehouseId: string;
  transferDate?: string;
  managerId?: string;
  managerName?: string;
  remark?: string;
  items: {
    batchId: string;
    quantity: number;
  }[];
}

/**
 * 查询调拨单数据传输对象
 */
export interface QueryTransferDto {
  status?: string;
  warehouseId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 取消调拨单数据传输对象
 */
export interface CancelTransferDto {
  cancelReason: string;
  remark?: string;
}

/**
 * 调拨单响应数据传输对象
 */
export interface TransferResponseDto {
  id: string;
  transferNo: string;
  sourceWarehouseId: string;
  sourceWarehouseName?: string;
  targetWarehouseId: string;
  targetWarehouseName?: string;
  transferDate: Date;
  status: string;
  managerId?: string;
  managerName?: string;
  dispatchTime?: Date;
  dispatcher?: string;
  receiveTime?: Date;
  receiver?: string;
  cancelReason?: string;
  remark?: string;
  items: TransferItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 调拨单明细响应数据传输对象
 */
export interface TransferItemResponseDto {
  id: string;
  transferId: string;
  batchId: string;
  batchNo: string;
  rollNo: string;
  colorVariantId?: string;
  transferQuantity: number;
  dispatchedQuantity: number;
  receivedQuantity: number;
  unit: string;
  targetWarehouseId: string;
}
