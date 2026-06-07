import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { InventoryBatch } from '../../models/batch.model';
import { BatchStatus, QualityStatus } from '../../shared/enums/batch.enum';

@Component({
  selector: 'app-batch-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">批次管理</h1>
        <div class="flex gap-3">
          <a routerLink="/inventory/inbound" 
             class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
            入库
          </a>
          <a routerLink="/inventory/outbound" 
             class="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition">
            出库
          </a>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">批次编码</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">仓库</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">产品</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">颜色</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">缸号</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">匹号</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">数量</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">质检状态</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            @for (batch of batches(); track batch.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">{{ batch.batchCode }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ batch.warehouseName }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ batch.productName }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">
                  <span class="mr-1">{{ batch.colorCode }}</span>
                  <span class="text-gray-500">{{ batch.colorName }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ batch.dyeLotNo }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ batch.pieceNo }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ batch.quantity }} {{ batch.unit }}</td>
                <td class="px-4 py-3">
                  <span [class]="getStatusClass(batch.status)">
                    {{ getStatusLabel(batch.status) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span [class]="getQualityClass(batch.qualityStatus)">
                    {{ getQualityLabel(batch.qualityStatus) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <a [routerLink]="['/inventory/batches', batch.id]" 
                     class="text-blue-600 hover:text-blue-800">详情</a>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="10" class="px-4 py-8 text-center text-gray-500">暂无批次数据</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BatchListComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  batches = signal<InventoryBatch[]>([]);

  ngOnInit(): void {
    this.loadBatches();
  }

  loadBatches(): void {
    this.inventoryService.getBatches().subscribe({
      next: (data) => this.batches.set(data),
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
