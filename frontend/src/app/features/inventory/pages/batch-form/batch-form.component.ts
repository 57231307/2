import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AsyncValidator } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { WarehouseService } from '../../services/warehouse.service';
import { Warehouse } from '../../models/warehouse.model';
import { InventoryBatch } from '../../models/batch.model';
import { QualityStatus } from '../../shared/enums/batch.enum';
import { generateDyeLotNo, generatePieceNo, PieceNoValidator } from '../../services/validators';

@Component({
  selector: 'app-batch-form',
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
          <h2 class="text-xl font-bold text-gray-800">批次详情</h2>
        </div>
        <div class="p-6">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">仓库</label>
                <select formControlName="warehouseId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">请选择仓库</option>
                  @for (warehouse of warehouses(); track warehouse.id) {
                    <option [value]="warehouse.id">{{ warehouse.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">产品名称</label>
                <input type="text" formControlName="productName"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入产品名称" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">颜色编码</label>
                <input type="text" formControlName="colorCode"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入颜色编码" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">颜色名称</label>
                <input type="text" formControlName="colorName"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入颜色名称" />
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
                @if (form.get('pieceNo')?.hasError('notUnique') && form.get('pieceNo')?.touched) {
                  <p class="mt-1 text-sm text-red-600">该缸号下已存在此匹号</p>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">数量</label>
                <input type="number" formControlName="quantity"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入数量" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">单位</label>
                <input type="text" formControlName="unit"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="如：件、米、千克" />
              </div>
            </div>
            <div class="mt-6 flex gap-3">
              <button type="submit" 
                [disabled]="form.invalid"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                保存
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
export class BatchFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inventoryService = inject(InventoryService);
  private warehouseService = inject(WarehouseService);
  private pieceNoValidator = inject(PieceNoValidator);

  warehouses = signal<Warehouse[]>([]);
  batchId = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    warehouseId: ['', Validators.required],
    productName: ['', Validators.required],
    colorCode: ['', Validators.required],
    colorName: ['', Validators.required],
    dyeLotNo: ['', Validators.required],
    pieceNo: ['', Validators.required],
    quantity: [null, [Validators.required, Validators.min(0)]],
    unit: ['件', Validators.required]
  });

  ngOnInit(): void {
    this.loadWarehouses();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.batchId.set(id);
      this.loadBatch(id);
    }
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (data) => this.warehouses.set(data),
      error: (err) => console.error('加载仓库失败', err)
    });
  }

  loadBatch(id: string): void {
    this.inventoryService.getBatchById(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          warehouseId: data.warehouseId,
          productName: data.productName,
          colorCode: data.colorCode,
          colorName: data.colorName,
          dyeLotNo: data.dyeLotNo,
          pieceNo: data.pieceNo,
          quantity: data.quantity,
          unit: data.unit
        });
      },
      error: (err) => console.error('加载批次失败', err)
    });
  }

  自动生成缸号(): void {
    this.form.patchValue({ dyeLotNo: generateDyeLotNo() });
  }

  自动生成匹号(): void {
    this.form.patchValue({ pieceNo: generatePieceNo() });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formData = this.form.value;
    if (this.batchId()) {
      this.inventoryService.updateBatch(this.batchId()!, formData).subscribe({
        next: () => this.router.navigate(['/inventory/batches']),
        error: (err) => console.error('更新批次失败', err)
      });
    } else {
      this.inventoryService.createBatch(formData).subscribe({
        next: () => this.router.navigate(['/inventory/batches']),
        error: (err) => console.error('创建批次失败', err)
      });
    }
  }
}
