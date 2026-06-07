import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ProductionOrder,
  ProductionOrderItem,
  ProductionOrderStatus,
  ProductionOrderQueryParams,
  MaterialRequisition,
  MaterialRequisitionItem,
  RequisitionStatus,
  RequisitionQueryParams,
  ProductionReceipt,
  ProductionReceiptItem,
  ProductionReceiptStatus,
  ReceiptQueryParams,
  PageResult,
  Product,
  ColorVariant,
  Warehouse,
} from '../models/production.model';
import {
  ProcessRoute,
  ProcessStep,
  ProcessRouteStatus,
  ProcessRouteQueryParams,
  DispatchStatus,
  DispatchQueryParams,
  WorkOrderDispatch,
  CreateProcessRouteParams,
  CreateDispatchParams,
  CompleteDispatchParams,
} from '../models/process-route.model';
import {
  工序汇报,
  工序汇报查询参数,
  工序汇报分页结果,
  创建工序汇报参数,
} from '../models/process-report.model';

@Injectable({ providedIn: 'root' })
export class ProductionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1';

  // ==================== 生产工单 ====================

  // 获取工单列表
  getOrders(params: ProductionOrderQueryParams): Observable<PageResult<ProductionOrder>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.priority) httpParams = httpParams.set('priority', params.priority);
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate.toISOString());
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate.toISOString());
    return this.http.get<PageResult<ProductionOrder>>(`${this.baseUrl}/production-orders`, { params: httpParams });
  }

  // 获取工单详情
  getOrder(id: string): Observable<ProductionOrder> {
    return this.http.get<ProductionOrder>(`${this.baseUrl}/production-orders/${id}`);
  }

  // 创建工单
  createOrder(order: Partial<ProductionOrder>): Observable<ProductionOrder> {
    return this.http.post<ProductionOrder>(`${this.baseUrl}/production-orders`, order);
  }

  // 更新工单
  updateOrder(id: string, order: Partial<ProductionOrder>): Observable<ProductionOrder> {
    return this.http.put<ProductionOrder>(`${this.baseUrl}/production-orders/${id}`, order);
  }

  // 更新工单状态
  updateOrderStatus(id: string, status: ProductionOrderStatus): Observable<ProductionOrder> {
    return this.http.put<ProductionOrder>(`${this.baseUrl}/production-orders/${id}/status`, { status });
  }

  // 删除工单
  deleteOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/production-orders/${id}`);
  }

  // ==================== 领料单 ====================

  // 获取领料单列表
  getRequisitions(params: RequisitionQueryParams): Observable<PageResult<MaterialRequisition>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.productionOrderId) httpParams = httpParams.set('productionOrderId', params.productionOrderId);
    return this.http.get<PageResult<MaterialRequisition>>(`${this.baseUrl}/material-requisitions`, { params: httpParams });
  }

  // 获取领料单详情
  getRequisition(id: string): Observable<MaterialRequisition> {
    return this.http.get<MaterialRequisition>(`${this.baseUrl}/material-requisitions/${id}`);
  }

  // 创建领料单
  createRequisition(requisition: Partial<MaterialRequisition>): Observable<MaterialRequisition> {
    return this.http.post<MaterialRequisition>(`${this.baseUrl}/material-requisitions`, requisition);
  }

  // 更新领料单
  updateRequisition(id: string, requisition: Partial<MaterialRequisition>): Observable<MaterialRequisition> {
    return this.http.put<MaterialRequisition>(`${this.baseUrl}/material-requisitions/${id}`, requisition);
  }

  // 删除领料单
  deleteRequisition(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/material-requisitions/${id}`);
  }

  // ==================== 生产入库单 ====================

  // 获取入库单列表
  getReceipts(params: ReceiptQueryParams): Observable<PageResult<ProductionReceipt>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.productionOrderId) httpParams = httpParams.set('productionOrderId', params.productionOrderId);
    return this.http.get<PageResult<ProductionReceipt>>(`${this.baseUrl}/production-receipts`, { params: httpParams });
  }

  // 获取入库单详情
  getReceipt(id: string): Observable<ProductionReceipt> {
    return this.http.get<ProductionReceipt>(`${this.baseUrl}/production-receipts/${id}`);
  }

  // 创建入库单
  createReceipt(receipt: Partial<ProductionReceipt>): Observable<ProductionReceipt> {
    return this.http.post<ProductionReceipt>(`${this.baseUrl}/production-receipts`, receipt);
  }

  // 更新入库单
  updateReceipt(id: string, receipt: Partial<ProductionReceipt>): Observable<ProductionReceipt> {
    return this.http.put<ProductionReceipt>(`${this.baseUrl}/production-receipts/${id}`, receipt);
  }

  // 删除入库单
  deleteReceipt(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/production-receipts/${id}`);
  }

  // ==================== 工艺路线 ====================

  // 获取工艺路线列表
  getProcessRoutes(params: ProcessRouteQueryParams): Observable<PageResult<ProcessRoute>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());
    if (params.routeNo) httpParams = httpParams.set('routeNo', params.routeNo);
    if (params.routeName) httpParams = httpParams.set('routeName', params.routeName);
    if (params.productType) httpParams = httpParams.set('productType', params.productType);
    if (params.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<PageResult<ProcessRoute>>(`${this.baseUrl}/process-routes`, { params: httpParams });
  }

  // 获取工艺路线详情
  getProcessRoute(id: string): Observable<ProcessRoute> {
    return this.http.get<ProcessRoute>(`${this.baseUrl}/process-routes/${id}`);
  }

  // 创建工艺路线
  createProcessRoute(route: CreateProcessRouteParams): Observable<ProcessRoute> {
    return this.http.post<ProcessRoute>(`${this.baseUrl}/process-routes`, route);
  }

  // 更新工艺路线
  updateProcessRoute(id: string, route: Partial<ProcessRoute>): Observable<ProcessRoute> {
    return this.http.put<ProcessRoute>(`${this.baseUrl}/process-routes/${id}`, route);
  }

  // 激活工艺路线
  activateProcessRoute(id: string): Observable<ProcessRoute> {
    return this.http.post<ProcessRoute>(`${this.baseUrl}/process-routes/${id}/activate`, {});
  }

  // 废弃工艺路线
  deprecateProcessRoute(id: string): Observable<ProcessRoute> {
    return this.http.post<ProcessRoute>(`${this.baseUrl}/process-routes/${id}/deprecate`, {});
  }

  // 添加工序
  addProcessStep(routeId: string, step: any): Observable<ProcessRoute> {
    return this.http.post<ProcessRoute>(`${this.baseUrl}/process-routes/${routeId}/steps`, step);
  }

  // 删除工序
  removeProcessStep(routeId: string, stepId: string): Observable<ProcessRoute> {
    return this.http.delete<ProcessRoute>(`${this.baseUrl}/process-routes/${routeId}/steps/${stepId}`);
  }

  // 调整工序顺序
  reorderProcessSteps(routeId: string, stepIds: string[]): Observable<ProcessRoute> {
    return this.http.post<ProcessRoute>(`${this.baseUrl}/process-routes/${routeId}/steps/reorder`, { stepIds });
  }

  // 更新工序参数
  updateStepParameters(stepId: string, params: Record<string, any>): Observable<ProcessStep> {
    return this.http.put<ProcessStep>(`${this.baseUrl}/process-routes/steps/${stepId}/parameters`, params);
  }

  // ==================== 派工单 ====================

  // 获取派工单列表
  getDispatches(params: DispatchQueryParams): Observable<PageResult<WorkOrderDispatch>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());
    if (params.dispatchNo) httpParams = httpParams.set('dispatchNo', params.dispatchNo);
    if (params.productionOrderId) httpParams = httpParams.set('productionOrderId', params.productionOrderId);
    if (params.stepId) httpParams = httpParams.set('stepId', params.stepId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.dispatchDateFrom) httpParams = httpParams.set('dispatchDateFrom', params.dispatchDateFrom.toISOString());
    if (params.dispatchDateTo) httpParams = httpParams.set('dispatchDateTo', params.dispatchDateTo.toISOString());
    return this.http.get<PageResult<WorkOrderDispatch>>(`${this.baseUrl}/work-order-dispatches`, { params: httpParams });
  }

  // 获取派工单详情
  getDispatch(id: string): Observable<WorkOrderDispatch> {
    return this.http.get<WorkOrderDispatch>(`${this.baseUrl}/work-order-dispatches/${id}`);
  }

  // 创建派工单
  createDispatch(dispatch: CreateDispatchParams): Observable<WorkOrderDispatch> {
    return this.http.post<WorkOrderDispatch>(`${this.baseUrl}/work-order-dispatches`, dispatch);
  }

  // 更新派工单
  updateDispatch(id: string, dispatch: Partial<WorkOrderDispatch>): Observable<WorkOrderDispatch> {
    return this.http.put<WorkOrderDispatch>(`${this.baseUrl}/work-order-dispatches/${id}`, dispatch);
  }

  // 确认派工
  confirmDispatch(id: string): Observable<WorkOrderDispatch> {
    return this.http.post<WorkOrderDispatch>(`${this.baseUrl}/work-order-dispatches/${id}/dispatch`, {});
  }

  // 开始生产
  startDispatch(id: string): Observable<WorkOrderDispatch> {
    return this.http.post<WorkOrderDispatch>(`${this.baseUrl}/work-order-dispatches/${id}/start`, {});
  }

  // 完成生产
  completeDispatch(id: string, data: CompleteDispatchParams): Observable<WorkOrderDispatch> {
    return this.http.post<WorkOrderDispatch>(`${this.baseUrl}/work-order-dispatches/${id}/complete`, data);
  }

  // 取消派工
  cancelDispatch(id: string): Observable<WorkOrderDispatch> {
    return this.http.post<WorkOrderDispatch>(`${this.baseUrl}/work-order-dispatches/${id}/cancel`, {});
  }

  // ==================== 辅助接口 ====================

  // 获取产品列表
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  // 获取颜色变体列表
  getColorVariants(productId?: string): Observable<ColorVariant[]> {
    let httpParams = new HttpParams();
    if (productId) httpParams = httpParams.set('productId', productId);
    return this.http.get<ColorVariant[]>(`${this.baseUrl}/color-variants`, { params: httpParams });
  }

  // 获取仓库列表
  getWarehouses(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(`${this.baseUrl}/warehouses`);
  }

  // 获取原材料列表（用于领料）
  getRawMaterials(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/raw-materials`);
  }

  // ==================== 工序汇报 ====================

  // 获取工序汇报列表
  getProcessReports(params: 工序汇报查询参数): Observable<工序汇报分页结果> {
    let httpParams = new HttpParams()
      .set('page', (params.page || 1).toString())
      .set('limit', (params.pageSize || 20).toString());
    if (params.dispatchId) httpParams = httpParams.set('dispatchId', params.dispatchId);
    if (params.stepId) httpParams = httpParams.set('stepId', params.stepId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<工序汇报分页结果>(`${this.baseUrl}/process-reports`, { params: httpParams });
  }

  // 获取工序汇报详情
  getProcessReport(id: string): Observable<工序汇报> {
    return this.http.get<工序汇报>(`${this.baseUrl}/process-reports/${id}`);
  }

  // 创建工序汇报
  createProcessReport(report: 创建工序汇报参数): Observable<工序汇报> {
    return this.http.post<工序汇报>(`${this.baseUrl}/process-reports`, report);
  }

  // 更新工序汇报
  updateProcessReport(id: string, report: Partial<创建工序汇报参数>): Observable<工序汇报> {
    return this.http.put<工序汇报>(`${this.baseUrl}/process-reports/${id}`, report);
  }

  // 删除工序汇报
  deleteProcessReport(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/process-reports/${id}`);
  }

  // 提交工序汇报
  submitProcessReport(id: string): Observable<工序汇报> {
    return this.http.post<工序汇报>(`${this.baseUrl}/process-reports/${id}/submit`, {});
  }

  // 确认工序汇报
  confirmProcessReport(id: string): Observable<工序汇报> {
    return this.http.post<工序汇报>(`${this.baseUrl}/process-reports/${id}/confirm`, {});
  }

  // 获取派工单列表（用于选择）
  getDispatchesForReport(params: DispatchQueryParams): Observable<PageResult<WorkOrderDispatch>> {
    let httpParams = new HttpParams()
      .set('page', (params.page || 1).toString())
      .set('pageSize', (params.pageSize || 100).toString());
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.productionOrderId) httpParams = httpParams.set('productionOrderId', params.productionOrderId);
    return this.http.get<PageResult<WorkOrderDispatch>>(`${this.baseUrl}/work-order-dispatches`, { params: httpParams });
  }
}
