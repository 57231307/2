import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryTransfer, CreateTransferDto, CancelTransferDto, QueryTransferParams } from '../models/transfer.model';

@Injectable({ providedIn: 'root' })
export class InventoryTransferService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/inventory-transfers';

  /**
   * 获取调拨单列表
   */
  getTransfers(params?: QueryTransferParams): Observable<{ data: InventoryTransfer[]; total: number; page: number; limit: number }> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.warehouseId) httpParams = httpParams.set('warehouseId', params.warehouseId);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
      if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    }
    return this.http.get<{ data: InventoryTransfer[]; total: number; page: number; limit: number }>(this.baseUrl, { params: httpParams });
  }

  /**
   * 获取调拨单详情
   */
  getTransferById(id: string): Observable<InventoryTransfer> {
    return this.http.get<InventoryTransfer>(`${this.baseUrl}/${id}`);
  }

  /**
   * 创建调拨单
   */
  createTransfer(request: CreateTransferDto): Observable<InventoryTransfer> {
    return this.http.post<InventoryTransfer>(this.baseUrl, request);
  }

  /**
   * 调出确认
   */
  dispatch(id: string, operator?: string, remark?: string): Observable<InventoryTransfer> {
    let httpParams = new HttpParams();
    if (operator) httpParams = httpParams.set('operator', operator);
    if (remark) httpParams = httpParams.set('remark', remark);
    return this.http.post<InventoryTransfer>(`${this.baseUrl}/${id}/dispatch`, {}, { params: httpParams });
  }

  /**
   * 调入确认
   */
  receive(id: string, operator?: string, remark?: string): Observable<InventoryTransfer> {
    let httpParams = new HttpParams();
    if (operator) httpParams = httpParams.set('operator', operator);
    if (remark) httpParams = httpParams.set('remark', remark);
    return this.http.post<InventoryTransfer>(`${this.baseUrl}/${id}/receive`, {}, { params: httpParams });
  }

  /**
   * 取消调拨
   */
  cancel(id: string, request: CancelTransferDto): Observable<InventoryTransfer> {
    return this.http.post<InventoryTransfer>(`${this.baseUrl}/${id}/cancel`, request);
  }
}
