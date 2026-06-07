import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { WarehouseService } from '../../services/warehouse.service';
import { Warehouse } from '../../models/warehouse.model';
import { QualityStatus } from '../../shared/enums/batch.enum';
import { generateDyeLotNo, generatePieceNo } from '../../services/validators';

@Component({
  selector: 'app-inbound',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <a routerLink="/inventory/batches" class="text-blue-600 hover:text-blue-800">
          ← 返回批次列表
        </a>
      </div>

      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-800">入库操作</h2>
        </div>
        <div class="p-6">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">批次</label>
                <select formControlName="batchId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">请选择批次</option>
                  @for (batch of batches(); track batch.id) {
                    <option [value]="batch.id">
                      {{ batch.batchCode }} - {{ batch.productName }} - {{ batch.colorCode }}
                    </option>
                  }
                </select>
                @if (form.get('batchId')?.hasError('required') && form.get('batchId')?.touched) {
                  <p class="mt-1 text-sm text-red-600">请选择批次</p>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">仓库</label>
                <select formControlName="warehouseId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">请选择仓库</option>
                  @for (warehouse of warehouses(); track warehouse.id) {
                    <option [value]="warehouse.id">{{ warehouse.name }}</option>
                  }
                </select>
                @if (form.get('warehouseId')?.hasError('required') && form.get('warehouseId')?.touched) {
                  <p class="mt-1 text-sm text-red-600">请选择仓库</p>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">缸号</label>
                <div class="flex gap-2">
                  <input type="text" formControlName="dyeLotNo"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="请输入或自动生成缸号" />
                  <button type="button" (click)="自动生成缸号()"
                    class="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">
                    自动生成
                  </button>
                </div>
                @if (form.get('dyeLotNo')?.hasError('required') && form.get('dyeLotNo')?.touched) {
                  <p class="mt-1 text-sm text-red-600">缸号必填</p>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">匹号</label>
                <div class="flex gap-2">
                  <input type="text" formControlName="pieceNo"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="请输入或自动生成匹号" />
                  <button type="button" (click)="自动生成匹号()"
                    class="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">
                    自动生成
                  </button>
                </div>
                @if (form.get('pieceNo')?.hasError('required') && form.get('pieceNo')?.touched) {
                  <p class="mt-1 text-sm text-red-600">匹号必填</p>
                }
                @if (form.get('pieceNo')?.hasError('notUnique') && form.get('pieceNo')?.touched) {
                  <p class="mt-1 text-sm text-red-600">该缸号下已存在此匹号</p>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">入库数量</label>
                <input type="number" formControlName="quantity"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入入库数量" />
                @if (form.get('quantity')?.hasError('required') && form.get('quantity')?.touched) {
                  <p class="mt-1 text-sm text-red-600">数量必填</p>
                }
                @if (form.get('quantity')?.hasError('min') && form.get('quantity')?.touched) {
                  <p class="mt-1 text-sm text-red-600">数量必须大于0</p>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">质检状态</label>
                <select formControlName="qualityStatus"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option [value]="QualityStatus.待检">待检</option>
                  <option [value]="QualityStatus.合格">合格</option>
                  <option [value]="QualityStatus.不合格">不合格</option>
                  <option [value]="QualityStatus.让步接收">让步接收</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">入库时间</label>
                <input type="datetime-local" formControlName="inboundTime"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">生产日期</label>
                <input type="date" formControlName="productionDate"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div class="mt-6 flex gap-3">
              <button type="submit" 
                [disabled]="form.invalid || submitting()"
                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                {{ submitting() ? '入库中...' : '确认入库' }}
              </button>
              <a routerLink="/inventory/batches" 
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                取消
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InboundComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private inventoryService = inject(InventoryService);
  private warehouseService = inject(WarehouseService);

  QualityStatus = QualityStatus;
  warehouses = signal<Warehouse[]>([]);
  batches = signal<any[]>([]);
  submitting = signal(false);

  form: FormGroup = this.fb.group({
    batchId: ['', Validators.required],
    warehouseId: ['', Validators.required],
    dyeLotNo: ['', Validators.required],
    pieceNo: ['', Validators.required],
    quantity: [null, [Validators.required, Validators.min(1)]],
    qualityStatus: [QualityStatus.待检],
    inboundTime: [this.getCurrentDateTime(), Validators.required],
    productionDate: [null]
  });

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadBatches();
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (data) => this.warehouses.set(data),
      error: (err) => console.error('加载仓库失败', err)
    });
  }

  loadBatches(): void {
    this.inventoryService.getBatches().subscribe({
      next: (data) => this.batches.set(data),
      error: (err) => console.error('加载批次失败', err)
    });
  }

  getCurrentDateTime(): string {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  }

  自动生成缸号(): void {
    this.form.patchValue({ dyeLotNo: generateDyeLotNo() });
  }

  自动生成匹号(): void {
    this.form.patchValue({ pieceNo: generatePieceNo() });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formData = this.form.value;

    this.inventoryService.inbound(formData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/inventory/batches']);
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('入库失败', err);
      }
    });
  }
}
