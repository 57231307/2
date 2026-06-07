// 供应商评估等级枚举
export enum SupplierEvaluationLevel {
  A = 'A',  // 优秀
  B = 'B',  // 良好
  C = 'C',  // 一般
  D = 'D',  // 较差
}

// 评估项目类型枚举
export enum EvaluationItemType {
  质量 = '质量',    // 质量评估
  交期 = '交期',    // 交期评估
  价格 = '价格',    // 价格评估
  服务 = '服务',    // 服务评估
}

// 评估明细模型
export interface EvaluationItem {
  id?: string;
  itemName: string;
  itemType: EvaluationItemType;
  score: number;
  description?: string;
}

// 供应商评估模型
export interface SupplierEvaluation {
  id: string;
  evaluationNo: string;
  supplierId: string;
  supplierName: string;
  evaluationDate: Date;
  evaluator: string;
  qualityScore: number;
  deliveryScore: number;
  priceScore: number;
  serviceScore: number;
  totalScore: number;
  level: SupplierEvaluationLevel;
  conclusion?: string;
  notes?: string;
  items: EvaluationItem[];
}

// 供应商评估查询参数
export interface SupplierEvaluationQueryParams {
  page: number;
  pageSize: number;
  supplierId?: string;
  evaluator?: string;
  level?: SupplierEvaluationLevel;
  evaluationDateFrom?: Date;
  evaluationDateTo?: Date;
}

// 供应商平均评分
export interface SupplierAverageScores {
  avgQualityScore: number;
  avgDeliveryScore: number;
  avgPriceScore: number;
  avgServiceScore: number;
  avgTotalScore: number;
  totalEvaluations: number;
}
