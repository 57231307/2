import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { InventoryBatch } from '../../models/batch.model';
import { BatchStatus, QualityStatus } from '../../shared/enums/batch.enum';

@Component({
  selector: 'app-batch-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <a routerLink="/inventory/batches" class="text-blue-600 hover:text-blue-800">
          ← 返回批次列表
        </a>
      </div>

      @if (batch()) {
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-800">批次详情</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">批次编码</label>
                <p class="text-gray-900">{{ batch()!.batchCode }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">仓库</label>
                <p class="text-gray-900">{{ batch()!.warehouseName }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">产品</label>
                <p class="text-gray-900">{{ batch()!.productName }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">颜色编码</label>
                <p class="text-gray-900">{{ batch()!.colorCode }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">颜色名称</label>
                <p class="text-gray-900">{{ batch()!.colorName }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">缸号</label>
                <p class="text-gray-900 font-mono">{{ batch()!.dyeLotNo }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">匹号</label>
                <p class="text-gray-900 font-mono">{{ batch()!.pieceNo }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">数量</label>
                <p class="text-gray-900">{{ batch()!.quantity }} {{ batch()!.unit }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">状态</label>
                <span [class]="getStatusClass(batch()!.status)">
                  {{ getStatusLabel(batch()!.status) }}
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">质检状态</label>
                <span [class]="getQualityClass(batch()!.qualityStatus)">
                  {{ getQualityLabel(batch()!.qualityStatus) }}
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">入库时间</label>
                <p class="text-gray-900">{{ batch()!.inboundTime | date: 'yyyy-MM-dd HH:mm' }}</p>
              </div>
              @if (batch()!.productionDate) {
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-1">生产日期</label>
                  <p class="text-gray-900">{{ batch()!.productionDate | date: 'yyyy-MM-dd' }}</p>
                </div>
              }
              @if (batch()!.expiryDate) {
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-1">有效期至</label>
                  <p class="text-gray-900">{{ batch()!.expiryDate | date: 'yyyy-MM-dd' }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BatchDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private inventoryService = inject(InventoryService);
  batch = signal<InventoryBatch | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBatch(id);
    }
  }

  loadBatch(id: string): void {
    this.inventoryService.getBatchById(id).subscribe({
      next: (data) => this.batch.set(data),
      error: (err) => console.error('加载批次失败', err)
    });
  }

  getStatusLabel(status: BatchStatus): string {
    const labels: Record<BatchStatus, string> = {
      [BatchStatus.待入库]: '待入库',
      [BatchStatus.已入库]: '已入库',
      [BatchStatus.已出库]: '已出库',
      [BatchStatus.冻结]: '冻结'
    };
    return labels[status] || status;
  }

  getStatusClass(status: BatchStatus): string {
    const classes: Record<BatchStatus, string> = {
      [BatchStatus.待入库]: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
      [BatchStatus.已入库]: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
      [BatchStatus.已出库]: 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
      [BatchStatus.冻结]: 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800'
    };
    return classes[status] || '';
  }

  getQualityLabel(status: QualityStatus): string {
    const labels: Record<QualityStatus, string> = {
      [QualityStatus.待检]: '待检',
      [QualityStatus.合格]: '合格',
      [QualityStatus.不合格]: '不合格',
      [QualityStatus.让步接收]: '让步接收'
    };
    return labels[status] || status;
  }

  getQualityClass(status: QualityStatus): string {
    const classes: Record<QualityStatus, string> = {
      [QualityStatus.待检]: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
      [QualityStatus.合格]: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
      [QualityStatus.不合格]: 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800',
      [QualityStatus.让步接收]: 'px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800'
    };
    return classes[status] || '';
  }
}
