import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { 客户联系人, 客户联系人查询参数, 客户联系人分页结果 } from '../models/customer-contact.model';

@Injectable({ providedIn: 'root' })
export class CustomerContactService {
  private readonly api = inject(ApiService);
  private readonly basePath = '/v1/customer-contacts';

  获取联系人列表(params: 客户联系人查询参数): Observable<客户联系人分页结果> {
    return this.api.get<客户联系人分页结果>(this.basePath, {
      params: params as Record<string, string | number | boolean>
    });
  }

  获取联系人ById(id: string): Observable<客户联系人> {
    return this.api.get<客户联系人>(`${this.basePath}/${id}`);
  }

  创建联系人(contact: Partial<客户联系人>): Observable<客户联系人> {
    return this.api.post<客户联系人>(this.basePath, contact);
  }

  更新联系人(id: string, contact: Partial<客户联系人>): Observable<客户联系人> {
    return this.api.put<客户联系人>(`${this.basePath}/${id}`, contact);
  }

  删除联系人(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }

  根据客户ID获取联系人(customerId: string): Observable<客户联系人[]> {
    return this.api.get<客户联系人[]>(`${this.basePath}/customer/${customerId}`);
  }
}
