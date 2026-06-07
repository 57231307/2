import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InventoryCheck {
  id: string;
  checkNo: string;
  warehouseId: string;
  checkType: string;
  status: string;
  checkDate: string;
  manager?: string;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  items?: InventoryCheckItem[];
}

export interface InventoryCheckItem {
  id: string;
  inventoryCheckId: string;
  batchId: string;
  colorVariantId?: string;
  bookQuantity: number;
  actualQuantity: number;
  differenceQuantity: number;
  differenceAmount: number;
  notes?: string;
}

export interface CreateCheckDto {
  warehouseId: string;
  checkType: string;
  checkDate: string;
  manager?: string;
  notes?: string;
  batchIds?: string[];
}

export interface UpdateCheckDto {
  checkType?: string;
  checkDate?: string;
  manager?: string;
  notes?: string;
}

/**
 * 盘点单表单数据（用于新建和编辑）
 */
export interface CheckFormData {
  warehouseId: string;
  checkType: string;
  checkDate: string;
  manager?: string;
  notes?: string;
  batchIds?: string[];
}

export interface SubmitCheckDto {
  items: {
    batchId: string;
    actualQuantity: number;
    notes?: string;
  }[];
}

export interface ApproveCheckDto {
  approved: boolean;
  notes?: string;
}

export interface QueryCheckParams {
  warehouseId?: string;
  status?: string;
  checkType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface 盘点报告 {
  checkId: string;
  checkNo: string;
  checkDate: Date;
  warehouseName: string;
  checkType: string;
  status: string;
  manager: string;
  completedAt: Date;
  summary: {
    totalBookQuantity: number;
    totalActualQuantity: number;
    totalDifferenceQuantity: number;
    totalDifferenceAmount: number;
    itemCount: number;
    qualifiedRate: number;
  };
  items: {
    batchNo: string;
    productName: string;
    colorName: string;
    unit: string;
    bookQuantity: number;
    actualQuantity: number;
    differenceQuantity: number;
    differenceAmount: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class InventoryCheckService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/inventory-checks';

  getChecks(params?: QueryCheckParams): Observable<{ data: InventoryCheck[]; total: number; page: number; limit: number }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<{ data: InventoryCheck[]; total: number; page: number; limit: number }>(this.baseUrl, { params: httpParams });
  }

  getCheckById(id: string): Observable<InventoryCheck> {
    return this.http.get<InventoryCheck>(`${this.baseUrl}/${id}`);
  }

  createCheck(data: CreateCheckDto): Observable<InventoryCheck> {
    return this.http.post<InventoryCheck>(this.baseUrl, data);
  }

  updateCheck(id: string, data: UpdateCheckDto): Observable<InventoryCheck> {
    return this.http.put<InventoryCheck>(`${this.baseUrl}/${id}`, data);
  }

  submitCheck(id: string, items: SubmitCheckDto['items']): Observable<InventoryCheck> {
    return this.http.post<InventoryCheck>(`${this.baseUrl}/${id}/submit`, { items });
  }

  approveCheck(id: string, approved: boolean, notes?: string): Observable<InventoryCheck> {
    return this.http.post<InventoryCheck>(`${this.baseUrl}/${id}/approve`, { approved, notes });
  }

  completeCheck(id: string): Observable<InventoryCheck> {
    return this.http.post<InventoryCheck>(`${this.baseUrl}/${id}/complete`, {});
  }

  deleteCheck(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getReport(id: string): Observable<盘点报告> {
    return this.http.get<盘点报告>(`${this.baseUrl}/${id}/report`);
  }
}
