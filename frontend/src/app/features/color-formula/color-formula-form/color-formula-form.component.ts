import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ColorFormulaService } from '../services/color-formula.service';
import { 颜色配方, 配方明细项 } from '../models/color-formula.model';
import { 配方状态 } from '../enums/color-formula.enum';

@Component({
  selector: 'app-color-formula-form',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="isEdit() ? '编辑配方' : '新增配方'" [subtitle]="isEdit() ? '修改配方信息' : '创建新配方'">
      <div class="flex gap-2">
        <button (click)="goBack()" class="erp-btn erp-btn-secondary">
          返回
        </button>
      </div>
    </app-page-header>

    <div class="erp-card p-6">
      <form (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="erp-label">配方编码 <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.code" name="code" required
              [disabled]="isEdit()"
              class="erp-input w-full" 
              [class.opacity-50]="isEdit()"
              placeholder="请输入配方编码" />
          </div>

          <div>
            <label class="erp-label">配方名称 <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.name" name="name" required
              class="erp-input w-full" placeholder="请输入配方名称" />
          </div>

          <div>
            <label class="erp-label">目标颜色名称 <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.targetColorName" name="targetColorName" required
              class="erp-input w-full" placeholder="请输入目标颜色名称" />
          </div>

          <div>
            <label class="erp-label">目标颜色ID <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.targetColorVariantId" name="targetColorVariantId" required
              class="erp-input w-full" placeholder="请输入目标颜色变体ID" />
          </div>

          <div>
            <label class="erp-label">版本</label>
            <input type="number" [(ngModel)]="formData.version" name="version" min="1"
              class="erp-input w-full" placeholder="请输入版本号" />
          </div>

          <div>
            <label class="erp-label">状态</label>
            <select [(ngModel)]="formData.status" name="status"
              class="erp-input w-full">
              <option [value]="formulaStatus.DRAFT">{{ statusLabel['DRAFT'] }}</option>
              <option [value]="formulaStatus.ACTIVE">{{ statusLabel['ACTIVE'] }}</option>
              <option [value]="formulaStatus.INACTIVE">{{ statusLabel['INACTIVE'] }}</option>
              <option [value]="formulaStatus.ARCHIVED">{{ statusLabel['ARCHIVED'] }}</option>
            </select>
          </div>
        </div>

        <!-- 配方明细 -->
        <div class="border-t pt-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium">配方明细</h3>
            <button type="button" (click)="addItem()"
              class="erp-btn erp-btn-secondary text-sm">
              添加原料
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">原料名称</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 120px">配比(%)</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 120px">用量</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 100px">单位</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 100px">操作</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @if (formData.items?.length === 0) {
                  <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                      暂无原料，请点击"添加原料"按钮添加
                    </td>
                  </tr>
                } @else {
                  @for (item of formData.items || []; track $index; let i = $index) {
                    <tr>
                      <td class="px-4 py-3">
                        <input type="text" [(ngModel)]="item.materialName" [name]="'materialName-' + i"
                          class="erp-input w-full" placeholder="原料名称" />
                      </td>
                      <td class="px-4 py-3">
                        <input type="number" step="0.01" [(ngModel)]="item.proportion" [name]="'proportion-' + i"
                          (ngModelChange)="recalculateTotal()"
                          class="erp-input w-full" placeholder="配比" />
                      </td>
                      <td class="px-4 py-3">
                        <input type="number" step="0.01" [(ngModel)]="item.dosage" [name]="'dosage-' + i"
                          (ngModelChange)="recalculateTotal()"
                          class="erp-input w-full" placeholder="用量" />
                      </td>
                      <td class="px-4 py-3">
                        <input type="text" [(ngModel)]="item.unit" [name]="'unit-' + i"
                          class="erp-input w-full" placeholder="单位" />
                      </td>
                      <td class="px-4 py-3 text-right">
                        <button type="button" (click)="removeItem(i)"
                          class="text-red-600 hover:text-red-800">
                          删除
                        </button>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>

          <div class="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <span class="text-gray-600">总用量:</span>
            <span class="text-xl font-bold">{{ formData.totalAmount }}</span>
          </div>
        </div>

        <div>
          <label class="erp-label">备注</label>
          <textarea [(ngModel)]="formData.notes" name="notes" rows="3"
            class="erp-input w-full" placeholder="请输入备注信息"></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t">
          <button type="button" (click)="goBack()" class="erp-btn erp-btn-secondary">
            取消
          </button>
          <button type="submit" [disabled]="isSaving()"
            class="erp-btn erp-btn-primary">
            @if (isSaving()) {
              <span class="flex items-center gap-2">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                保存中...
              </span>
            } @else {
              保存
            }
          </button>
        </div>
      </form>
    </div>
  `
})
export class ColorFormulaFormComponent implements OnInit {
  private readonly colorFormulaService = inject(ColorFormulaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly formulaStatus = 配方状态;

  readonly statusLabel = {
    [配方状态.DRAFT]: '草稿',
    [配方状态.ACTIVE]: '正式',
    [配方状态.INACTIVE]: '停用',
    [配方状态.ARCHIVED]: '归档'
  };

  isEdit = signal(false);
  isSaving = signal(false);
  formulaId = signal<string | null>(null);

  formData: Partial<颜色配方> = {
    code: '',
    name: '',
    targetColorVariantId: '',
    targetColorName: '',
    version: 1,
    status: 配方状态.DRAFT,
    items: [],
    totalAmount: 0,
    notes: ''
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.formulaId.set(id);
      this.loadFormula(id);
    }
  }

  loadFormula(id: string) {
    this.colorFormulaService.获取配方ById(id).subscribe({
      next: (formula) => {
        this.formData = { ...formula };
      }
    });
  }

  addItem() {
    const newItem: 配方明细项 = {
      materialId: '',
      materialName: '',
      proportion: 0,
      dosage: 0,
      unit: 'g'
    };
    if (!this.formData.items) {
      this.formData.items = [];
    }
    this.formData.items.push(newItem);
  }

  removeItem(index: number) {
    this.formData.items?.splice(index, 1);
    this.recalculateTotal();
  }

  recalculateTotal() {
    if (this.formData.items && this.formData.items.length > 0) {
      this.formData.totalAmount = this.formData.items.reduce((sum, item) => sum + (item.dosage || 0), 0);
    } else {
      this.formData.totalAmount = 0;
    }
  }

  onSubmit() {
    if (!this.formData.code || !this.formData.name || !this.formData.targetColorVariantId || !this.formData.targetColorName) {
      return;
    }

    this.isSaving.set(true);
    this.recalculateTotal();

    const formulaData = this.formData as Omit<颜色配方, 'id'>;

    if (this.isEdit() && this.formulaId()) {
      this.colorFormulaService.更新配方(this.formulaId()!, formulaData).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.goBack();
        },
        error: () => {
          this.isSaving.set(false);
        }
      });
    } else {
      this.colorFormulaService.创建配方(formulaData).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.goBack();
        },
        error: () => {
          this.isSaving.set(false);
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
