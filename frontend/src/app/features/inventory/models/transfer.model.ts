/**
 * 调拨单状态枚举
 */
export enum TransferStatus {
  待调出 = 'PENDING',
  部分调出 = 'PARTIAL',
  已调出 = 'DISPATCHED',
  已收货 = 'RECEIVED',
  已取消 = 'CANCELLED',
}

/**
 * 调拨明细接口
 */
export interface TransferItem {
  id: string;
  batchId: string;
  batchNo: string;
  rollNo: string;
  colorVariantId?: string;
  colorCode?: string;
  colorName?: string;
  transferQuantity: number;
  unit: string;
  dispatchedQuantity: number;
  receivedQuantity: number;
}

/**
 * 调拨单接口
 */
export interface InventoryTransfer {
  id: string;
  transferNo: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  targetWarehouseId: string;
  targetWarehouseName: string;
  transferDate: Date;
  status: TransferStatus;
  managerName?: string;
  dispatchTime?: Date;
  dispatcher?: string;
  receiveTime?: Date;
  receiver?: string;
  cancelReason?: string;
  remark?: string;
  items: TransferItem[];
  createdAt: Date;
}

/**
 * 创建调拨明细DTO
 */
export interface CreateTransferItemDto {
  batchId: string;
  quantity: number;
}

/**
 * 创建调拨单DTO
 */
export interface CreateTransferDto {
  sourceWarehouseId: string;
  targetWarehouseId: string;
  transferDate?: string;
  managerId?: string;
  managerName?: string;
  remark?: string;
  items: CreateTransferItemDto[];
}

/**
 * 查询调拨单参数
 */
export interface QueryTransferParams {
  warehouseId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * 取消调拨DTO
 */
export interface CancelTransferDto {
  cancelReason: string;
  remark?: string;
}
