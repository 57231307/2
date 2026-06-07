// 质检标准相关枚举
export enum InspectionType {
  外观检验 = '外观检验',
  物理性能检验 = '物理性能检验',
  化学性能检验 = '化学性能检验',
  综合检验 = '综合检验'
}

export enum QualityStandardStatus {
  启用 = '启用',
  停用 = '停用'
}

export enum InspectionResult {
  合格 = '合格',
  不合格 = '不合格',
  让步接收 = '让步接收'
}

// 质检标准项
export interface QualityStandardItem {
  id: string;
  itemName: string;
  checkMethod: string;
  qualifiedRange: string;
  unit?: string;
}

// 质检标准
export interface QualityStandard {
  id: string;
  code: string;
  name: string;
  type: InspectionType;
  items: QualityStandardItem[];
  status: QualityStandardStatus;
  createTime: Date;
  updateTime?: Date;
}

// 创建质检标准请求
export interface CreateQualityStandardRequest {
  code: string;
  name: string;
  type: InspectionType;
  items: Omit<QualityStandardItem, 'id'>[];
}

// 更新质检标准请求
export interface UpdateQualityStandardRequest extends CreateQualityStandardRequest {
  status: QualityStandardStatus;
}

// 质检报告检验项
export interface QualityInspectionItem {
  id: string;
  itemName: string;
  checkMethod: string;
  actualValue: string;
  qualifiedRange: string;
  unit?: string;
  isQualified: boolean;
}

// 质检报告
export interface QualityInspection {
  id: string;
  reportNo: string;
  batchId: string;
  batchCode: string;
  dyeLotNo: string;
  pieceNo: string;
  standardId: string;
  standardName: string;
  inspectionDate: Date;
  inspector: string;
  result: InspectionResult;
  items: QualityInspectionItem[];
  notes?: string;
  createTime: Date;
}

// 创建质检报告请求
export interface CreateQualityInspectionRequest {
  batchId: string;
  standardId: string;
  inspectionDate: Date;
  inspector: string;
  result: InspectionResult;
  items: {
    itemName: string;
    checkMethod: string;
    actualValue: string;
    qualifiedRange: string;
    unit?: string;
    isQualified: boolean;
  }[];
  notes?: string;
}

// 质检查询参数
export interface QualityInspectionQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  result?: InspectionResult;
  startDate?: Date;
  endDate?: Date;
}

// 质检标准查询参数
export interface QualityStandardQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  type?: InspectionType;
  status?: QualityStandardStatus;
}

// 分页结果
export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}