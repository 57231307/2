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
}
