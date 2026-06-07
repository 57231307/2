/**
 * 客户联系人模型
 */
export interface 客户联系人 {
  id: string;
  customerId: string;
  contactName: string;
  position?: string;
  phone?: string;
  email?: string;
  isDefault: boolean;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
  customer?: {
    id: string;
    code: string;
    name: string;
  };
}

/**
 * 客户联系人查询参数
 */
export interface 客户联系人查询参数 {
  customerId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * 客户联系人分页结果
 */
export interface 客户联系人分页结果 {
  items: 客户联系人[];
  total: number;
  page: number;
  limit: number;
}
