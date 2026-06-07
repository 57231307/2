import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ApiService } from '@core/services/api.service';
import { 产品, 产品颜色变体 } from '../models/product.model';
import { 产品类型, 产品状态, 颜色变体状态 } from '@shared/enums/product.enums';
import { ColorVariantDialogComponent } from '../components/color-variant-dialog/color-variant-dialog.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PageHeaderComponent, ColorVariantDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="isNewMode() ? '新建产品' : '编辑产品'" [subtitle]="isNewMode() ? '创建新的产品' : '编辑产品信息'">
      <a routerLink="/product" class="erp-btn erp-btn-secondary">
        返回列表
      </a>
    </app-page-header>

    @if (isLoading()) {
      <div class="erp-card p-8 text-center">
        <span class="text-gray-500">加载中...</span>
      </div>
    } @else {
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="erp-card p-6">
            <h3 class="text-lg font-semibold mb-4">基本信息</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="erp-label">
                  产品编码 <span class="text-red-500">*</span>
                </label>
                <input type="text" [(ngModel)]="productData.code"
                  [disabled]="isNewMode()"
                  placeholder="请输入产品编码" class="erp-input w-full" />
              </div>
              <div>
                <label class="erp-label">
                  产品名称 <span class="text-red-500">*</span>
                </label>
                <input type="text" [(ngModel)]="productData.name"
                  placeholder="请输入产品名称" class="erp-input w-full" />
              </div>
              <div>
                <label class="erp-label">产品类型</label>
                <select [(ngModel)]="productData.type" class="erp-input w-full">
                  <option [value]="fabricType">{{ fabricTypeLabel }}</option>
                  <option [value]="accessoryType">{{ accessoryTypeLabel }}</option>
                  <option [value]="finishedProductType">{{ finishedProductTypeLabel }}</option>
                </select>
              </div>
              <div>
                <label class="erp-label">单位</label>
                <input type="text" [(ngModel)]="productData.unit"
                  placeholder="如：米、码、件" class="erp-input w-full" />
              </div>
              <div>
                <label class="erp-label">状态</label>
                <select [(ngModel)]="productData.status" class="erp-input w-full">
                  <option [value]="statusEnabled">{{ statusEnabledLabel }}</option>
                  <option [value]="statusDisabled">{{ statusDisabledLabel }}</option>
                </select>
              </div>
              <div class="col-span-2">
                <label class="erp-label">描述</label>
                <textarea [(ngModel)]="productData.description"
                  rows="3" placeholder="请输入产品描述" class="erp-input w-full"></textarea>
              </div>
            </div>
          </div>

          <div class="erp-card p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">颜色变体管理</h3>
              <button (click)="openAddColorDialog()"
                class="erp-btn erp-btn-primary">
                添加颜色
              </button>
            </div>

            @if (!productData.colorVariants || productData.colorVariants.length === 0) {
              <div class="text-center py-8 text-gray-500">
                暂无颜色变体，请点击"添加颜色"按钮添加
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-gray-200">
                      <th class="text-left py-3 px-4 font-semibold text-gray-600">默认</th>
                      <th class="text-left py-3 px-4 font-semibold text-gray-600">颜色编号</th>
                      <th class="text-left py-3 px-4 font-semibold text-gray-600">颜色名称</th>
                      <th class="text-left py-3 px-4 font-semibold text-gray-600">色号</th>
                      <th class="text-left py-3 px-4 font-semibold text-gray-600">价格</th>
                      <th class="text-left py-3 px-4 font-semibold text-gray-600">状态</th>
                      <th class="text-left py-3 px-4 font-semibold text-gray-600">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (variant of productData.colorVariants; track variant.id || $index) {
                      <tr class="border-b border-gray-100 hover:bg-gray-50">
                        <td class="py-3 px-4">
                          @if (variant.isDefault) {
                            <span class="text-primary-600">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                              </svg>
                            </span>
                          } @else {
                            <span class="text-gray-300">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                              </svg>
                            </span>
                          }
                        </td>
                        <td class="py-3 px-4">{{ variant.colorCode }}</td>
                        <td class="py-3 px-4">{{ variant.colorName }}</td>
                        <td class="py-3 px-4">
                          <div class="flex items-center gap-2">
                            @if (variant.colorHex) {
                              <span class="w-6 h-6 rounded border border-gray-300"
                                [style.background-color]="variant.colorHex"></span>
                            }
                            <span class="text-sm text-gray-600">{{ variant.colorHex || '-' }}</span>
                          </div>
                        </td>
                        <td class="py-3 px-4">¥{{ variant.price | number:'1.2-2' }}</td>
                        <td class="py-3 px-4">
                          <span [class]="getColorStatusClass(variant.status)">
                            {{ getColorStatusName(variant.status) }}
                          </span>
                        </td>
                        <td class="py-3 px-4">
                          <button (click)="editColorVariant(variant)"
                            class="text-primary-600 hover:text-primary-800 mr-3">
                            编辑
                          </button>
                          <button (click)="confirmDeleteColorVariant(variant)"
                            class="text-red-600 hover:text-red-800">
                            删除
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>

        <div class="space-y-6">
          <div class="erp-card p-6">
            <h3 class="text-lg font-semibold mb-4">产品图片</h3>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p class="text-gray-600 mb-2">点击上传产品图片</p>
              <p class="text-sm text-gray-400">支持 JPG、PNG 格式</p>
            </div>
          </div>

          <div class="erp-card p-6">
            <h3 class="text-lg font-semibold mb-4">关联花型</h3>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
              </svg>
              <p class="text-gray-600 mb-2">点击选择关联花型</p>
              <p class="text-sm text-gray-400">从花型库中选择</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button (click)="cancel()" class="erp-btn erp-btn-secondary">
          取消
        </button>
        <button (click)="saveProduct()" class="erp-btn erp-btn-primary">
          保存
        </button>
      </div>
    }

    <app-color-variant-dialog
      [isVisible]="showColorDialog()"
      [colorVariant]="editingColorVariant()"
      [productId]="productData.id || ''"
      [existingColorCodes]="existingColorCodes()"
      (saveEvent)="onColorVariantSave($event)"
      (closeEvent)="closeColorDialog()"
    />

    @if (showDeleteConfirmDialog()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-96">
          <h3 class="text-lg font-semibold mb-4">确认删除</h3>
          <p class="text-gray-600 mb-6">
            确定要删除颜色 "{{ colorVariantToDelete()?.colorName }}" 吗？
          </p>
          <div class="flex justify-end gap-3">
            <button (click)="cancelDeleteColorVariant()"
              class="erp-btn erp-btn-secondary">
              取消
            </button>
            <button (click)="executeDeleteColorVariant()"
              class="erp-btn erp-btn-danger">
              删除
            </button>
          </div>
        </div>
      </div>
    }

    @if (showSaveSuccess()) {
      <div class="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
        保存成功
      </div>
    }
  `
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);

  protected readonly 产品类型 = 产品类型;
  protected readonly 产品状态 = 产品状态;
  protected readonly 颜色变体状态 = 颜色变体状态;

  // 产品类型
  readonly fabricType = 产品类型.面料;
  readonly accessoryType = 产品类型.辅料;
  readonly finishedProductType = 产品类型.成品;
  readonly fabricTypeLabel = '面料';
  readonly accessoryTypeLabel = '辅料';
  readonly finishedProductTypeLabel = '成品';

  // 产品状态
  readonly statusEnabled = 产品状态.启用;
  readonly statusDisabled = 产品状态.停用;
  readonly statusEnabledLabel = '启用';
  readonly statusDisabledLabel = '停用';

  productData: Partial<产品> = this.getInitialProductData();
  isLoading = signal(true);

  showColorDialog = signal(false);
  editingColorVariant = signal<产品颜色变体 | null>(null);
  existingColorCodes = computed(() =>
    (this.productData.colorVariants || []).map(v => v.colorCode)
  );

  showDeleteConfirmDialog = signal(false);
  colorVariantToDelete = signal<产品颜色变体 | null>(null);
  showSaveSuccess = signal(false);

  isNewMode = computed(() => !this.route.snapshot.paramMap.has('id'));

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'create') {
      this.loadProductDetail(id);
    } else {
      this.isLoading.set(false);
    }
  }

  private getInitialProductData(): Partial<产品> {
    return {
      code: '',
      name: '',
      type: 产品类型.面料,
      status: 产品状态.启用,
      unit: '米',
      description: '',
      imageUrls: [],
      colorVariants: []
    };
  }

  private loadProductDetail(id: string) {
    this.api.get<产品>(`/v1/products/${id}`).subscribe({
      next: (product) => {
        this.productData = { ...product };
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/product']);
      }
    });
  }

  openAddColorDialog() {
    this.editingColorVariant.set(null);
    this.showColorDialog.set(true);
  }

  editColorVariant(variant: 产品颜色变体) {
    this.editingColorVariant.set({ ...variant });
    this.showColorDialog.set(true);
  }

  closeColorDialog() {
    this.showColorDialog.set(false);
    this.editingColorVariant.set(null);
  }

  onColorVariantSave(data: Partial<产品颜色变体>) {
    if (this.editingColorVariant()) {
      const index = this.productData.colorVariants?.findIndex(
        v => v.id === this.editingColorVariant()?.id
      );
      if (index !== undefined && index >= 0) {
        this.productData.colorVariants = [...(this.productData.colorVariants || [])];
        this.productData.colorVariants[index] = {
          ...this.productData.colorVariants[index],
          ...data,
          id: this.editingColorVariant()?.id
        } as 产品颜色变体;
      }
    } else {
      const newVariant: 产品颜色变体 = {
        ...data,
        id: crypto.randomUUID()
      } as 产品颜色变体;
      this.productData.colorVariants = [...(this.productData.colorVariants || []), newVariant];
    }
    this.closeColorDialog();
  }

  confirmDeleteColorVariant(variant: 产品颜色变体) {
    this.colorVariantToDelete.set(variant);
    this.showDeleteConfirmDialog.set(true);
  }

  cancelDeleteColorVariant() {
    this.showDeleteConfirmDialog.set(false);
    this.colorVariantToDelete.set(null);
  }

  executeDeleteColorVariant() {
    const variant = this.colorVariantToDelete();
    if (variant) {
      this.productData.colorVariants = (this.productData.colorVariants || [])
        .filter(v => v.id !== variant.id);
    }
    this.cancelDeleteColorVariant();
  }

  cancel() {
    this.router.navigate(['/product']);
  }

  saveProduct() {
    if (!this.productData.code?.trim()) {
      alert('请输入产品编码');
      return;
    }
    if (!this.productData.name?.trim()) {
      alert('请输入产品名称');
      return;
    }

    if (this.isNewMode()) {
      this.api.post<产品>('/v1/products', this.productData).subscribe({
        next: () => {
          this.displaySaveSuccess();
          setTimeout(() => this.router.navigate(['/product']), 1000);
        }
      });
    } else {
      this.api.put<产品>(`/v1/products/${this.productData.id}`, this.productData).subscribe({
        next: () => {
          this.displaySaveSuccess();
        }
      });
    }
  }

  private displaySaveSuccess() {
    this.showSaveSuccess.set(true);
    setTimeout(() => this.showSaveSuccess.set(false), 2000);
  }

  getTypeName(type: string): string {
    switch (type) {
      case 产品类型.面料: return '面料';
      case 产品类型.辅料: return '辅料';
      case 产品类型.成品: return '成品';
      default: return type;
    }
  }

  getStatusName(status: string): string {
    switch (status) {
      case 产品状态.启用: return '启用';
      case 产品状态.停用: return '停用';
      default: return status;
    }
  }

  getColorStatusName(status: string): string {
    switch (status) {
      case 颜色变体状态.启用: return '启用';
      case 颜色变体状态.停用: return '停用';
      default: return status;
    }
  }

  getColorStatusClass(status: string): string {
    return status === 颜色变体状态.启用
      ? 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800'
      : 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800';
  }
}
