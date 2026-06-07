import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { 客户, 客户查询参数, 分页结果 } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly api = inject(ApiService);
  private readonly basePath = '/v1/customers';

  获取客户列表(params: 客户查询参数): Observable<分页结果<客户>> {
    return this.api.get<分页结果<客户>>(this.basePath, {
      params: params as Record<string, string | number | boolean>
    });
  }

  获取客户ById(id: string): Observable<客户> {
    return this.api.get<客户>(`${this.basePath}/${id}`);
  }

  创建客户(customer: Omit<客户, 'id'>): Observable<客户> {
    return this.api.post<客户>(this.basePath, customer);
  }

  更新客户(id: string, customer: Partial<客户>): Observable<客户> {
    return this.api.put<客户>(`${this.basePath}/${id}`, customer);
  }

  删除客户(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }
}
