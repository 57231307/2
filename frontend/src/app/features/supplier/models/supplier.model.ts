import { 供应商类型, 供应商状态 } from '../enums/supplier.enum';

export interface 供应商 {
  id?: string;
  code: string;
  name: string;
  type: 供应商类型;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: 供应商状态;
  notes?: string;
}

export interface 供应商查询参数 {
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
