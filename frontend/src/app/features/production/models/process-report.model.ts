/**
 * 工序汇报状态枚举
 */
export enum 工序汇报状态 {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  CONFIRMED = 'CONFIRMED',
}

/**
 * 工序汇报状态显示映射
 */
export const 工序汇报状态显示: Record<工序汇报状态, string> = {
  [工序汇报状态.DRAFT]: '草稿',
  [工序汇报状态.SUBMITTED]: '已提交',
  [工序汇报状态.CONFIRMED]: '已确认',
};

/**
 * 工序汇报模型
 */
export interface 工序汇报 {
  id: string;
  reportNo: string;
  dispatchId: string;
  stepId: string;
  reportDate: Date;
  qualifiedQuantity: number;
  defectiveQuantity: number;
  defectReason?: string;
  status: 工序汇报状态;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
  dispatch?: {
    id: string;
    dispatchNo: string;
    productionOrderId: string;
  };
  step?: {
    id: string;
    stepNo: string;
    stepName: string;
  };
}

/**
 * 工序汇报查询参数
 */
export interface 工序汇报查询参数 {
  dispatchId?: string;
  stepId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * 工序汇报分页结果
 */
export interface 工序汇报分页结果 {
  items: 工序汇报[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 创建工序汇报参数
 */
export interface 创建工序汇报参数 {
  dispatchId: string;
  stepId: string;
  reportDate: string;
  qualifiedQuantity: number;
  defectiveQuantity: number;
  defectReason?: string;
  remark?: string;
}
