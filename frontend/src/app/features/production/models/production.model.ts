// 生产优先级枚举
export enum ProductionPriority {
  紧急 = 'urgent',
  高 = 'high',
  中 = 'medium',
  低 = 'low',
}

// 生产工单状态枚举
export enum ProductionOrderStatus {
  草稿 = 'draft',
  已确认 = 'confirmed',
  生产中 = 'in_production',
  待入库 = 'pending_storage',
  已完成 = 'completed',
}

// 领料状态枚举
export enum RequisitionStatus {
  待领料 = 'pending',
  已领料 = 'issued',
  部分领料 = 'partial',
}

// 入库状态枚举
export enum ProductionReceiptStatus {
  待入库 = 'pending',
  已入库 = 'received',
  部分入库 = 'partial',
}

// 生产工单模型
export interface ProductionOrder {
  id: string;
  orderNo: string;
  productId: string;
  productName: string;
  colorVariantId?: string;
  colorCode?: string;
  colorName?: string;
  plannedQuantity: number;
  actualQuantity: number;
  priority: ProductionPriority;
  status: ProductionOrderStatus;
  startDate: Date;
  expectedFinishDate: Date;
  actualFinishDate?: Date;
  items: ProductionOrderItem[];
  notes?: string;
}

// 生产工单明细模型
export interface ProductionOrderItem {
  id: string;
  productId: string;
  productName: string;
  plannedQuantity: number;
  actualQuantity: number;
}

// 领料单模型
export interface MaterialRequisition {
  id: string;
  requisitionNo: string;
  productionOrderId: string;
  productionOrderNo: string;
  requisitionDate: Date;
  warehouseId: string;
  warehouseName: string;
  status: RequisitionStatus;
  items: MaterialRequisitionItem[];
}

// 领料单明细模型
export interface MaterialRequisitionItem {
  id: string;
  productId: string;
  productName: string;
  requisitionQuantity: number;
  issuedQuantity: number;
  unit: string;
}

// 生产入库单模型
export interface ProductionReceipt {
  id: string;
  receiptNo: string;
  productionOrderId: string;
  productionOrderNo: string;
  receiptDate: Date;
  warehouseId: string;
  warehouseName: string;
  status: ProductionReceiptStatus;
  items: ProductionReceiptItem[];
}

// 生产入库单明细模型
export interface ProductionReceiptItem {
  id: string;
  productId: string;
  colorVariantId?: string;
  receiptQuantity: number;
  batchId?: string;
  dyeLotNo?: string;
  pieceNo?: string;
  unit: string;
}

// 分页结果
export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 生产工单查询参数
export interface ProductionOrderQueryParams {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: ProductionOrderStatus;
  priority?: ProductionPriority;
  startDate?: Date;
  endDate?: Date;
}

// 领料单查询参数
export interface RequisitionQueryParams {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: RequisitionStatus;
  productionOrderId?: string;
}

// 入库单查询参数
export interface ReceiptQueryParams {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: ProductionReceiptStatus;
  productionOrderId?: string;
}

// 产品模型（用于选择）
export interface Product {
  id: string;
  name: string;
  code: string;
  unit: string;
}

// 颜色变体模型
export interface ColorVariant {
  id: string;
  colorCode: string;
  colorName: string;
  productId: string;
  productName: string;
}

// 仓库模型
export interface Warehouse {
  id: string;
  name: string;
  code: string;
}
