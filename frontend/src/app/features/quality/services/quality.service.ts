import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import {
  QualityStandard,
  QualityInspection,
  CreateQualityStandardRequest,
  UpdateQualityStandardRequest,
  CreateQualityInspectionRequest,
  QualityStandardQueryParams,
  QualityInspectionQueryParams,
  PageResult
} from '../models/quality.model';

@Injectable({
  providedIn: 'root'
})
export class QualityService {
  private api = inject(ApiService);
  private basePath = '/api/v1';

  // 质检标准相关
  getQualityStandards(params?: QualityStandardQueryParams): Observable<PageResult<QualityStandard>> {
    return this.api.get<PageResult<QualityStandard>>(`${this.basePath}/quality-standards`, { params: params as Record<string, string | number | boolean> });
  }

  getQualityStandard(id: string): Observable<QualityStandard> {
    return this.api.get<QualityStandard>(`${this.basePath}/quality-standards/${id}`);
  }

  createQualityStandard(request: CreateQualityStandardRequest): Observable<QualityStandard> {
    return this.api.post<QualityStandard>(`${this.basePath}/quality-standards`, request);
  }

  updateQualityStandard(id: string, request: UpdateQualityStandardRequest): Observable<QualityStandard> {
    return this.api.put<QualityStandard>(`${this.basePath}/quality-standards/${id}`, request);
  }

  deleteQualityStandard(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/quality-standards/${id}`);
  }

  // 质检报告相关
  getQualityInspections(params?: QualityInspectionQueryParams): Observable<PageResult<QualityInspection>> {
    return this.api.get<PageResult<QualityInspection>>(`${this.basePath}/quality-inspections`, { params: params as Record<string, string | number | boolean> });
  }

  getQualityInspection(id: string): Observable<QualityInspection> {
    return this.api.get<QualityInspection>(`${this.basePath}/quality-inspections/${id}`);
  }

  createQualityInspection(request: CreateQualityInspectionRequest): Observable<QualityInspection> {
    return this.api.post<QualityInspection>(`${this.basePath}/quality-inspections`, request);
  }

  updateQualityInspection(id: string, request: CreateQualityInspectionRequest): Observable<QualityInspection> {
    return this.api.put<QualityInspection>(`${this.basePath}/quality-inspections/${id}`, request);
  }

  deleteQualityInspection(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/quality-inspections/${id}`);
  }
}