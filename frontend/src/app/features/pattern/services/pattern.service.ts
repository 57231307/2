import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { 花型, 花型查询参数, 分页结果, 花型版权, 花型设计, 花型设计查询参数 } from '../models/pattern.model';

@Injectable({ providedIn: 'root' })
export class PatternService {
  private readonly api = inject(ApiService);
  private readonly basePath = '/v1/patterns';
  private readonly designPath = '/v1/pattern-designs';

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

  // ==================== 花型设计 ====================

  // 获取花型设计列表
  获取花型设计列表(params: 花型设计查询参数): Observable<分页结果<花型设计>> {
    const queryParams: Record<string, string | number | boolean> = {
      page: params.page,
      pageSize: params.pageSize,
    };
    if (params.keyword) queryParams['keyword'] = params.keyword;
    if (params.patternId) queryParams['patternId'] = params.patternId;
    if (params.designer) queryParams['designer'] = params.designer;
    if (params.status) queryParams['status'] = params.status as unknown as string;
    if (params.designDateFrom) queryParams['designDateFrom'] = params.designDateFrom.toISOString();
    if (params.designDateTo) queryParams['designDateTo'] = params.designDateTo.toISOString();
    return this.api.get<分页结果<花型设计>>(this.designPath, { params: queryParams });
  }

  // 获取花型设计详情
  获取花型设计ById(id: string): Observable<花型设计> {
    return this.api.get<花型设计>(`${this.designPath}/${id}`);
  }

  // 创建花型设计
  创建花型设计(design: Partial<花型设计>): Observable<花型设计> {
    return this.api.post<花型设计>(this.designPath, design);
  }

  // 更新花型设计
  更新花型设计(id: string, design: Partial<花型设计>): Observable<花型设计> {
    return this.api.put<花型设计>(`${this.designPath}/${id}`, design);
  }

  // 提交审核
  提交花型设计审核(id: string): Observable<花型设计> {
    return this.api.post<花型设计>(`${this.designPath}/${id}/submit`, {});
  }

  // 审核通过
  审核通过花型设计(id: string, remark?: string): Observable<花型设计> {
    return this.api.post<花型设计>(`${this.designPath}/${id}/approve`, { remark });
  }

  // 审核驳回
  审核驳回花型设计(id: string, reason: string): Observable<花型设计> {
    return this.api.post<花型设计>(`${this.designPath}/${id}/reject`, { reason });
  }

  // 归档
  归档花型设计(id: string): Observable<花型设计> {
    return this.api.post<花型设计>(`${this.designPath}/${id}/archive`, {});
  }

  // 删除花型设计
  删除花型设计(id: string): Observable<void> {
    return this.api.delete<void>(`${this.designPath}/${id}`);
  }
}
