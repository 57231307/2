import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class SystemService {
  private api = inject(ApiService);
  private basePath = '/api/v1';

  // 部门管理
  getDepartments(): Observable<any> {
    return this.api.get<any>(`${this.basePath}/departments`);
  }

  getActiveDepartments(): Observable<any> {
    return this.api.get<any>(`${this.basePath}/departments/active`);
  }

  getDepartment(id: string): Observable<any> {
    return this.api.get<any>(`${this.basePath}/departments/${id}`);
  }

  createDepartment(data: any): Observable<any> {
    return this.api.post<any>(`${this.basePath}/departments`, data);
  }

  updateDepartment(id: string, data: any): Observable<any> {
    return this.api.put<any>(`${this.basePath}/departments/${id}`, data);
  }

  deleteDepartment(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/departments/${id}`);
  }

  // 系统参数管理
  getSystemParameters(): Observable<any> {
    return this.api.get<any>(`${this.basePath}/system-parameters`);
  }

  getActiveSystemParameters(): Observable<any> {
    return this.api.get<any>(`${this.basePath}/system-parameters/active`);
  }

  getSystemParameter(key: string): Observable<any> {
    return this.api.get<any>(`${this.basePath}/system-parameters/${key}`);
  }

  createSystemParameter(data: any): Observable<any> {
    return this.api.post<any>(`${this.basePath}/system-parameters`, data);
  }

  updateSystemParameter(key: string, data: any): Observable<any> {
    return this.api.put<any>(`${this.basePath}/system-parameters/${key}`, data);
  }

  updateSystemParameterValue(key: string, value: string): Observable<any> {
    return this.api.put<any>(`${this.basePath}/system-parameters/${key}/value`, { value });
  }

  deleteSystemParameter(key: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/system-parameters/${key}`);
  }

  getSystemParameterGroups(): Observable<any> {
    return this.api.get<any>(`${this.basePath}/system-parameters/groups`);
  }

  // 编码规则管理
  getCodeRules(): Observable<any> {
    return this.api.get<any>(`${this.basePath}/code-rules`);
  }

  getActiveCodeRules(): Observable<any> {
    return this.api.get<any>(`${this.basePath}/code-rules/active`);
  }

  getCodeRule(id: string): Observable<any> {
    return this.api.get<any>(`${this.basePath}/code-rules/${id}`);
  }

  createCodeRule(data: any): Observable<any> {
    return this.api.post<any>(`${this.basePath}/code-rules`, data);
  }

  updateCodeRule(id: string, data: any): Observable<any> {
    return this.api.put<any>(`${this.basePath}/code-rules/${id}`, data);
  }

  deleteCodeRule(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/code-rules/${id}`);
  }

  generateCode(id: string): Observable<any> {
    return this.api.post<any>(`${this.basePath}/code-rules/${id}/generate`, {});
  }

  resetCodeRuleSequence(id: string): Observable<any> {
    return this.api.post<any>(`${this.basePath}/code-rules/${id}/reset`, {});
  }

  // ==================== 岗位管理 ====================

  // 获取岗位列表
  getPositions(params?: any): Observable<any> {
    return this.api.get<any>(`${this.basePath}/positions`, { params });
  }

  // 获取岗位详情
  getPosition(id: string): Observable<any> {
    return this.api.get<any>(`${this.basePath}/positions/${id}`);
  }

  // 创建岗位
  createPosition(data: any): Observable<any> {
    return this.api.post<any>(`${this.basePath}/positions`, data);
  }

  // 更新岗位
  updatePosition(id: string, data: any): Observable<any> {
    return this.api.put<any>(`${this.basePath}/positions/${id}`, data);
  }

  // 删除岗位
  deletePosition(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/positions/${id}`);
  }

  // 按部门查询岗位
  getPositionsByDepartment(departmentId: string): Observable<any> {
    return this.api.get<any>(`${this.basePath}/positions/by-department/${departmentId}`);
  }
}
