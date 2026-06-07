import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderStatus,
  PurchaseOrderQueryParams,
  GoodsReceipt,
  GoodsReceiptItem,
  ReceiptStatus,
  GoodsReceiptQueryParams,
  PurchaseReturn,
  PurchaseReturnItem,
  PurchaseReturnStatus,
  PurchaseReturnQueryParams,
  PageResult,
  Supplier,
  Product,
  ColorVariant,
  Warehouse,
  Batch,
} from '../models/purchase.model';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1';

  // ==================== 采购订单 ====================

  // 获取采购订单列表
  getOrders(params: PurchaseOrderQueryParams): Observable<PageResult<PurchaseOrder>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.supplierId) httpParams = httpParams.set('supplierId', params.supplierId);
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate.toISOString());
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate.toISOString());
    return this.http.get<PageResult<PurchaseOrder>>(`${this.baseUrl}/purchase-orders`, { params: httpParams });
  }

  // 获取采购订单详情
  getOrder(id: string): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.baseUrl}/purchase-orders/${id}`);
  }

  // 创建采购订单
  createOrder(order: Partial<PurchaseOrder>): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.baseUrl}/purchase-orders`, order);
  }

  // 更新采购订单
  updateOrder(id: string, order: Partial<PurchaseOrder>): Observable<PurchaseOrder> {
    return this.http.put<PurchaseOrder>(`${this.baseUrl}/purchase-orders/${id}`, order);
  }

  // 更新采购订单状态
  updateOrderStatus(id: string, status: PurchaseOrderStatus): Observable<PurchaseOrder> {
    return this.http.put<PurchaseOrder>(`${this.baseUrl}/purchase-orders/${id}/status`, { status });
  }

  // 删除采购订单
  deleteOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/purchase-orders/${id}`);
  }

  // ==================== 入库单 ====================

  // 获取入库单列表
  getReceipts(params: GoodsReceiptQueryParams): Observable<PageResult<GoodsReceipt>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.orderId) httpParams = httpParams.set('orderId', params.orderId);
    return this.http.get<PageResult<GoodsReceipt>>(`${this.baseUrl}/goods-receipts`, { params: httpParams });
  }

  // 获取入库单详情
  getReceipt(id: string): Observable<GoodsReceipt> {
    return this.http.get<GoodsReceipt>(`${this.baseUrl}/goods-receipts/${id}`);
  }

  // 创建入库单
  createReceipt(receipt: Partial<GoodsReceipt>): Observable<GoodsReceipt> {
    return this.http.post<GoodsReceipt>(`${this.baseUrl}/goods-receipts`, receipt);
  }

  // 更新入库单
  updateReceipt(id: string, receipt: Partial<GoodsReceipt>): Observable<GoodsReceipt> {
    return this.http.put<GoodsReceipt>(`${this.baseUrl}/goods-receipts/${id}`, receipt);
  }

  // 确认入库
  confirmReceipt(id: string): Observable<GoodsReceipt> {
    return this.http.post<GoodsReceipt>(`${this.baseUrl}/goods-receipts/${id}/confirm`, {});
  }

  // 删除入库单
  deleteReceipt(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/goods-receipts/${id}`);
  }

  // ==================== 退货单 ====================

  // 获取退货单列表
  getReturns(params: PurchaseReturnQueryParams): Observable<PageResult<PurchaseReturn>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<PageResult<PurchaseReturn>>(`${this.baseUrl}/purchase-returns`, { params: httpParams });
  }

  // 获取退货单详情
  getReturn(id: string): Observable<PurchaseReturn> {
    return this.http.get<PurchaseReturn>(`${this.baseUrl}/purchase-returns/${id}`);
  }

  // 创建退货单
  createReturn(purchaseReturn: Partial<PurchaseReturn>): Observable<PurchaseReturn> {
    return this.http.post<PurchaseReturn>(`${this.baseUrl}/purchase-returns`, purchaseReturn);
  }

  // 更新退货单
  updateReturn(id: string, purchaseReturn: Partial<PurchaseReturn>): Observable<PurchaseReturn> {
    return this.http.put<PurchaseReturn>(`${this.baseUrl}/purchase-returns/${id}`, purchaseReturn);
  }

  // 删除退货单
  deleteReturn(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/purchase-returns/${id}`);
  }

  // ==================== 辅助接口 ====================

  // 获取供应商列表
  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.baseUrl}/suppliers`);
  }

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

  // 获取批次列表
  getBatches(colorVariantId: string): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${this.baseUrl}/batches`, {
      params: { colorVariantId },
    });
  }

  // 根据订单获取已入库数量
  getReceivedQuantity(orderId: string, colorVariantId: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/purchase-orders/${orderId}/received-quantity`, {
      params: { colorVariantId },
    });
  }
}
