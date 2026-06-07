/**
 * 库存预警项接口
 */
export interface InventoryAlertItem {
  batchId: string;
  batchNo: string;
  rollNo: string;
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productName: string;
  colorVariantId?: string;
  colorCode?: string;
  colorName?: string;
  currentQuantity: number;
  threshold: number;
  diff: number;
  expiryDate?: Date;
  daysUntilExpiry?: number;
}

/**
 * 预警汇总接口
 */
export interface AlertSummary {
  lowStockCount: number;
  overStockCount: number;
  expiryCount: number;
  totalCount: number;
}
