import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SaleOrder,
  SaleOrderItem,
  DeliveryNote,
  DeliveryNoteItem,
  SaleReturn,
  SaleReturnItem,
  ColorVariant,
  Batch,
  Customer,
  PageResult,
  OrderQueryParams,
  DeliveryQueryParams,
  ReturnQueryParams,
  OrderStatus,
  SaleQuotation,
  SaleQuotationItem,
  QuotationQueryParams,
  QuotationStatus,
} from '../models/sale.model';

@Injectable({ providedIn: 'root' })
export class SaleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1';

  // ==================== 销售订单 ====================

  // 获取订单列表
  getOrders(params: OrderQueryParams): Observable<PageResult<SaleOrder>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate.toISOString());
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate.toISOString());
    return this.http.get<PageResult<SaleOrder>>(`${this.baseUrl}/sale-orders`, { params: httpParams });
  }

  // 获取订单详情
  getOrder(id: string): Observable<SaleOrder> {
    return this.http.get<SaleOrder>(`${this.baseUrl}/sale-orders/${id}`);
  }

  // 创建订单
  createOrder(order: Partial<SaleOrder>): Observable<SaleOrder> {
    return this.http.post<SaleOrder>(`${this.baseUrl}/sale-orders`, order);
  }

  // 更新订单
  updateOrder(id: string, order: Partial<SaleOrder>): Observable<SaleOrder> {
    return this.http.put<SaleOrder>(`${this.baseUrl}/sale-orders/${id}`, order);
  }

  // 更新订单状态
  updateOrderStatus(id: string, status: OrderStatus): Observable<SaleOrder> {
    return this.http.put<SaleOrder>(`${this.baseUrl}/sale-orders/${id}/status`, { status });
  }

  // 删除订单
  deleteOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sale-orders/${id}`);
  }

  // ==================== 发货单 ====================

  // 获取发货单列表
  getDeliveryNotes(params: DeliveryQueryParams): Observable<PageResult<DeliveryNote>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.orderId) httpParams = httpParams.set('orderId', params.orderId);
    return this.http.get<PageResult<DeliveryNote>>(`${this.baseUrl}/delivery-notes`, { params: httpParams });
  }

  // 获取发货单详情
  getDeliveryNote(id: string): Observable<DeliveryNote> {
    return this.http.get<DeliveryNote>(`${this.baseUrl}/delivery-notes/${id}`);
  }

  // 创建发货单
  createDeliveryNote(delivery: Partial<DeliveryNote>): Observable<DeliveryNote> {
    return this.http.post<DeliveryNote>(`${this.baseUrl}/delivery-notes`, delivery);
  }

  // 更新发货单
  updateDeliveryNote(id: string, delivery: Partial<DeliveryNote>): Observable<DeliveryNote> {
    return this.http.put<DeliveryNote>(`${this.baseUrl}/delivery-notes/${id}`, delivery);
  }

  // 确认发货
  confirmDelivery(id: string): Observable<DeliveryNote> {
    return this.http.post<DeliveryNote>(`${this.baseUrl}/delivery-notes/${id}/confirm`, {});
  }

  // 删除发货单
  deleteDeliveryNote(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delivery-notes/${id}`);
  }

  // ==================== 退货单 ====================

  // 获取退货单列表
  getReturns(params: ReturnQueryParams): Observable<PageResult<SaleReturn>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<PageResult<SaleReturn>>(`${this.baseUrl}/sale-returns`, { params: httpParams });
  }

  // 获取退货单详情
  getReturn(id: string): Observable<SaleReturn> {
    return this.http.get<SaleReturn>(`${this.baseUrl}/sale-returns/${id}`);
  }

  // 创建退货单
  createReturn(returnOrder: Partial<SaleReturn>): Observable<SaleReturn> {
    return this.http.post<SaleReturn>(`${this.baseUrl}/sale-returns`, returnOrder);
  }

  // 更新退货单
  updateReturn(id: string, returnOrder: Partial<SaleReturn>): Observable<SaleReturn> {
    return this.http.put<SaleReturn>(`${this.baseUrl}/sale-returns/${id}`, returnOrder);
  }

  // 删除退货单
  deleteReturn(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sale-returns/${id}`);
  }

  // ==================== 报价单 ====================

  // 获取报价单列表
  getQuotations(params: QuotationQueryParams): Observable<PageResult<SaleQuotation>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());
    if (params.keyword) httpParams = httpParams.set('search', params.keyword);
    if (params.customerId) httpParams = httpParams.set('customerId', params.customerId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate.toISOString());
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate.toISOString());
    return this.http.get<PageResult<SaleQuotation>>(`${this.baseUrl}/sale-quotations`, { params: httpParams });
  }

  // 获取报价单详情
  getQuotation(id: string): Observable<SaleQuotation> {
    return this.http.get<SaleQuotation>(`${this.baseUrl}/sale-quotations/${id}`);
  }

  // 创建报价单
  createQuotation(quotation: Partial<SaleQuotation>): Observable<SaleQuotation> {
    return this.http.post<SaleQuotation>(`${this.baseUrl}/sale-quotations`, quotation);
  }

  // 更新报价单
  updateQuotation(id: string, quotation: Partial<SaleQuotation>): Observable<SaleQuotation> {
    return this.http.put<SaleQuotation>(`${this.baseUrl}/sale-quotations/${id}`, quotation);
  }

  // 确认报价单
  confirmQuotation(id: string): Observable<SaleQuotation> {
    return this.http.post<SaleQuotation>(`${this.baseUrl}/sale-quotations/${id}/confirm`, {});
  }

  // 报价单转订单
  convertQuotationToOrder(id: string): Observable<SaleOrder> {
    return this.http.post<SaleOrder>(`${this.baseUrl}/sale-quotations/${id}/convert-to-order`, {});
  }

  // 取消报价单
  cancelQuotation(id: string): Observable<SaleQuotation> {
    return this.http.post<SaleQuotation>(`${this.baseUrl}/sale-quotations/${id}/cancel`, {});
  }

  // 删除报价单
  deleteQuotation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sale-quotations/${id}`);
  }

  // ==================== 辅助接口 ====================

  // 获取颜色变体列表
  getColorVariants(productId?: string): Observable<ColorVariant[]> {
    let httpParams = new HttpParams();
    if (productId) httpParams = httpParams.set('productId', productId);
    return this.http.get<ColorVariant[]>(`${this.baseUrl}/color-variants`, { params: httpParams });
  }

  // 根据订单获取已发货数量
  getDeliveredQuantity(orderId: string, colorVariantId: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/sale-orders/${orderId}/delivered-quantity`, {
      params: { colorVariantId },
    });
  }

  // 获取批次列表
  getBatches(colorVariantId: string): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${this.baseUrl}/batches`, {
      params: { colorVariantId },
    });
  }

  // 获取客户列表
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.baseUrl}/customers`);
  }
}
