import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { 供应商, 供应商查询参数, 分页结果 } from '../models/supplier.model';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private readonly api = inject(ApiService);
  private readonly basePath = '/v1/suppliers';

  获取供应商列表(params: 供应商查询参数): Observable<分页结果<供应商>> {
    return this.api.get<分页结果<供应商>>(this.basePath, {
      params: params as Record<string, string | number | boolean>
    });
  }

  获取供应商ById(id: string): Observable<供应商> {
    return this.api.get<供应商>(`${this.basePath}/${id}`);
  }

  创建供应商(supplier: Omit<供应商, 'id'>): Observable<供应商> {
    return this.api.post<供应商>(this.basePath, supplier);
  }

  更新供应商(id: string, supplier: Partial<供应商>): Observable<供应商> {
    return this.api.put<供应商>(`${this.basePath}/${id}`, supplier);
  }

  删除供应商(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }
}
