import { 花型风格, 花型用途, 花型状态, 版权状态, 续期状态 } from '../enums/pattern.enum';

/**
 * 花型设计状态枚举
 */
export enum 花型设计状态 {
  草稿 = '草稿',
  待审核 = '待审核',
  已审核 = '已审核',
  已归档 = '已归档',
}

/**
 * 花型版权
 */
export interface 花型版权 {
  id?: string;
  patternId: string;
  copyrightNo: string;
  startDate: Date;
  endDate: Date;
  authorizedScope?: string;
  status: 版权状态;
  renewalStatus?: 续期状态;
}

/**
 * 花型
 */
export interface 花型 {
  id?: string;
  code: string;
  name: string;
  style: 花型风格;
  usage: 花型用途;
  category?: string;
  imageUrls?: string[];
  status: 花型状态;
  usageCount: number;
  copyright?: 花型版权;
}

/**
 * 花型设计
 */
export interface 花型设计 {
  id: string;
  designNo: string;
  patternId: string;
  patternName: string;
  patternCode: string;
  designName: string;
  designVersion: string;
  status: 花型设计状态;
  designer: string;
  designDate: Date;
  auditor?: string;
  auditTime?: Date;
  auditRemark?: string;
  description?: string;
  designImages: string[];
  colorScheme?: any[];
  designFileUrl?: string;
  remark?: string;
}

/**
 * 花型查询参数
 */
export interface 花型查询参数 {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  code?: string;
  name?: string;
  style?: string;
  usage?: string;
  status?: string;
}

/**
 * 花型设计查询参数
 */
export interface 花型设计查询参数 {
  page: number;
  pageSize: number;
  keyword?: string;
  patternId?: string;
  designer?: string;
  status?: 花型设计状态;
  designDateFrom?: Date;
  designDateTo?: Date;
}

/**
 * 分页结果
 */
export interface 分页结果<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
