// 应收款/应付款状态
export enum ArApStatus {
  待收款 = '待收款',
  部分核销 = '部分核销',
  已核销 = '已核销',
  逾期 = '逾期'
}

// 收付款类型
export enum PaymentType {
  收款 = 'RECEIVE',
  付款 = 'PAY'
}

// 收付款记录
export interface Payment {
  id: string;
  paymentNo: string;
  type: PaymentType;
  amount: number;
  paymentDate: Date;
  accountId: string;
  accountName: string;
  counterpartyId: string;
  counterpartyName: string;
  relatedDocumentType?: string;
  relatedDocumentId?: string;
  notes?: string;
  createTime: Date;
}

// 创建收付款记录请求
export interface CreatePaymentRequest {
  type: PaymentType;
  amount: number;
  paymentDate: Date;
  accountId: string;
  counterpartyId: string;
  relatedDocumentType?: string;
  relatedDocumentId?: string;
  notes?: string;
}

// 应收款
export interface AccountReceivable {
  id: string;
  arNo: string;
  customerId: string;
  customerName: string;
  sourceType: 'SALE_ORDER' | 'DELIVERY';
  sourceId: string;
  sourceNo: string;
  amount: number;
  paidAmount: number;
  balance: number;
  dueDate: Date;
  status: ArApStatus;
  items: PaymentRecord[];
  createTime: Date;
}

// 付款记录
export interface PaymentRecord {
  id: string;
  paymentId: string;
  paymentNo: string;
  amount: number;
  paymentDate: Date;
  accountName: string;
  notes?: string;
}

// 应付款
export interface AccountPayable {
  id: string;
  apNo: string;
  supplierId: string;
  supplierName: string;
  sourceType: 'PURCHASE_ORDER' | 'GOODS_RECEIPT';
  sourceId: string;
  sourceNo: string;
  amount: number;
  paidAmount: number;
  balance: number;
  dueDate: Date;
  status: ArApStatus;
  items: PaymentRecord[];
  createTime: Date;
}

// 创建应收款请求
export interface CreateAccountReceivableRequest {
  customerId: string;
  sourceType: 'SALE_ORDER' | 'DELIVERY';
  sourceId: string;
  amount: number;
  dueDate: Date;
}

// 创建应付款请求
export interface CreateAccountPayableRequest {
  supplierId: string;
  sourceType: 'PURCHASE_ORDER' | 'GOODS_RECEIPT';
  sourceId: string;
  amount: number;
  dueDate: Date;
}

// 收款/付款登记请求
export interface RegisterPaymentRequest {
  amount: number;
  paymentDate: Date;
  accountId: string;
  notes?: string;
}

// 应收款查询参数
export interface AccountReceivableQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: ArApStatus;
  customerId?: string;
  startDate?: Date;
  endDate?: Date;
}

// 应付款查询参数
export interface AccountPayableQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: ArApStatus;
  supplierId?: string;
  startDate?: Date;
  endDate?: Date;
}

// 收付款记录查询参数
export interface PaymentQueryParams {
  page?: number;
  pageSize?: number;
  type?: PaymentType;
  accountId?: string;
  counterpartyId?: string;
  startDate?: Date;
  endDate?: Date;
}

// 账龄分析
export interface AgingAnalysis {
  账龄区间: string;
  金额: number;
  占比: number;
}

// 分页结果
export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}