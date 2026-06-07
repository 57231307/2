import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryCheckService, InventoryCheck, QueryCheckParams } from '../../services/inventory-check.service';
import { WarehouseService } from '../../services/warehouse.service';
import { Warehouse } from '../../models/warehouse.model';
import { InventoryCheckStatus, InventoryCheckType } from '../../models/check.model';

@Component({
  selector: 'app-check-list',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">库存盘点</h1>
        <a routerLink="/inventory/checks/new" 
           class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          新建盘点单
        </a>
      </div>

      <!-- 筛选条件 -->
      <div class="bg-white rounded-lg shadow p-4 mb-4">
        <div class="flex gap-4 flex-wrap">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">仓库</label>
            <select [(ngModel)]="queryParams.warehouseId" (change)="loadChecks()" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">全部仓库</option>
              @for (warehouse of warehouses(); track warehouse.id) {
                <option [value]="warehouse.id">{{ warehouse.name }}</option>
              }
            </select>
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select [(ngModel)]="queryParams.status" (change)="loadChecks()"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">全部状态</option>
              <option value="PENDING">待盘点</option>
              <option value="IN_PROGRESS">盘点中</option>
              <option value="COMPLETED">已完成</option>
            </select>
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">盘点日期</label>
            <input type="date" [(ngModel)]="queryParams.startDate" (change)="loadChecks()"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">至</label>
            <input type="date" [(ngModel)]="queryParams.endDate" (change)="loadChecks()"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="flex items-end">
            <button (click)="resetQuery()"
                    class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              重置
            </button>
          </div>
        </div>
      </div>

      <!-- 盘点单列表 -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">盘点单号</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">仓库</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">盘点类型</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">盘点日期</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">负责人</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            @for (check of checks(); track check.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">{{ check.checkNo }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ getWarehouseName(check.warehouseId) }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ getTypeLabel(check.checkType) }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ check.checkDate | date:'yyyy-MM-dd' }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ check.manager || '-' }}</td>
                <td class="px-4 py-3">
                  <span [class]="getStatusClass(check.status)">
                    {{ getStatusLabel(check.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm">
                  @if (check.status === 'PENDING') {
                    <a [routerLink]="['/inventory/checks', check.id, 'execute']" 
                       class="text-blue-600 hover:text-blue-800 mr-3">执行盘点</a>
                  } @else {
                    <a [routerLink]="['/inventory/checks', check.id]" 
                       class="text-blue-600 hover:text-blue-800 mr-3">详情</a>
                  }
                  @if (check.status !== 'COMPLETED') {
                    <a [routerLink]="['/inventory/checks', check.id, 'edit']" 
                       class="text-gray-600 hover:text-gray-800 mr-3">编辑</a>
                    <button (click)="deleteCheck(check.id)" 
                            class="text-red-600 hover:text-red-800">删除</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="px-4 py-8 text-center text-gray-500">暂无盘点单数据</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckListComponent implements OnInit {
  private checkService = inject(InventoryCheckService);
  private warehouseService = inject(WarehouseService);
  private router = inject(Router);

  checks = signal<InventoryCheck[]>([]);
  warehouses = signal<Warehouse[]>([]);
  queryParams: QueryCheckParams = {
    page: 1,
    limit: 20
  };

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadChecks();
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (data) => this.warehouses.set(data),
      error: (err) => console.error('加载仓库失败', err)
    });
  }

  loadChecks(): void {
    this.checkService.getChecks(this.queryParams).subscribe({
      next: (result) => this.checks.set(result.data),
      error: (err) => console.error('加载盘点单失败', err)
    });
  }

  resetQuery(): void {
    this.queryParams = { page: 1, limit: 20 };
    this.loadChecks();
  }

  getWarehouseName(warehouseId: string): string {
    const warehouse = this.warehouses().find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : warehouseId;
  }

  getTypeLabel(type: string): string {
    return type === 'FULL' ? '全盘' : '抽盘';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': '待盘点',
      'IN_PROGRESS': '盘点中',
      'COMPLETED': '已完成'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
      'IN_PROGRESS': 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
      'COMPLETED': 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800'
    };
    return classes[status] || '';
  }

  deleteCheck(id: string): void {
    if (confirm('确定要删除该盘点单吗？')) {
      this.checkService.deleteCheck(id).subscribe({
        next: () => this.loadChecks(),
        error: (err) => console.error('删除失败', err)
      });
    }
  }
}
