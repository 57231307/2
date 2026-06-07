import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WarehouseService } from '../../services/warehouse.service';
import { Warehouse } from '../../models/warehouse.model';
import { WarehouseType, WarehouseStatus } from '../../shared/enums/warehouse.enum';

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">仓库管理</h1>
        <a routerLink="/inventory/warehouses/new" 
           class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          新增仓库
        </a>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">仓库编码</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">仓库名称</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">类型</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">地址</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            @for (warehouse of warehouses(); track warehouse.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">{{ warehouse.code }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ warehouse.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ getTypeLabel(warehouse.type) }}</td>
                <td class="px-4 py-3">
                  <span [class]="getStatusClass(warehouse.status)">
                    {{ getStatusLabel(warehouse.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ warehouse.address || '-' }}</td>
                <td class="px-4 py-3 text-sm">
                  <a [routerLink]="['/inventory/warehouses', warehouse.id]" 
                     class="text-blue-600 hover:text-blue-800 mr-3">详情</a>
                  <a [routerLink]="['/inventory/warehouses', warehouse.id, 'edit']" 
                     class="text-gray-600 hover:text-gray-800">编辑</a>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-4 py-8 text-center text-gray-500">暂无仓库数据</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseListComponent implements OnInit {
  private warehouseService = inject(WarehouseService);
  warehouses = signal<Warehouse[]>([]);

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (data) => this.warehouses.set(data),
      error: (err) => console.error('加载仓库失败', err)
    });
  }

  getTypeLabel(type: WarehouseType): string {
    const labels: Record<WarehouseType, string> = {
      [WarehouseType.原材料仓]: '原材料仓',
      [WarehouseType.成品仓]: '成品仓',
      [WarehouseType.染化料仓]: '染化料仓'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: WarehouseStatus): string {
    const labels: Record<WarehouseStatus, string> = {
      [WarehouseStatus.启用]: '启用',
      [WarehouseStatus.停用]: '停用'
    };
    return labels[status] || status;
  }

  getStatusClass(status: WarehouseStatus): string {
    return status === WarehouseStatus.启用 
      ? 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800'
      : 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600';
  }
}
