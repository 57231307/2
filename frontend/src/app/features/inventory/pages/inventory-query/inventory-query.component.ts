import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { WarehouseService } from '../../services/warehouse.service';
import { Warehouse } from '../../models/warehouse.model';
import { InventoryBatch, InventoryQueryParams } from '../../models/batch.model';
import { BatchStatus, QualityStatus } from '../../shared/enums/batch.enum';

@Component({
  selector: 'app-inventory-query',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">库存查询</h1>

      <div class="bg-white rounded-lg shadow mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="font-medium text-gray-700">查询条件</h3>
        </div>
        <div class="p-6">
          <form [formGroup]="queryForm">
            <div class="grid grid-cols-6 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">仓库</label>
                <select formControlName="warehouseId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">全部仓库</option>
                  @for (warehouse of warehouses(); track warehouse.id) {
                    <option [value]="warehouse.id">{{ warehouse.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">产品</label>
                <input type="text" formControlName="productId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="产品名称" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">颜色变体</label>
                <input type="text" formControlName="colorVariantId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="颜色编码或名称" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">缸号</label>
                <input type="text" formControlName="dyeLotNo"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="缸号" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">匹号</label>
                <input type="text" formControlName="pieceNo"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="匹号" />
              </div>
              <div class="flex items-end">
                <label class="flex items-center">
                  <input type="checkbox" formControlName="enableWarning"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span class="ml-2 text-sm text-gray-600">库存预警</span>
                </label>
              </div>
            </div>
            <div class="mt-4 flex gap-3">
              <button type="button" (click)="onQuery()"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                查询
              </button>
              <button type="button" (click)="onReset()"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                重置
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="font-medium text-gray-700">查询结果</h3>
          <span class="text-sm text-gray-500">共 {{ results().length }} 条记录</span>
        </div>
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
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">入库时间</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            @for (item of results(); track item.id) {
              <tr class="hover:bg-gray-50" [class.bg-red-50]="isLowStock(item)">
                <td class="px-4 py-3 text-sm text-gray-900">{{ item.batchCode }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ item.warehouseName }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ item.productName }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">
                  <span class="mr-1">{{ item.colorCode }}</span>
                  <span class="text-gray-500">{{ item.colorName }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900 font-mono">{{ item.dyeLotNo }}</td>
                <td class="px-4 py-3 text-sm text-gray-900 font-mono">{{ item.pieceNo }}</td>
                <td class="px-4 py-3 text-sm">
                  <span [class]="isLowStock(item) ? 'text-red-600 font-bold' : 'text-gray-900'">
                    {{ item.quantity }} {{ item.unit }}
                  </span>
                  @if (isLowStock(item)) {
                    <span class="ml-2 text-xs text-red-600">⚠ 预警</span>
                  }
                </td>
                <td class="px-4 py-3">
                  <span [class]="getStatusClass(item.status)">
                    {{ getStatusLabel(item.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ item.inboundTime | date: 'yyyy-MM-dd' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="9" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryQueryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private inventoryService = inject(InventoryService);
  private warehouseService = inject(WarehouseService);

  warehouses = signal<Warehouse[]>([]);
  results = signal<InventoryBatch[]>([]);

  queryForm: FormGroup = this.fb.group({
    warehouseId: [''],
    productId: [''],
    colorVariantId: [''],
    dyeLotNo: [''],
    pieceNo: [''],
    enableWarning: [false]
  });

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadAllBatches();
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (data) => this.warehouses.set(data),
      error: (err) => console.error('加载仓库失败', err)
    });
  }

  loadAllBatches(): void {
    this.inventoryService.getBatches().subscribe({
      next: (data) => this.results.set(data),
      error: (err) => console.error('加载批次失败', err)
    });
  }

  onQuery(): void {
    const params: InventoryQueryParams = {};
    const value = this.queryForm.value;

    if (value.warehouseId) params.warehouseId = value.warehouseId;
    if (value.productId) params.productId = value.productId;
    if (value.colorVariantId) params.colorVariantId = value.colorVariantId;
    if (value.dyeLotNo) params.dyeLotNo = value.dyeLotNo;
    if (value.pieceNo) params.pieceNo = value.pieceNo;
    if (value.enableWarning) params.enableWarning = true;

    this.inventoryService.queryInventory(params).subscribe({
      next: (data) => this.results.set(data),
      error: (err) => console.error('查询失败', err)
    });
  }

  onReset(): void {
    this.queryForm.reset({
      warehouseId: '',
      productId: '',
      colorVariantId: '',
      dyeLotNo: '',
      pieceNo: '',
      enableWarning: false
    });
    this.loadAllBatches();
  }

  isLowStock(batch: InventoryBatch): boolean {
    return batch.quantity < 10;
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
}
