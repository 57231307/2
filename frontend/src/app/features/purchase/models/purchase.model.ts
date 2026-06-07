// 采购订单状态枚举
export enum PurchaseOrderStatus {
  草稿 = 'draft',
  已确认 = 'confirmed',
  部分入库 = 'partial_received',
  已完成 = 'completed',
  已取消 = 'cancelled',
}

// 入库单状态枚举
export enum ReceiptStatus {
  待入库 = 'pending',
  部分入库 = 'partial',
  已入库 = 'received',
}

// 退货单状态枚举
export enum PurchaseReturnStatus {
  待处理 = 'pending',
  已确认 = 'confirmed',
  已拒绝 = 'rejected',
}

// 采购订单模型
export interface PurchaseOrder {
  id: string;
  orderNo: string;
  supplierId: string;
  supplierName: string;
  orderDate: Date;
  expectedDeliveryDate: Date;
  status: PurchaseOrderStatus;
  totalAmount: number;
  receivedAmount: number;
  items: PurchaseOrderItem[];
  notes?: string;
}

// 采购订单明细模型
export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  colorVariantId?: string;
  colorCode?: string;
  colorName?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  receivedQuantity: number;
}

// 入库单模型
export interface GoodsReceipt {
  id: string;
  receiptNo: string;
  orderId: string;
  orderNo: string;
  receiptDate: Date;
  warehouseId: string;
  warehouseName: string;
  status: ReceiptStatus;
  items: GoodsReceiptItem[];
  notes?: string;
}

// 入库单明细模型
export interface GoodsReceiptItem {
  id: string;
  orderItemId: string;
  productId: string;
  productName: string;
  colorVariantId?: string;
  colorCode?: string;
  colorName?: string;
  batchId?: string;
  dyeLotNo?: string;    // 缸号
  pieceNo?: string;     // 匹号
  receiptQuantity: number;
  unit: string;
}

// 退货单模型
export interface PurchaseReturn {
  id: string;
  returnNo: string;
  receiptId: string;
  receiptNo: string;
  orderId: string;
  orderNo: string;
  returnDate: Date;
  status: PurchaseReturnStatus;
  items: PurchaseReturnItem[];
  reason: string;
  notes?: string;
}

// 退货单明细模型
export interface PurchaseReturnItem {
  id: string;
  orderItemId: string;
  productId: string;
  productName: string;
  colorVariantId?: string;
  colorCode?: string;
  colorName?: string;
  batchId?: string;
  dyeLotNo?: string;     // 缸号
  pieceNo?: string;      // 匹号
  receiptQuantity: number; // 入库数量
  returnQuantity: number;
  unit: string;
}

// 供应商模型
export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
}

// 产品模型
export interface Product {
  id: string;
  productCode: string;
  productName: string;
  unit: string;
  unitPrice: number;
}

// 颜色变体模型
export interface ColorVariant {
  id: string;
  colorCode: string;
  colorName: string;
  unitPrice: number;
  costPrice: number;
  productId: string;
  productName: string;
}

// 仓库模型
export interface Warehouse {
  id: string;
  warehouseCode: string;
  warehouseName: string;
}

// 批次模型
export interface Batch {
  id: string;
  dyeLotNo: string;  // 缸号
  pieceNo: string;   // 匹号
  colorVariantId: string;
  availableQuantity: number;
}

// 分页结果
export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 查询参数
export interface PurchaseOrderQueryParams {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: PurchaseOrderStatus;
  supplierId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface GoodsReceiptQueryParams {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: ReceiptStatus;
  orderId?: string;
}

export interface PurchaseReturnQueryParams {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: PurchaseReturnStatus;
}
