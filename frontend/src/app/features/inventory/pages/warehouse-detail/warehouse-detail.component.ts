import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WarehouseService } from '../../services/warehouse.service';
import { Warehouse } from '../../models/warehouse.model';
import { WarehouseType, WarehouseStatus } from '../../shared/enums/warehouse.enum';

@Component({
  selector: 'app-warehouse-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <a routerLink="/inventory/warehouses" class="text-blue-600 hover:text-blue-800">
          ← 返回仓库列表
        </a>
      </div>

      @if (warehouse()) {
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-800">仓库详情</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">仓库编码</label>
                <p class="text-gray-900">{{ warehouse()!.code }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">仓库名称</label>
                <p class="text-gray-900">{{ warehouse()!.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">仓库类型</label>
                <p class="text-gray-900">{{ getTypeLabel(warehouse()!.type) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">状态</label>
                <span [class]="getStatusClass(warehouse()!.status)">
                  {{ getStatusLabel(warehouse()!.status) }}
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">地址</label>
                <p class="text-gray-900">{{ warehouse()!.address || '-' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">负责人</label>
                <p class="text-gray-900">{{ warehouse()!.manager || '-' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">容量</label>
                <p class="text-gray-900">{{ warehouse()!.capacity ? warehouse()!.capacity + ' 件' : '-' }}</p>
              </div>
            </div>
            <div class="mt-6 flex gap-3">
              <a [routerLink]="['/inventory/warehouses', warehouse()!.id, 'edit']" 
                 class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                编辑
              </a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private warehouseService = inject(WarehouseService);
  warehouse = signal<Warehouse | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadWarehouse(id);
    }
  }

  loadWarehouse(id: string): void {
    this.warehouseService.getWarehouseById(id).subscribe({
      next: (data) => this.warehouse.set(data),
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
