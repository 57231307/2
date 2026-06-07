import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 产品颜色变体 } from '../../models/product.model';
import { 颜色变体状态 } from '@shared/enums/product.enums';

@Component({
  selector: 'app-color-variant-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isVisible()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-[480px] max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">{{ isEditMode() ? '编辑颜色变体' : '添加颜色变体' }}</h3>
            <button (click)="close()" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            @if (errorMessage()) {
              <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {{ errorMessage() }}
              </div>
            }

            <div>
              <label class="erp-label">
                颜色编号 <span class="text-red-500">*</span>
              </label>
              <input type="text" [(ngModel)]="formData.colorCode"
                placeholder="请输入颜色编号" class="erp-input w-full" />
            </div>

            <div>
              <label class="erp-label">
                颜色名称 <span class="text-red-500">*</span>
              </label>
              <input type="text" [(ngModel)]="formData.colorName"
                placeholder="请输入颜色名称" class="erp-input w-full" />
            </div>

            <div>
              <label class="erp-label">色号</label>
              <div class="flex gap-2">
                <input type="color" [(ngModel)]="formData.colorHex"
                  class="w-12 h-10 border border-gray-300 rounded cursor-pointer">
                <input type="text" [(ngModel)]="formData.colorHex"
                  placeholder="#FFFFFF" maxlength="7"
                  class="erp-input flex-1" />
              </div>
            </div>

            <div>
              <label class="erp-label">
                价格 <span class="text-red-500">*</span>
              </label>
              <input type="number" [(ngModel)]="formData.price"
                placeholder="请输入价格" min="0" step="0.01"
                class="erp-input w-full" />
            </div>

            <div>
              <label class="erp-label">状态</label>
              <select [(ngModel)]="formData.status" class="erp-input w-full">
                <option [value]="colorStatusEnabled">{{ statusEnabledLabel }}</option>
                <option [value]="colorStatusDisabled">{{ statusDisabledLabel }}</option>
              </select>
            </div>

            <div class="flex items-center">
              <input type="checkbox" id="isDefault" [(ngModel)]="formData.isDefault"
                class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500">
              <label for="isDefault" class="ml-2 text-sm text-gray-700">
                设为默认颜色
              </label>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button (click)="close()" class="erp-btn erp-btn-secondary">
              取消
            </button>
            <button (click)="save()" class="erp-btn erp-btn-primary">
              保存
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ColorVariantDialogComponent {
  isVisible = input(false);
  colorVariant = input<产品颜色变体 | null>(null);
  productId = input<string>('');
  existingColorCodes = input<string[]>([]);

  saveEvent = output<Partial<产品颜色变体>>();
  closeEvent = output<void>();

  protected readonly 颜色变体状态 = 颜色变体状态;

  readonly colorStatusEnabled = 颜色变体状态.启用;
  readonly colorStatusDisabled = 颜色变体状态.停用;
  readonly statusEnabledLabel = '启用';
  readonly statusDisabledLabel = '停用';

  formData: Partial<产品颜色变体> = this.getInitialFormData();
  errorMessage = signal<string>('');

  isEditMode = computed(() => !!this.colorVariant());

  ngOnChanges() {
    const variant = this.colorVariant();
    if (variant) {
      this.formData = { ...variant };
    } else {
      this.formData = this.getInitialFormData();
    }
    this.errorMessage.set('');
  }

  private getInitialFormData(): Partial<产品颜色变体> {
    return {
      colorCode: '',
      colorName: '',
      colorHex: '#FFFFFF',
      price: 0,
      status: 颜色变体状态.启用,
      isDefault: false
    };
  }

  close() {
    this.closeEvent.emit();
  }

  save() {
    if (!this.formData.colorCode?.trim()) {
      this.errorMessage.set('请输入颜色编号');
      return;
    }
    if (!this.formData.colorName?.trim()) {
      this.errorMessage.set('请输入颜色名称');
      return;
    }
    if (this.formData.price === undefined || this.formData.price < 0) {
      this.errorMessage.set('请输入有效的价格');
      return;
    }

    const existingCodes = this.existingColorCodes();
    const currentCode = this.formData.colorCode?.trim() || '';
    const originalCode = this.colorVariant()?.colorCode;

    const duplicateCode = existingCodes.find(
      code => code === currentCode && code !== originalCode
    );

    if (duplicateCode) {
      this.errorMessage.set(`颜色编号 "${duplicateCode}" 已存在，同一产品下颜色编号不能重复`);
      return;
    }

    const dataToSave: Partial<产品颜色变体> = {
      ...this.formData,
      productId: this.productId() || this.formData.productId
    };

    this.saveEvent.emit(dataToSave);
  }
}
