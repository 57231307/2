import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { 花型, 花型查询参数, 分页结果, 花型版权 } from '../models/pattern.model';

@Injectable({ providedIn: 'root' })
export class PatternService {
  private readonly api = inject(ApiService);
  private readonly basePath = '/v1/patterns';

  获取花型列表(params: 花型查询参数): Observable<分页结果<花型>> {
    return this.api.get<分页结果<花型>>(this.basePath, {
      params: params as Record<string, string | number | boolean>
    });
  }

  获取花型ById(id: string): Observable<花型> {
    return this.api.get<花型>(`${this.basePath}/${id}`);
  }

  创建花型(pattern: Omit<花型, 'id'>): Observable<花型> {
    return this.api.post<花型>(this.basePath, pattern);
  }

  更新花型(id: string, pattern: Partial<花型>): Observable<花型> {
    return this.api.put<花型>(`${this.basePath}/${id}`, pattern);
  }

  删除花型(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }

  获取即将到期版权(days: number = 30): Observable<花型版权[]> {
    return this.api.get<花型版权[]>('/v1/pattern-copyrights/expiring/list', {
      params: { days }
    });
  }
}
