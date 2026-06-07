import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { 颜色配方, 颜色配方查询参数, 分页结果, 色差检测请求, 色差检测结果 } from '../models/color-formula.model';
import {
  配色结果,
  配色结果查询参数,
  配色结果分页结果,
  创建配色结果参数,
} from '../models/color-matching-result.model';

@Injectable({ providedIn: 'root' })
export class ColorFormulaService {
  private readonly api = inject(ApiService);
  private readonly basePath = '/v1/color-formulas';

  获取配方列表(params: 颜色配方查询参数): Observable<分页结果<颜色配方>> {
    return this.api.get<分页结果<颜色配方>>(this.basePath, {
      params: params as Record<string, string | number | boolean>
    });
  }

  获取配方ById(id: string): Observable<颜色配方> {
    return this.api.get<颜色配方>(`${this.basePath}/${id}`);
  }

  创建配方(formula: Omit<颜色配方, 'id'>): Observable<颜色配方> {
    return this.api.post<颜色配方>(this.basePath, formula);
  }

  更新配方(id: string, formula: Partial<颜色配方>): Observable<颜色配方> {
    return this.api.put<颜色配方>(`${this.basePath}/${id}`, formula);
  }

  删除配方(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }

  检测色差(request: 色差检测请求): Observable<色差检测结果> {
    return this.api.post<色差检测结果>('/v1/color-differences/check', request);
  }

  // ==================== 配色结果 ====================

  获取配色结果列表(params: 配色结果查询参数): Observable<配色结果分页结果> {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params.page) queryParams['page'] = params.page;
    if (params.pageSize) queryParams['limit'] = params.pageSize;
    if (params.formulaId) queryParams['formulaId'] = params.formulaId;
    if (params.customerId) queryParams['customerId'] = params.customerId;
    if (params.isQualified !== undefined && params.isQualified !== null) {
      queryParams['isQualified'] = params.isQualified;
    }
    if (params.search) queryParams['search'] = params.search;
    if (params.startDate) queryParams['startDate'] = params.startDate;
    if (params.endDate) queryParams['endDate'] = params.endDate;
    return this.api.get<配色结果分页结果>('/v1/color-matching-results', { params: queryParams });
  }

  获取配色结果ById(id: string): Observable<配色结果> {
    return this.api.get<配色结果>(`/v1/color-matching-results/${id}`);
  }

  创建配色结果(result: 创建配色结果参数): Observable<配色结果> {
    return this.api.post<配色结果>('/v1/color-matching-results', result);
  }

  更新配色结果(id: string, result: Partial<创建配色结果参数>): Observable<配色结果> {
    return this.api.put<配色结果>(`/v1/color-matching-results/${id}`, result);
  }

  删除配色结果(id: string): Observable<void> {
    return this.api.delete<void>(`/v1/color-matching-results/${id}`);
  }
}
