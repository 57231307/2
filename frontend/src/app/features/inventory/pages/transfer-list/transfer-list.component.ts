import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { InventoryTransferService } from '../../services/inventory-transfer.service';
import { WarehouseService } from '../../services/warehouse.service';
import { InventoryTransfer, TransferStatus } from '../../models/transfer.model';
import { Warehouse } from '../../models/warehouse.model';

@Component({
  selector: 'app-transfer-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">库存调拨</h1>
        <a routerLink="/inventory/transfers/new"
           class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          新建调拨单
        </a>
      </div>

      <!-- 筛选区域 -->
      <div class="bg-white rounded-lg shadow p-4 mb-4">
        <div class="flex gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">仓库</label>
            <select [(ngModel)]="filterWarehouseId"
                    (change)="loadTransfers()"
                    class="border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">全部</option>
              @for (warehouse of warehouses(); track warehouse.id) {
                <option [value]="warehouse.id">{{ warehouse.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select [(ngModel)]="filterStatus"
                    (change)="loadTransfers()"
                    class="border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">全部</option>
              <option value="PENDING">待调出</option>
              <option value="PARTIAL">部分调出</option>
              <option value="DISPATCHED">已调出</option>
              <option value="RECEIVED">已收货</option>
              <option value="CANCELLED">已取消</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 列表区域 -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">调拨单号</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">调拨日期</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">源仓库</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">目标仓库</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">负责人</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            @for (transfer of transfers(); track transfer.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">{{ transfer.transferNo }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ transfer.transferDate | date:'yyyy-MM-dd' }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ getWarehouseName(transfer.sourceWarehouseId) }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ getWarehouseName(transfer.targetWarehouseId) }}</td>
                <td class="px-4 py-3">
                  <span [class]="getStatusClass(transfer.status)">
                    {{ getStatusLabel(transfer.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ transfer.managerName || '-' }}</td>
                <td class="px-4 py-3 text-sm">
                  <a [routerLink]="['/inventory/transfers', transfer.id]"
                     class="text-blue-600 hover:text-blue-800 mr-3">详情</a>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="px-4 py-8 text-center text-gray-500">暂无调拨单数据</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      @if (total() > 0) {
        <div class="flex justify-between items-center mt-4">
          <span class="text-sm text-gray-600">共 {{ total() }} 条</span>
          <div class="flex gap-2">
            <button (click)="prevPage()"
                    [disabled]="page() === 1"
                    class="px-3 py-1 border rounded disabled:opacity-50">
              上一页
            </button>
            <span class="px-3 py-1">第 {{ page() }} 页</span>
            <button (click)="nextPage()"
                    [disabled]="page() * limit() >= total()"
                    class="px-3 py-1 border rounded disabled:opacity-50">
              下一页
            </button>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferListComponent implements OnInit {
  private transferService = inject(InventoryTransferService);
  private warehouseService = inject(WarehouseService);

  transfers = signal<InventoryTransfer[]>([]);
  warehouses = signal<Warehouse[]>([]);
  total = signal(0);
  page = signal(1);
  limit = signal(20);

  filterWarehouseId = '';
  filterStatus = '';

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadTransfers();
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (warehouses) => this.warehouses.set(warehouses),
      error: (err) => console.error('加载仓库失败', err)
    });
  }

  loadTransfers(): void {
    const params: any = {
      page: this.page(),
      limit: this.limit()
    };
    if (this.filterWarehouseId) {
      params.warehouseId = this.filterWarehouseId;
    }
    if (this.filterStatus) {
      params.status = this.filterStatus;
    }

    this.transferService.getTransfers(params).subscribe({
      next: (result) => {
        this.transfers.set(result.data);
        this.total.set(result.total);
      },
      error: (err) => console.error('加载调拨单失败', err)
    });
  }

  getWarehouseName(warehouseId: string): string {
    const warehouse = this.warehouses().find(w => w.id === warehouseId);
    return warehouse?.name || warehouseId;
  }

  getStatusLabel(status: TransferStatus): string {
    const labels: Record<TransferStatus, string> = {
      [TransferStatus.待调出]: '待调出',
      [TransferStatus.部分调出]: '部分调出',
      [TransferStatus.已调出]: '已调出',
      [TransferStatus.已收货]: '已收货',
      [TransferStatus.已取消]: '已取消',
    };
    return labels[status] || status;
  }

  getStatusClass(status: TransferStatus): string {
    const classes: Record<TransferStatus, string> = {
      [TransferStatus.待调出]: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
      [TransferStatus.部分调出]: 'px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800',
      [TransferStatus.已调出]: 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
      [TransferStatus.已收货]: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
      [TransferStatus.已取消]: 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800',
    };
    return classes[status] || '';
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.loadTransfers();
    }
  }

  nextPage(): void {
    if (this.page() * this.limit() < this.total()) {
      this.page.set(this.page() + 1);
      this.loadTransfers();
    }
  }
}
