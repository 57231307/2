import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryAlertItem, AlertSummary } from '../models/alert.model';

@Injectable({ providedIn: 'root' })
export class InventoryAlertService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/inventory-alerts';

  /**
   * 获取低库存预警列表
   */
  getLowStockAlerts(warehouseId?: string): Observable<InventoryAlertItem[]> {
    let params = new HttpParams();
    if (warehouseId) {
      params = params.set('warehouseId', warehouseId);
    }
    return this.http.get<InventoryAlertItem[]>(`${this.baseUrl}/low-stock`, { params });
  }

  /**
   * 获取超储预警列表
   */
  getOverStockAlerts(warehouseId?: string): Observable<InventoryAlertItem[]> {
    let params = new HttpParams();
    if (warehouseId) {
      params = params.set('warehouseId', warehouseId);
    }
    return this.http.get<InventoryAlertItem[]>(`${this.baseUrl}/over-stock`, { params });
  }

  /**
   * 获取效期预警列表
   */
  getExpiryAlerts(warehouseId?: string): Observable<InventoryAlertItem[]> {
    let params = new HttpParams();
    if (warehouseId) {
      params = params.set('warehouseId', warehouseId);
    }
    return this.http.get<InventoryAlertItem[]>(`${this.baseUrl}/expiry`, { params });
  }

  /**
   * 获取预警汇总
   */
  getAlertSummary(warehouseId?: string): Observable<AlertSummary> {
    let params = new HttpParams();
    if (warehouseId) {
      params = params.set('warehouseId', warehouseId);
    }
    return this.http.get<AlertSummary>(`${this.baseUrl}/summary`, { params });
  }
}
