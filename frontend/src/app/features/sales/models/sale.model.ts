// 订单状态枚举
export enum OrderStatus {
  草稿 = 'draft',
  已确认 = 'confirmed',
  已发货 = 'shipped',
  已完成 = 'completed',
  已取消 = 'cancelled',
}

// 发货状态枚举
export enum DeliveryStatus {
  待发货 = 'pending',
  部分发货 = 'partial',
  已发货 = 'shipped',
}

// 退货状态枚举
export enum ReturnStatus {
  待处理 = 'pending',
  已确认 = 'confirmed',
  已拒绝 = 'rejected',
}

// 销售订单模型
export interface SaleOrder {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  orderDate: Date;
  deliveryDate: Date;
  status: OrderStatus;
  totalAmount: number;
  paidAmount: number;
  items: SaleOrderItem[];
  notes?: string;
}

// 销售订单明细模型
export interface SaleOrderItem {
  id: string;
  productId: string;
  productName: string;
  colorVariantId: string;
  colorCode: string;
  colorName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

// 发货单模型
export interface DeliveryNote {
  id: string;
  deliveryNo: string;
  orderId: string;
  orderNo: string;
  deliveryDate: Date;
  status: DeliveryStatus;
  items: DeliveryNoteItem[];
}

// 发货单明细模型
export interface DeliveryNoteItem {
  id: string;
  colorVariantId: string;
  colorCode: string;
  colorName: string;
  batchId: string;
  dyeLotNo: string;    // 缸号
  pieceNo: string;     // 匹号
  deliveryQuantity: number;
}

// 退货单模型
export interface SaleReturn {
  id: string;
  returnNo: string;
  deliveryNoteId: string;
  deliveryNoteNo: string;
  orderId: string;
  orderNo: string;
  returnDate: Date;
  status: ReturnStatus;
  items: SaleReturnItem[];
  reason: string;
  notes?: string;
}

// 退货单明细模型
export interface SaleReturnItem {
  id: string;
  colorVariantId: string;
  colorCode: string;
  colorName: string;
  returnQuantity: number;
}

// 颜色变体模型（用于选择）
export interface ColorVariant {
  id: string;
  colorCode: string;
  colorName: string;
  unitPrice: number;
  costPrice: number;
  productId: string;
  productName: string;
}

// 批次模型
export interface Batch {
  id: string;
  dyeLotNo: string;  // 缸号
  pieceNo: string;   // 匹号
  colorVariantId: string;
  availableQuantity: number;
}

// 客户模型
export interface Customer {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
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
export interface OrderQueryParams {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface DeliveryQueryParams {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: DeliveryStatus;
  orderId?: string;
}

export interface ReturnQueryParams {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: ReturnStatus;
}
