/**
 * 询价单状态枚举
 */
export enum 询价单状态 {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  COMPARED = 'COMPARED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

/**
 * 询价单状态显示映射
 */
export const 询价单状态显示: Record<询价单状态, string> = {
  [询价单状态.DRAFT]: '草稿',
  [询价单状态.SUBMITTED]: '已提交',
  [询价单状态.COMPARED]: '已对比',
  [询价单状态.CONFIRMED]: '已确认',
  [询价单状态.CANCELLED]: '已取消',
};

/**
 * 询价单明细模型
 */
export interface 询价单明细 {
  id: string;
  inquiryId: string;
  productId: string;
  productName: string;
  colorVariantId?: string;
  colorName?: string;
  quantity: number;
  expectedPrice?: number;
  quotedPrice?: number;
  subtotal: number;
  remark?: string;
}

/**
 * 询价单模型
 */
export interface 询价单 {
  id: string;
  inquiryNo: string;
  supplierId: string;
  supplierName: string;
  inquiryDate: Date;
  validUntil?: Date;
  status: 询价单状态;
  contactPerson?: string;
  contactPhone?: string;
  totalAmount: number;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
  items: 询价单明细[];
}

/**
 * 询价单查询参数
 */
export interface 询价单查询参数 {
  supplierId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * 询价单分页结果
 */
export interface 询价单分页结果 {
  items: 询价单[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 创建询价单参数
 */
export interface 创建询价单参数 {
  supplierId: string;
  supplierName: string;
  inquiryDate: string;
  validUntil?: string;
  contactPerson?: string;
  contactPhone?: string;
  remark?: string;
  items: {
    productId: string;
    productName: string;
    colorVariantId?: string;
    colorName?: string;
    quantity: number;
    expectedPrice?: number;
    quotedPrice?: number;
    remark?: string;
  }[];
}

/**
 * 询价单对比结果
 */
export interface 询价单对比结果 {
  inquiries: 询价单[];
  comparison: {
    productId: string;
    productName: string;
    colorVariantId: string;
    colorName: string;
    items: {
      inquiryId: string;
      quantity: number;
      quotedPrice: number;
      subtotal: number;
    }[];
  }[];
  summary: {
    inquiryId: string;
    inquiryNo: string;
    supplierName: string;
    totalAmount: number;
    lowestPriceCount: number;
  }[];
}
