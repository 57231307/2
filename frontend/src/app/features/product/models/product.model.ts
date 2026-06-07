import { 颜色变体状态 } from '@shared/enums/product.enums';

export interface 产品颜色变体 {
  id?: string;
  colorCode: string;
  colorName: string;
  colorHex?: string;
  price: number;
  status: 颜色变体状态;
  isDefault: boolean;
  productId?: string;
}

export interface 产品 {
  id?: string;
  code: string;
  name: string;
  type: string;
  status: string;
  unit: string;
  description?: string;
  imageUrls?: string[];
  patternId?: string;
  colorVariants: 产品颜色变体[];
}

export interface 分页结果<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface 产品查询参数 {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  code?: string;
  name?: string;
  type?: string;
  status?: string;
}
