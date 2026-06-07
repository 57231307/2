// 工艺路线状态枚举
export enum ProcessRouteStatus {
  草稿 = 'draft',
  生效 = 'active',
  废弃 = 'deprecated',
}

// 工序类型枚举
export enum StepType {
  染色 = 'dyeing',
  定型 = 'setting',
  裁剪 = 'cutting',
  缝制 = 'sewing',
  包装 = 'packaging',
  印花 = 'printing',
  蒸化 = 'steaming',
  水洗 = 'washing',
  熨烫 = 'ironing',
  检验 = 'inspecting',
  其他 = 'other',
}

// 派工状态枚举
export enum DispatchStatus {
  待派工 = 'pending',
  已派工 = 'dispatched',
  生产中 = 'in_production',
  已完成 = 'completed',
  已取消 = 'cancelled',
}

// 工序模型
export interface ProcessStep {
  id: string;
  stepNo: string;
  stepName: string;
  routeId: string;
  sequence: number;
  standardHours: number;
  standardPrice: number;
  stepType: string;
  parameters?: Record<string, any>;
  notes?: string;
}

// 工艺路线模型
export interface ProcessRoute {
  id: string;
  routeNo: string;
  routeName: string;
  productType: string;
  version: string;
  status: ProcessRouteStatus;
  totalProcesses: number;
  totalStandardHours: number;
  notes?: string;
  steps: ProcessStep[];
}

// 派工单模型
export interface WorkOrderDispatch {
  id: string;
  dispatchNo: string;
  productionOrderId: string;
  productionOrderNo?: string;
  stepId: string;
  stepName?: string;
  quantity: number;
  dispatchDate: Date;
  workerGroup: string;
  status: DispatchStatus;
  actualHours?: number;
  goodQuantity: number;
  defectQuantity: number;
  notes?: string;
  startTime?: Date;
  endTime?: Date;
}

// 工艺路线查询参数
export interface ProcessRouteQueryParams {
  page: number;
  pageSize: number;
  routeNo?: string;
  routeName?: string;
  productType?: string;
  status?: ProcessRouteStatus;
}

// 派工单查询参数
export interface DispatchQueryParams {
  page: number;
  pageSize: number;
  dispatchNo?: string;
  productionOrderId?: string;
  stepId?: string;
  status?: DispatchStatus;
  dispatchDateFrom?: Date;
  dispatchDateTo?: Date;
}

// 创建工艺路线参数
export interface CreateProcessRouteParams {
  routeName: string;
  productType: string;
  version?: string;
  notes?: string;
  steps?: CreateProcessStepParams[];
}

// 创建工序参数
export interface CreateProcessStepParams {
  stepNo: string;
  stepName: string;
  sequence: number;
  standardHours: number;
  standardPrice: number;
  stepType: string;
  parameters?: Record<string, any>;
  notes?: string;
}

// 创建派工参数
export interface CreateDispatchParams {
  productionOrderId: string;
  stepId: string;
  quantity: number;
  dispatchDate: Date;
  workerGroup: string;
  notes?: string;
}

// 完成派工参数
export interface CompleteDispatchParams {
  goodQuantity: number;
  defectQuantity?: number;
  actualHours?: number;
  notes?: string;
}

// 分页结果
export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
