import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventoryTransferService } from '../../services/inventory-transfer.service';
import { InventoryService } from '../../services/inventory.service';
import { WarehouseService } from '../../services/warehouse.service';
import { CreateTransferDto } from '../../models/transfer.model';
import { Warehouse } from '../../models/warehouse.model';
import { InventoryBatch } from '../../models/batch.model';

@Component({
  selector: 'app-transfer-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex items-center mb-6">
        <a routerLink="/inventory/transfers" class="text-blue-600 hover:text-blue-800 mr-2">←</a>
        <h1 class="text-2xl font-bold text-gray-800">新建调拨单</h1>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <form (ngSubmit)="onSubmit()">
          <!-- 基本信息 -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">源仓库 <span class="text-red-500">*</span></label>
              <select [(ngModel)]="formData.sourceWarehouseId"
                      name="sourceWarehouseId"
                      required
                      (change)="onFromWarehouseChange()"
                      class="w-full border border-gray-300 rounded px-3 py-2">
                <option value="">请选择源仓库</option>
                @for (warehouse of warehouses(); track warehouse.id) {
                  <option [value]="warehouse.id">{{ warehouse.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">目标仓库 <span class="text-red-500">*</span></label>
              <select [(ngModel)]="formData.targetWarehouseId"
                      name="targetWarehouseId"
                      required
                      class="w-full border border-gray-300 rounded px-3 py-2">
                <option value="">请选择目标仓库</option>
                @for (warehouse of warehouses(); track warehouse.id) {
                  <option [value]="warehouse.id" [disabled]="warehouse.id === formData.sourceWarehouseId">{{ warehouse.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">调拨日期</label>
              <input type="date"
                     [(ngModel)]="formData.transferDate"
                     name="transferDate"
                     class="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">负责人</label>
              <input type="text"
                     [(ngModel)]="formData.managerName"
                     name="managerName"
                     placeholder="请输入负责人"
                     class="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
          </div>

          <!-- 备注 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea [(ngModel)]="formData.remark"
                      name="remark"
                      rows="2"
                      placeholder="请输入备注"
                      class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
          </div>

          <!-- 调拨明细 -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-800">调拨明细</h3>
              <button type="button"
                      (click)="showBatchSelect = true"
                      class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                添加批次
              </button>
            </div>

            <table class="w-full border-collapse border border-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th class="border border-gray-300 px-3 py-2 text-left text-sm font-medium">批次号</th>
                  <th class="border border-gray-300 px-3 py-2 text-left text-sm font-medium">颜色</th>
                  <th class="border border-gray-300 px-3 py-2 text-left text-sm font-medium">当前库存</th>
                  <th class="border border-gray-300 px-3 py-2 text-left text-sm font-medium">调拨数量</th>
                  <th class="border border-gray-300 px-3 py-2 text-left text-sm font-medium">单位</th>
                  <th class="border border-gray-300 px-3 py-2 text-left text-sm font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                @for (item of items(); track $index; let i = $index) {
                  <tr>
                    <td class="border border-gray-300 px-3 py-2 text-sm">{{ item.dyeLotNo }}</td>
                    <td class="border border-gray-300 px-3 py-2 text-sm">{{ item.colorName }}</td>
                    <td class="border border-gray-300 px-3 py-2 text-sm">{{ item.availableQuantity }}</td>
                    <td class="border border-gray-300 px-3 py-2 text-sm">
                      <input type="number"
                             [(ngModel)]="item.transferQuantity"
                             [name]="'quantity-' + i"
                             min="0.01"
                             max="{{ item.availableQuantity }}"
                             step="0.01"
                             class="w-24 border border-gray-300 rounded px-2 py-1" />
                    </td>
                    <td class="border border-gray-300 px-3 py-2 text-sm">{{ item.unit }}</td>
                    <td class="border border-gray-300 px-3 py-2 text-sm">
                      <button type="button"
                              (click)="removeItem(i)"
                              class="text-red-600 hover:text-red-800">删除</button>
                    </td>
                  </tr>
                }
                @empty {
                  <tr>
                    <td colspan="6" class="border border-gray-300 px-3 py-4 text-center text-gray-500">
                      暂无调拨明细，请添加批次
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- 错误信息 -->
          @if (error()) {
            <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {{ error() }}
            </div>
          }

          <!-- 提交按钮 -->
          <div class="flex justify-end gap-3">
            <a routerLink="/inventory/transfers"
               class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
              取消
            </a>
            <button type="submit"
                    [disabled]="submitting()"
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {{ submitting() ? '提交中...' : '提交' }}
            </button>
          </div>
        </form>
      </div>

      <!-- 批次选择弹窗 -->
      @if (showBatchSelect) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div class="p-4 border-b flex justify-between items-center">
              <h3 class="text-lg font-medium">选择批次</h3>
              <button (click)="showBatchSelect = false" class="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div class="p-4">
              <input type="text"
                     [(ngModel)]="batchSearchKeyword"
                     placeholder="搜索批次号"
                     class="w-full border border-gray-300 rounded px-3 py-2 mb-4" />
            </div>
            <div class="overflow-auto max-h-[50vh]">
              <table class="w-full">
                <thead class="bg-gray-50 sticky top-0">
                  <tr>
                    <th class="px-3 py-2 text-left text-sm font-medium">选择</th>
                    <th class="px-3 py-2 text-left text-sm font-medium">批次号</th>
                    <th class="px-3 py-2 text-left text-sm font-medium">产品</th>
                    <th class="px-3 py-2 text-left text-sm font-medium">颜色</th>
                    <th class="px-3 py-2 text-left text-sm font-medium">库存</th>
                  </tr>
                </thead>
                <tbody>
                  @for (batch of availableBatches(); track batch.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-3 py-2">
                        <input type="checkbox"
                               [checked]="isBatchSelected(batch.id)"
                               (change)="toggleBatch(batch)" />
                      </td>
                      <td class="px-3 py-2 text-sm">{{ batch.dyeLotNo }}</td>
                      <td class="px-3 py-2 text-sm">{{ batch.productName }}</td>
                      <td class="px-3 py-2 text-sm">{{ batch.colorName }}</td>
                      <td class="px-3 py-2 text-sm">{{ batch.quantity }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="p-4 border-t flex justify-end gap-3">
              <button (click)="showBatchSelect = false"
                      class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                取消
              </button>
              <button (click)="confirmBatchSelection()"
                      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                确认
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferFormComponent implements OnInit {
  private transferService = inject(InventoryTransferService);
  private warehouseService = inject(WarehouseService);
  private inventoryService = inject(InventoryService);
  private router = inject(Router);

  warehouses = signal<Warehouse[]>([]);
  availableBatches = signal<InventoryBatch[]>([]);
  items = signal<any[]>([]);
  submitting = signal(false);
  error = signal<string | null>(null);

  showBatchSelect = false;
  batchSearchKeyword = '';
  selectedBatches: InventoryBatch[] = [];

  formData: CreateTransferDto = {
    sourceWarehouseId: '',
    targetWarehouseId: '',
    transferDate: '',
    managerName: '',
    remark: '',
    items: []
  };

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (warehouses) => this.warehouses.set(warehouses),
      error: (err) => console.error('加载仓库失败', err)
    });
  }

  onFromWarehouseChange(): void {
    if (this.formData.sourceWarehouseId) {
      this.loadAvailableBatches();
    } else {
      this.availableBatches.set([]);
    }
  }

  loadAvailableBatches(): void {
    this.inventoryService.getBatches({ warehouseId: this.formData.sourceWarehouseId }).subscribe({
      next: (batches) => {
        this.availableBatches.set(batches.filter(b => b.quantity > 0));
      },
      error: (err) => console.error('加载批次失败', err)
    });
  }

  isBatchSelected(batchId: string): boolean {
    return this.selectedBatches.some(b => b.id === batchId);
  }

  toggleBatch(batch: InventoryBatch): void {
    const index = this.selectedBatches.findIndex(b => b.id === batch.id);
    if (index >= 0) {
      this.selectedBatches.splice(index, 1);
    } else {
      this.selectedBatches.push(batch);
    }
  }

  confirmBatchSelection(): void {
    const newItems = this.selectedBatches.map(batch => ({
      batchId: batch.id,
      dyeLotNo: batch.dyeLotNo,
      colorName: batch.colorName,
      availableQuantity: batch.quantity,
      transferQuantity: batch.quantity,
      unit: batch.unit
    }));

    this.items.update(current => [...current, ...newItems]);
    this.selectedBatches = [];
    this.showBatchSelect = false;
  }

  removeItem(index: number): void {
    this.items.update(current => current.filter((_, i) => i !== index));
  }

  onSubmit(): void {
    this.error.set(null);

    // 验证
    if (!this.formData.sourceWarehouseId) {
      this.error.set('请选择源仓库');
      return;
    }
    if (!this.formData.targetWarehouseId) {
      this.error.set('请选择目标仓库');
      return;
    }
    if (this.formData.sourceWarehouseId === this.formData.targetWarehouseId) {
      this.error.set('源仓库和目标仓库不能相同');
      return;
    }
    if (this.items().length === 0) {
      this.error.set('请添加调拨明细');
      return;
    }

    const hasInvalidQuantity = this.items().some(item => item.transferQuantity <= 0 || item.transferQuantity > item.availableQuantity);
    if (hasInvalidQuantity) {
      this.error.set('调拨数量必须大于0且不超过可用库存');
      return;
    }

    this.submitting.set(true);

    const request: CreateTransferDto = {
      sourceWarehouseId: this.formData.sourceWarehouseId,
      targetWarehouseId: this.formData.targetWarehouseId,
      transferDate: this.formData.transferDate,
      managerName: this.formData.managerName,
      remark: this.formData.remark,
      items: this.items().map(item => ({
        batchId: item.batchId,
        quantity: item.transferQuantity
      }))
    };

    this.transferService.createTransfer(request).subscribe({
      next: (transfer) => {
        this.submitting.set(false);
        this.router.navigate(['/inventory/transfers', transfer.id]);
      },
      error: (err: any) => {
        this.submitting.set(false);
        this.error.set(err.error?.message || '创建调拨单失败');
      }
    });
  }
}
