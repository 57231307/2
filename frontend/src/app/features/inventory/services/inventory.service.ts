import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryBatch, InboundRequest, OutboundRequest, InventoryQueryParams } from '../models/batch.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/inventory';

  getBatches(params?: InventoryQueryParams): Observable<InventoryBatch[]> {
    return this.http.get<InventoryBatch[]>(`${this.baseUrl}/batches`, { params: params as any });
  }

  getBatchById(id: string): Observable<InventoryBatch> {
    return this.http.get<InventoryBatch>(`${this.baseUrl}/batches/${id}`);
  }

  createBatch(batch: Omit<InventoryBatch, 'id' | 'batchCode'>): Observable<InventoryBatch> {
    return this.http.post<InventoryBatch>(`${this.baseUrl}/batches`, batch);
  }

  updateBatch(id: string, batch: Partial<InventoryBatch>): Observable<InventoryBatch> {
    return this.http.put<InventoryBatch>(`${this.baseUrl}/batches/${id}`, batch);
  }

  inbound(request: InboundRequest): Observable<InventoryBatch> {
    return this.http.post<InventoryBatch>(`${this.baseUrl}/inbound`, request);
  }

  outbound(request: OutboundRequest): Observable<InventoryBatch> {
    return this.http.post<InventoryBatch>(`${this.baseUrl}/outbound`, request);
  }

  queryInventory(params: InventoryQueryParams): Observable<InventoryBatch[]> {
    return this.http.get<InventoryBatch[]>(`${this.baseUrl}/query`, { params: params as any });
  }

  checkPieceNoUnique(dyeLotNo: string, pieceNo: string, excludeBatchId?: string): Observable<boolean> {
    const params: any = { dyeLotNo, pieceNo };
    if (excludeBatchId) {
      params.excludeBatchId = excludeBatchId;
    }
    return this.http.get<boolean>(`${this.baseUrl}/check-piece-no`, { params });
  }
}
