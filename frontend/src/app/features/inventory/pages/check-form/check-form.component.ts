import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { InventoryCheckService, CreateCheckDto, UpdateCheckDto, CheckFormData } from '../../services/inventory-check.service';
import { WarehouseService } from '../../services/warehouse.service';
import { InventoryService } from '../../services/inventory.service';
import { Warehouse } from '../../models/warehouse.model';
import { InventoryCheckType } from '../../models/check.model';
import { InventoryBatch } from '../../models/batch.model';

@Component({
  selector: 'app-check-form',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? '编辑盘点单' : '新建盘点单' }}</h1>
        <a routerLink="/inventory/checks" class="text-gray-600 hover:text-gray-800">
          返回列表
        </a>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- 基本信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">仓库 <span class="text-red-500">*</span></label>
              <select [(ngModel)]="formData.warehouseId" name="warehouseId" required
                      [disabled]="isEdit"
                      (change)="onWarehouseChange()"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                <option value="">请选择仓库</option>
                @for (warehouse of warehouses(); track warehouse.id) {
                  <option [value]="warehouse.id">{{ warehouse.name }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">盘点类型 <span class="text-red-500">*</span></label>
              <select [(ngModel)]="formData.checkType" name="checkType" required
                      [disabled]="isEdit"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                <option value="FULL">全盘</option>
                <option value="SAMPLE">抽盘</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">盘点日期 <span class="text-red-500">*</span></label>
              <input type="date" [(ngModel)]="formData.checkDate" name="checkDate" required
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">负责人</label>
              <input type="text" [(ngModel)]="formData.manager" name="manager"
                     placeholder="请输入负责人姓名"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>

          <!-- 抽盘时选择批次 -->
          @if (formData.checkType === 'SAMPLE' && !isEdit) {
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">选择盘点批次</label>
              <div class="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                <div class="space-y-2">
                  @for (batch of batches(); track batch.id) {
                    <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input type="checkbox" 
                             [checked]="isBatchSelected(batch.id)"
                             (change)="toggleBatch(batch.id)"
                             class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                      <span class="text-sm">{{ batch.batchCode }} - {{ batch.productName }} - {{ batch.quantity }}{{ batch.unit }}</span>
                    </label>
                  } @empty {
                    <p class="text-gray-500 text-sm">该仓库暂无批次数据</p>
                  }
                </div>
              </div>
              <p class="mt-2 text-sm text-gray-500">已选择 {{ selectedBatchIds().length }} 个批次</p>
            </div>
          }

          <!-- 备注 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea [(ngModel)]="formData.notes" name="notes" rows="3"
                      placeholder="请输入备注信息"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-end space-x-4">
            <a routerLink="/inventory/checks" 
               class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              取消
            </a>
            <button type="submit" 
                    [disabled]="!isFormValid()"
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed">
              {{ isEdit ? '保存' : '创建' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckFormComponent implements OnInit {
  private checkService = inject(InventoryCheckService);
  private warehouseService = inject(WarehouseService);
  private inventoryService = inject(InventoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  warehouses = signal<Warehouse[]>([]);
  batches = signal<InventoryBatch[]>([]);
  selectedBatchIds = signal<string[]>([]);
  
  isEdit = false;
  checkId = '';

  formData: CheckFormData = {
    warehouseId: '',
    checkType: 'FULL',
    checkDate: new Date().toISOString().split('T')[0],
    manager: '',
    notes: ''
  };

  ngOnInit(): void {
    this.loadWarehouses();
    
    this.checkId = this.route.snapshot.paramMap.get('id') || '';
    if (this.checkId) {
      this.isEdit = true;
      this.loadCheck();
    }
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (data) => this.warehouses.set(data),
      error: (err) => console.error('加载仓库失败', err)
    });
  }

  loadCheck(): void {
    this.checkService.getCheckById(this.checkId).subscribe({
      next: (check) => {
        this.formData = {
          warehouseId: check.warehouseId,
          checkType: check.checkType,
          checkDate: check.checkDate.split('T')[0],
          manager: check.manager,
          notes: check.notes
        };
      },
      error: (err) => console.error('加载盘点单失败', err)
    });
  }

  onWarehouseChange(): void {
    if (this.formData.warehouseId) {
      this.inventoryService.getBatches({ warehouseId: this.formData.warehouseId } as any).subscribe({
        next: (data) => this.batches.set(data),
        error: (err) => console.error('加载批次失败', err)
      });
    } else {
      this.batches.set([]);
    }
  }

  isBatchSelected(batchId: string): boolean {
    return this.selectedBatchIds().includes(batchId);
  }

  toggleBatch(batchId: string): void {
    const ids = this.selectedBatchIds();
    const index = ids.indexOf(batchId);
    if (index >= 0) {
      this.selectedBatchIds.set(ids.filter(id => id !== batchId));
    } else {
      this.selectedBatchIds.set([...ids, batchId]);
    }
  }

  isFormValid(): boolean {
    return !!(this.formData.warehouseId && this.formData.checkType && this.formData.checkDate);
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    if (this.isEdit) {
      this.checkService.updateCheck(this.checkId, this.formData as UpdateCheckDto).subscribe({
        next: () => this.router.navigate(['/inventory/checks']),
        error: (err) => console.error('更新失败', err)
      });
    } else {
      const data = {
        ...this.formData,
        batchIds: this.selectedBatchIds()
      } as CreateCheckDto;
      
      this.checkService.createCheck(data).subscribe({
        next: () => this.router.navigate(['/inventory/checks']),
        error: (err) => console.error('创建失败', err)
      });
    }
  }
}
