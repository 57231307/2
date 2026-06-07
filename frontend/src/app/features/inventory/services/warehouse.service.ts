import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Warehouse } from '../models/warehouse.model';

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/warehouses';

  getWarehouses(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(this.baseUrl);
  }

  getWarehouseById(id: string): Observable<Warehouse> {
    return this.http.get<Warehouse>(`${this.baseUrl}/${id}`);
  }

  createWarehouse(warehouse: Omit<Warehouse, 'id'>): Observable<Warehouse> {
    return this.http.post<Warehouse>(this.baseUrl, warehouse);
  }

  updateWarehouse(id: string, warehouse: Partial<Warehouse>): Observable<Warehouse> {
    return this.http.put<Warehouse>(`${this.baseUrl}/${id}`, warehouse);
  }
}
