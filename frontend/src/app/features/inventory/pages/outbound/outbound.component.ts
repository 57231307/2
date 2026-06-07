import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { InventoryBatch } from '../../models/batch.model';

@Component({
  selector: 'app-outbound',
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
          <h2 class="text-xl font-bold text-gray-800">出库操作</h2>
        </div>
        <div class="p-6">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-2 gap-6">
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">批次</label>
                <select formControlName="batchId" (change)="onBatchChange()"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">请选择批次</option>
                  @for (batch of batches(); track batch.id) {
                    <option [value]="batch.id">
                      {{ batch.batchCode }} - {{ batch.productName }} - 缸号:{{ batch.dyeLotNo }} 匹号:{{ batch.pieceNo }} (库存:{{ batch.quantity }}{{ batch.unit }})
                    </option>
                  }
                </select>
                @if (form.get('batchId')?.hasError('required') && form.get('batchId')?.touched) {
                  <p class="mt-1 text-sm text-red-600">请选择批次</p>
                }
              </div>
              @if (selectedBatch()) {
                <div class="col-span-2 p-4 bg-gray-50 rounded-lg">
                  <div class="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span class="text-gray-500">批次编码：</span>
                      <span class="font-mono">{{ selectedBatch()!.batchCode }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">产品：</span>
                      <span>{{ selectedBatch()!.productName }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">颜色：</span>
                      <span>{{ selectedBatch()!.colorCode }} {{ selectedBatch()!.colorName }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">当前库存：</span>
                      <span class="font-bold text-green-600">{{ selectedBatch()!.quantity }} {{ selectedBatch()!.unit }}</span>
                    </div>
                  </div>
                </div>
              }
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">出库数量</label>
                <input type="number" formControlName="quantity"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入出库数量" />
                @if (form.get('quantity')?.hasError('required') && form.get('quantity')?.touched) {
                  <p class="mt-1 text-sm text-red-600">数量必填</p>
                }
                @if (form.get('quantity')?.hasError('max') && form.get('quantity')?.touched) {
                  <p class="mt-1 text-sm text-red-600">出库数量不能超过库存</p>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">出库时间</label>
                <input type="datetime-local" formControlName="outboundTime"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">出库去向</label>
                <textarea formControlName="destination" rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入出库去向，如：客户名称、发货地址等"></textarea>
                @if (form.get('destination')?.hasError('required') && form.get('destination')?.touched) {
                  <p class="mt-1 text-sm text-red-600">去向必填</p>
                }
              </div>
            </div>
            <div class="mt-6 flex gap-3">
              <button type="submit" 
                [disabled]="form.invalid || submitting()"
                class="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400">
                {{ submitting() ? '出库中...' : '确认出库' }}
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
export class OutboundComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private inventoryService = inject(InventoryService);

  batches = signal<InventoryBatch[]>([]);
  selectedBatch = signal<InventoryBatch | null>(null);
  submitting = signal(false);

  form: FormGroup = this.fb.group({
    batchId: ['', Validators.required],
    quantity: [null, [Validators.required, Validators.min(1)]],
    destination: ['', Validators.required],
    outboundTime: [this.getCurrentDateTime(), Validators.required]
  });

  ngOnInit(): void {
    this.loadBatches();
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

  onBatchChange(): void {
    const batchId = this.form.get('batchId')?.value;
    if (batchId) {
      const batch = this.batches().find(b => b.id === batchId);
      this.selectedBatch.set(batch || null);
      if (batch) {
        this.form.patchValue({ quantity: null });
        this.form.get('quantity')?.setValidators([Validators.required, Validators.min(1), Validators.max(batch.quantity)]);
      }
    } else {
      this.selectedBatch.set(null);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formData = this.form.value;

    this.inventoryService.outbound(formData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/inventory/batches']);
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('出库失败', err);
      }
    });
  }
}
