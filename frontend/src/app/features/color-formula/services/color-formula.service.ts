import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { 颜色配方, 颜色配方查询参数, 分页结果, 色差检测请求, 色差检测结果 } from '../models/color-formula.model';

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
}
