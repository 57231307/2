import { 配方状态 } from '../enums/color-formula.enum';

export interface 配方明细项 {
  id?: string;
  materialId: string;
  materialName: string;
  proportion: number;    // 百分比
  dosage: number;        // 用量
  unit: string;
}

export interface 色差记录 {
  id?: string;
  formulaId: string;
  checkDate: Date;
  labValue: { l: number; a: number; b: number };
  deltaE: number;
  grade: string;
  isQualified: boolean;
}

export interface 颜色配方 {
  id?: string;
  code: string;
  name: string;
  targetColorVariantId: string;
  targetColorName: string;
  version: number;
  status: 配方状态;
  items: 配方明细项[];
  totalAmount: number;
  notes?: string;
}

export interface 颜色配方查询参数 {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  code?: string;
  name?: string;
  status?: string;
}

export interface 分页结果<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface 色差检测请求 {
  formulaId: string;
  labValue: { l: number; a: number; b: number };
}

export interface 色差检测结果 {
  deltaE: number;
  grade: string;
  isQualified: boolean;
}
