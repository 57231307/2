import { Component, inject, signal, OnInit, Effect, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WarehouseService } from '../../services/warehouse.service';
import { Warehouse, WarehouseType, WarehouseStatus } from '../../models/warehouse.model';

@Component({
  selector: 'app-warehouse-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <a routerLink="/inventory/warehouses" class="text-blue-600 hover:text-blue-800">
          ← 返回仓库列表
        </a>
      </div>

      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-800">{{ isEdit() ? '编辑仓库' : '新增仓库' }}</h2>
        </div>
        <div class="p-6">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">仓库编码</label>
                <input type="text" formControlName="code"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入仓库编码" />
                @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
                  <p class="mt-1 text-sm text-red-600">仓库编码必填</p>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">仓库名称</label>
                <input type="text" formControlName="name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入仓库名称" />
                @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                  <p class="mt-1 text-sm text-red-600">仓库名称必填</p>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">仓库类型</label>
                <select formControlName="type"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">请选择仓库类型</option>
                  <option [value]="WarehouseType.原材料仓">原材料仓</option>
                  <option [value]="WarehouseType.成品仓">成品仓</option>
                  <option [value]="WarehouseType.染化料仓">染化料仓</option>
                </select>
                @if (form.get('type')?.hasError('required') && form.get('type')?.touched) {
                  <p class="mt-1 text-sm text-red-600">仓库类型必选</p>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select formControlName="status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option [value]="WarehouseStatus.启用">启用</option>
                  <option [value]="WarehouseStatus.停用">停用</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">地址</label>
                <input type="text" formControlName="address"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入地址" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">负责人</label>
                <input type="text" formControlName="manager"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入负责人" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">容量</label>
                <input type="number" formControlName="capacity"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入容量" />
              </div>
            </div>
            <div class="mt-6 flex gap-3">
              <button type="submit" 
                [disabled]="form.invalid"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                {{ isEdit() ? '保存' : '创建' }}
              </button>
              <a routerLink="/inventory/warehouses" 
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
export class WarehouseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private warehouseService = inject(WarehouseService);

  WarehouseType = WarehouseType;
  WarehouseStatus = WarehouseStatus;
  isEdit = signal(false);
  warehouseId = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    type: ['', Validators.required],
    status: [WarehouseStatus.启用],
    address: [''],
    manager: [''],
    capacity: [null]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.warehouseId.set(id);
      this.loadWarehouse(id);
    }
  }

  loadWarehouse(id: string): void {
    this.warehouseService.getWarehouseById(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          code: data.code,
          name: data.name,
          type: data.type,
          status: data.status,
          address: data.address || '',
          manager: data.manager || '',
          capacity: data.capacity || null
        });
      },
      error: (err) => console.error('加载仓库失败', err)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const warehouseData = this.form.value;
    if (this.isEdit() && this.warehouseId()) {
      this.warehouseService.updateWarehouse(this.warehouseId()!, warehouseData).subscribe({
        next: () => this.router.navigate(['/inventory/warehouses']),
        error: (err) => console.error('更新仓库失败', err)
      });
    } else {
      this.warehouseService.createWarehouse(warehouseData).subscribe({
        next: () => this.router.navigate(['/inventory/warehouses']),
        error: (err) => console.error('创建仓库失败', err)
      });
    }
  }
}
