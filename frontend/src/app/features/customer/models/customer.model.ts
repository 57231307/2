import { 客户类型, 客户状态 } from '../enums/customer.enum';

export interface 客户 {
  id?: string;
  code: string;
  name: string;
  type: 客户类型;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: 客户状态;
  creditLimit?: number;
  notes?: string;
}

export interface 客户查询参数 {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  code?: string;
  name?: string;
  type?: string;
  status?: string;
}

export interface 分页结果<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
