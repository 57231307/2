import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '@shared/components/data-table/data-table.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ApiService } from '@core/services/api.service';
import { 产品, 分页结果, 产品查询参数 } from '../models/product.model';
import { 产品类型, 产品状态 } from '@shared/enums/product.enums';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PageHeaderComponent, DataTableComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="产品管理" subtitle="管理面料产品信息">
      <div class="flex gap-2">
        <button (click)="exportProducts()"
          class="erp-btn erp-btn-secondary">
          导出
        </button>
        <button routerLink="create"
          class="erp-btn erp-btn-primary">
          新增产品
        </button>
      </div>
    </app-page-header>

    <div class="space-y-4">
      <div class="erp-card p-4">
        <div class="flex gap-4 flex-wrap">
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">产品编码</label>
            <input type="text" [(ngModel)]="searchParams.code" (ngModelChange)="onSearchChange()"
              placeholder="请输入产品编码" class="erp-input w-full" />
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">产品名称</label>
            <input type="text" [(ngModel)]="searchParams.name" (ngModelChange)="onSearchChange()"
              placeholder="请输入产品名称" class="erp-input w-full" />
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">产品类型</label>
            <select [(ngModel)]="searchParams.type" (ngModelChange)="onSearchChange()"
              class="erp-input w-full">
              <option value="">全部</option>
              <option [value]="fabricType">{{ fabricTypeLabel }}</option>
              <option [value]="accessoryType">{{ accessoryTypeLabel }}</option>
              <option [value]="finishedProductType">{{ finishedProductTypeLabel }}</option>
            </select>
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">状态</label>
            <select [(ngModel)]="searchParams.status" (ngModelChange)="onSearchChange()"
              class="erp-input w-full">
              <option value="">全部</option>
              <option [value]="statusEnabled">{{ statusEnabledLabel }}</option>
              <option [value]="statusDisabled">{{ statusDisabledLabel }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="erp-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 120px">产品编码</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">产品名称</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 100px">类型</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 80px">单位</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 100px">状态</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 100px">颜色变体</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @if (isLoading()) {
                <tr>
                  <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                    <div class="flex items-center justify-center gap-2">
                      <div class="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>加载中...</span>
                    </div>
                  </td>
                </tr>
              } @else if (productList().length === 0) {
                <tr>
                  <td colspan="7" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
                </tr>
              } @else {
                @for (product of productList(); track product.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ product.code }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ product.name }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ getTypeName(product.type) }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ product.unit }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span [class]="getStatusClass(product.status)">
                        {{ getStatusName(product.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ product.colorVariants?.length || 0 }}</td>
                    <td class="px-4 py-3 text-right text-sm">
                      <a [routerLink]="[product.id]"
                        class="text-primary-600 hover:text-primary-800 mr-3">
                        编辑
                      </a>
                      <button (click)="confirmDeleteProduct(product)"
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

        <app-pagination
          [(total)]="totalCount"
          [(current)]="currentPage"
          [(pageSize)]="pageSize"
          (pageChange)="onPageChange($event)"
          (pageSizeChange)="onPageSizeChange($event)"
        />
      </div>
    </div>

    @if (showConfirmDialog()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-96">
          <h3 class="text-lg font-semibold mb-4">确认删除</h3>
          <p class="text-gray-600 mb-6">确定要删除产品 "{{ productToDelete()?.name }}" 吗？此操作不可撤销。</p>
          <div class="flex justify-end gap-3">
            <button (click)="cancelDelete()"
              class="erp-btn erp-btn-secondary">
              取消
            </button>
            <button (click)="executeDelete()"
              class="erp-btn erp-btn-danger">
              删除
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ProductListComponent {
  private readonly api = inject(ApiService);

  protected readonly 产品类型 = 产品类型;
  protected readonly 产品状态 = 产品状态;

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

  productList = signal<产品[]>([]);
  isLoading = signal(false);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  searchParams: 产品查询参数 = {
    code: '',
    name: '',
    type: '',
    status: ''
  };

  showConfirmDialog = signal(false);
  productToDelete = signal<产品 | null>(null);

  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.loadProductList();
  }

  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadProductList();
    }, 300);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadProductList();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadProductList();
  }

  loadProductList() {
    this.isLoading.set(true);
    const params: 产品查询参数 = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      ...this.searchParams
    };

    this.api.get<分页结果<产品>>('/v1/products', { params: params as Record<string, string | number | boolean> }).subscribe({
      next: (result: 分页结果<产品>) => {
        this.productList.set(result.items);
        this.totalCount.set(result.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  exportProducts() {
    const headers = ['产品编码', '产品名称', '类型', '单位', '状态'];
    const rows = this.productList().map(p => [
      p.code,
      p.name,
      this.getTypeName(p.type),
      p.unit,
      this.getStatusName(p.status)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `产品列表_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  confirmDeleteProduct(product: 产品) {
    this.productToDelete.set(product);
    this.showConfirmDialog.set(true);
  }

  cancelDelete() {
    this.showConfirmDialog.set(false);
    this.productToDelete.set(null);
  }

  executeDelete() {
    const product = this.productToDelete();
    if (product?.id) {
      this.api.delete(`/v1/products/${product.id}`).subscribe({
        next: () => {
          this.cancelDelete();
          this.loadProductList();
        }
      });
    }
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

  getStatusClass(status: string): string {
    return status === 产品状态.启用
      ? 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800'
      : 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800';
  }
}
