import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { SupplierService } from '../services/supplier.service';
import { 供应商, 供应商查询参数 } from '../models/supplier.model';
import { 供应商类型, 供应商状态 } from '../enums/supplier.enum';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PageHeaderComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="供应商管理" subtitle="供应商信息管理">
      <div class="flex gap-2">
        <button routerLink="create" class="erp-btn erp-btn-primary">
          新增供应商
        </button>
      </div>
    </app-page-header>

    <div class="space-y-4">
      <div class="erp-card p-4">
        <div class="flex gap-4 flex-wrap">
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">供应商编码</label>
            <input type="text" [(ngModel)]="searchParams.code" (ngModelChange)="onSearchChange()"
              placeholder="请输入供应商编码" class="erp-input w-full" />
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">供应商名称</label>
            <input type="text" [(ngModel)]="searchParams.name" (ngModelChange)="onSearchChange()"
              placeholder="请输入供应商名称" class="erp-input w-full" />
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">供应商类型</label>
            <select [(ngModel)]="searchParams.type" (ngModelChange)="onSearchChange()"
              class="erp-input w-full">
              <option value="">全部</option>
              <option value="YARN">纱线</option>
              <option value="DYE_CHEMICAL">染料化工</option>
              <option value="FABRIC_PROCESSING">面料加工</option>
            </select>
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">状态</label>
            <select [(ngModel)]="searchParams.status" (ngModelChange)="onSearchChange()"
              class="erp-input w-full">
              <option value="">全部</option>
              <option [value]="'ENABLED'">{{ supplierStatusLabel['ENABLED'] }}</option>
              <option [value]="'DISABLED'">{{ supplierStatusLabel['DISABLED'] }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="erp-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 120px">供应商编码</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">供应商名称</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 120px">类型</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联系人</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 120px">电话</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 80px">状态</th>
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
              } @else if (supplierList().length === 0) {
                <tr>
                  <td colspan="7" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
                </tr>
              } @else {
                @for (supplier of supplierList(); track supplier.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ supplier.code }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ supplier.name }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ getTypeName(supplier.type) }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ supplier.contactPerson || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ supplier.phone || '-' }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span [class]="getStatusClass(supplier.status)">
                        {{ getStatusName(supplier.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right text-sm">
                      <a [routerLink]="[supplier.id]"
                        class="text-primary-600 hover:text-primary-800 mr-3">
                        编辑
                      </a>
                      <button (click)="confirmDelete(supplier)"
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
          <p class="text-gray-600 mb-6">确定要删除供应商 "{{ supplierToDelete()?.name }}" 吗？此操作不可撤销。</p>
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
export class SupplierListComponent implements OnInit {
  private readonly supplierService = inject(SupplierService);

  readonly supplierType = 供应商类型;
  readonly supplierStatus = 供应商状态;

  readonly supplierTypeLabel: Record<string, string> = {
    'YARN': '纱线',
    'DYE_CHEMICAL': '染料化工',
    'FABRIC_PROCESSING': '面料加工'
  };

  readonly supplierStatusLabel: Record<string, string> = {
    'ENABLED': '启用',
    'DISABLED': '停用'
  };

  supplierList = signal<供应商[]>([]);
  isLoading = signal(false);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  searchParams: 供应商查询参数 = {
    code: '',
    name: '',
    type: '',
    status: ''
  };

  showConfirmDialog = signal(false);
  supplierToDelete = signal<供应商 | null>(null);

  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.loadSupplierList();
  }

  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadSupplierList();
    }, 300);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadSupplierList();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadSupplierList();
  }

  loadSupplierList() {
    this.isLoading.set(true);
    const params: 供应商查询参数 = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      ...this.searchParams
    };

    this.supplierService.获取供应商列表(params).subscribe({
      next: (result) => {
        this.supplierList.set(result.items);
        this.totalCount.set(result.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  confirmDelete(supplier: 供应商) {
    this.supplierToDelete.set(supplier);
    this.showConfirmDialog.set(true);
  }

  cancelDelete() {
    this.showConfirmDialog.set(false);
    this.supplierToDelete.set(null);
  }

  executeDelete() {
    const supplier = this.supplierToDelete();
    if (supplier?.id) {
      this.supplierService.删除供应商(supplier.id).subscribe({
        next: () => {
          this.cancelDelete();
          this.loadSupplierList();
        }
      });
    }
  }

  getTypeName(type: string): string {
    return this.supplierTypeLabel[type as 供应商类型] || type;
  }

  getStatusName(status: string): string {
    return this.supplierStatusLabel[status as 供应商状态] || status;
  }

  getStatusClass(status: string): string {
    return status === 'ENABLED'
      ? 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800'
      : 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800';
  }
}
