import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QualityService } from '../services/quality.service';
import { InspectionType, QualityStandardStatus, QualityStandardItem } from '../models/quality.model';

@Component({
  selector: 'app-quality-standard-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">
          {{ isEdit() ? '编辑质检标准' : '新建质检标准' }}
        </h1>
        <button routerLink="/quality/standards" class="btn-secondary">
          返回列表
        </button>
      </div>

      <div class="card p-6">
        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- 基本信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                标准编号 <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="formData.code"
                name="code"
                required
                [disabled]="isEdit()"
                class="input-field w-full"
                [class.opacity-50]="isEdit()"
                placeholder="请输入标准编号"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                标准名称 <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="formData.name"
                name="name"
                required
                class="input-field w-full"
                placeholder="请输入标准名称"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                检验类型 <span class="text-red-500">*</span>
              </label>
              <select
                [(ngModel)]="selectedType"
                (ngModelChange)="onTypeChange()"
                name="type"
                required
                class="input-field w-full"
              >
                <option [ngValue]="0">{{ typeLabels[0] }}</option>
                <option [ngValue]="1">{{ typeLabels[1] }}</option>
                <option [ngValue]="2">{{ typeLabels[2] }}</option>
                <option [ngValue]="3">{{ typeLabels[3] }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                [(ngModel)]="selectedStatus"
                (ngModelChange)="onStatusChange()"
                name="status"
                class="input-field w-full"
              >
                <option [ngValue]="0">{{ statusLabels[0] }}</option>
                <option [ngValue]="1">{{ statusLabels[1] }}</option>
              </select>
            </div>
          </div>

          <!-- 检验项目 -->
          <div>
            <div class="flex justify-between items-center mb-4">
              <label class="block text-sm font-medium text-gray-700">
                检验项目 <span class="text-red-500">*</span>
              </label>
              <button type="button" (click)="addItem()" class="btn-secondary text-sm">
                添加项目
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600 w-8">#</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">项目名称</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">检测方法</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">合格范围</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">单位</th>
                    <th class="px-4 py-3 text-center text-sm font-medium text-gray-600 w-20">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  @for (item of items(); track $index; let i = $index) {
                    <tr>
                      <td class="px-4 py-3 text-sm text-gray-600">{{ i + 1 }}</td>
                      <td class="px-4 py-3">
                        <input
                          type="text"
                          [(ngModel)]="item.itemName"
                          [name]="'itemName-' + i"
                          required
                          class="input-field w-full"
                          placeholder="项目名称"
                        />
                      </td>
                      <td class="px-4 py-3">
                        <input
                          type="text"
                          [(ngModel)]="item.checkMethod"
                          [name]="'checkMethod-' + i"
                          class="input-field w-full"
                          placeholder="检测方法"
                        />
                      </td>
                      <td class="px-4 py-3">
                        <input
                          type="text"
                          [(ngModel)]="item.qualifiedRange"
                          [name]="'qualifiedRange-' + i"
                          class="input-field w-full"
                          placeholder="合格范围"
                        />
                      </td>
                      <td class="px-4 py-3">
                        <input
                          type="text"
                          [(ngModel)]="item.unit"
                          [name]="'unit-' + i"
                          class="input-field w-full"
                          placeholder="单位"
                        />
                      </td>
                      <td class="px-4 py-3 text-center">
                        <button
                          type="button"
                          (click)="removeItem(i)"
                          class="text-red-600 hover:text-red-800 text-sm"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                        暂无检验项目，请点击"添加项目"按钮添加
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="flex justify-end gap-4 pt-6 border-t">
            <button type="button" routerLink="/quality/standards" class="btn-secondary">
              取消
            </button>
            <button type="submit" class="btn-primary" [disabled]="submitting()">
              {{ submitting() ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QualityStandardFormComponent implements OnInit {
  private qualityService = inject(QualityService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly typeLabels = ['外观检验', '物理性能检验', '化学性能检验', '综合检验'];
  readonly statusLabels = ['启用', '停用'];
  readonly typeValues = ['外观检验', '物理性能检验', '化学性能检验', '综合检验'];
  readonly statusValues = ['启用', '停用'];

  isEdit = signal(false);
  submitting = signal(false);
  items = signal<QualityStandardItem[]>([]);
  standardId = signal<string | null>(null);

  selectedType = 0;
  selectedStatus = 0;

  formData: {
    code: string;
    name: string;
    type: string;
    status: string;
  } = {
    code: '',
    name: '',
    type: '外观检验',
    status: '启用'
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.standardId.set(id);
      this.loadStandard(id);
    }
  }

  loadStandard(id: string): void {
    this.qualityService.getQualityStandard(id).subscribe({
      next: (standard) => {
        this.formData = {
          code: standard.code,
          name: standard.name,
          type: standard.type,
          status: standard.status
        };
        this.selectedType = this.typeValues.indexOf(standard.type);
        this.selectedStatus = this.statusValues.indexOf(standard.status);
        this.items.set(standard.items.map(item => ({ ...item })));
      },
      error: (err) => {
        console.error('加载质检标准失败', err);
        this.router.navigate(['/quality/standards']);
      }
    });
  }

  onTypeChange(): void {
    this.formData.type = this.typeValues[this.selectedType];
  }

  onStatusChange(): void {
    this.formData.status = this.statusValues[this.selectedStatus];
  }

  addItem(): void {
    const newItem: QualityStandardItem = {
      id: '',
      itemName: '',
      checkMethod: '',
      qualifiedRange: '',
      unit: ''
    };
    this.items.update(items => [...items, newItem]);
  }

  removeItem(index: number): void {
    this.items.update(items => items.filter((_, i) => i !== index));
  }

  onSubmit(): void {
    if (this.items().length === 0) {
      alert('请至少添加一个检验项目');
      return;
    }

    this.submitting.set(true);

    const request = {
      ...this.formData,
      type: this.formData.type as InspectionType,
      status: this.formData.status as QualityStandardStatus,
      items: this.items().map(item => ({
        itemName: item.itemName,
        checkMethod: item.checkMethod,
        qualifiedRange: item.qualifiedRange,
        unit: item.unit
      }))
    };

    const observable = this.isEdit()
      ? this.qualityService.updateQualityStandard(this.standardId()!, request)
      : this.qualityService.createQualityStandard(request as any);

    observable.subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/quality/standards']);
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('保存质检标准失败', err);
      }
    });
  }
}