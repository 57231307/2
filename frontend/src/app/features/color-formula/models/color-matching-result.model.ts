/**
 * 配色结果模型
 */
export interface 配色结果 {
  id: string;
  resultNo: string;
  formulaId: string;
  customerId: string;
  matchingDate: Date;
  matchingPerson: string;
  targetColor: string;
  actualColor: string;
  colorDifference: number;
  isQualified: boolean;
  adjustmentRecord?: string;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
  formula?: {
    id: string;
    code: string;
    name: string;
  };
  customer?: {
    id: string;
    code: string;
    name: string;
  };
}

/**
 * 配色结果查询参数
 */
export interface 配色结果查询参数 {
  formulaId?: string;
  customerId?: string;
  isQualified?: boolean | null;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * 配色结果分页结果
 */
export interface 配色结果分页结果 {
  items: 配色结果[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 创建配色结果参数
 */
export interface 创建配色结果参数 {
  formulaId: string;
  customerId: string;
  matchingDate: string;
  matchingPerson: string;
  targetColor: string;
  actualColor: string;
  colorDifference: number;
  isQualified: boolean;
  adjustmentRecord?: string;
  remark?: string;
}
