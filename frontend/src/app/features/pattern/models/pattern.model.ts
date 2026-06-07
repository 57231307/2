import { 花型风格, 花型用途, 花型状态, 版权状态, 续期状态 } from '../enums/pattern.enum';

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

export interface 分页结果<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
