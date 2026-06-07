import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { CustomerService } from '../services/customer.service';
import { 客户, 客户查询参数 } from '../models/customer.model';
import { 客户类型, 客户状态 } from '../enums/customer.enum';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PageHeaderComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="客户管理" subtitle="客户信息管理">
      <div class="flex gap-2">
        <button routerLink="create" class="erp-btn erp-btn-primary">
          新增客户
        </button>
      </div>
    </app-page-header>

    <div class="space-y-4">
      <div class="erp-card p-4">
        <div class="flex gap-4 flex-wrap">
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">客户编码</label>
            <input type="text" [(ngModel)]="searchParams.code" (ngModelChange)="onSearchChange()"
              placeholder="请输入客户编码" class="erp-input w-full" />
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">客户名称</label>
            <input type="text" [(ngModel)]="searchParams.name" (ngModelChange)="onSearchChange()"
              placeholder="请输入客户名称" class="erp-input w-full" />
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">客户类型</label>
            <select [(ngModel)]="searchParams.type" (ngModelChange)="onSearchChange()"
              class="erp-input w-full">
              <option value="">全部</option>
              <option [value]="'BRAND'">{{ customerTypeLabel['BRAND'] }}</option>
              <option [value]="'TRADER'">{{ customerTypeLabel['TRADER'] }}</option>
              <option [value]="'RETAIL'">{{ customerTypeLabel['RETAIL'] }}</option>
            </select>
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">状态</label>
            <select [(ngModel)]="searchParams.status" (ngModelChange)="onSearchChange()"
              class="erp-input w-full">
              <option value="">全部</option>
              <option [value]="'ENABLED'">{{ customerStatusLabel['ENABLED'] }}</option>
              <option [value]="'DISABLED'">{{ customerStatusLabel['DISABLED'] }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="erp-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 120px">客户编码</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户名称</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 100px">类型</th>
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
              } @else if (customerList().length === 0) {
                <tr>
                  <td colspan="7" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
                </tr>
              } @else {
                @for (customer of customerList(); track customer.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ customer.code }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ customer.name }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ getTypeName(customer.type) }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ customer.contactPerson || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ customer.phone || '-' }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span [class]="getStatusClass(customer.status)">
                        {{ getStatusName(customer.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right text-sm">
                      <a [routerLink]="[customer.id]"
                        class="text-primary-600 hover:text-primary-800 mr-3">
                        编辑
                      </a>
                      <button (click)="confirmDelete(customer)"
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
          <p class="text-gray-600 mb-6">确定要删除客户 "{{ customerToDelete()?.name }}" 吗？此操作不可撤销。</p>
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
export class CustomerListComponent implements OnInit {
  private readonly customerService = inject(CustomerService);

  readonly customerType = 客户类型;
  readonly customerStatus = 客户状态;

  readonly customerTypeLabel: Record<string, string> = {
    'BRAND': '品牌商',
    'TRADER': '贸易商',
    'RETAIL': '散客'
  };

  readonly customerStatusLabel: Record<string, string> = {
    'ENABLED': '启用',
    'DISABLED': '停用'
  };

  customerList = signal<客户[]>([]);
  isLoading = signal(false);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  searchParams: 客户查询参数 = {
    code: '',
    name: '',
    type: '',
    status: ''
  };

  showConfirmDialog = signal(false);
  customerToDelete = signal<客户 | null>(null);

  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.loadCustomerList();
  }

  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadCustomerList();
    }, 300);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadCustomerList();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadCustomerList();
  }

  loadCustomerList() {
    this.isLoading.set(true);
    const params: 客户查询参数 = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      ...this.searchParams
    };

    this.customerService.获取客户列表(params).subscribe({
      next: (result) => {
        this.customerList.set(result.items);
        this.totalCount.set(result.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  confirmDelete(customer: 客户) {
    this.customerToDelete.set(customer);
    this.showConfirmDialog.set(true);
  }

  cancelDelete() {
    this.showConfirmDialog.set(false);
    this.customerToDelete.set(null);
  }

  executeDelete() {
    const customer = this.customerToDelete();
    if (customer?.id) {
      this.customerService.删除客户(customer.id).subscribe({
        next: () => {
          this.cancelDelete();
          this.loadCustomerList();
        }
      });
    }
  }

  getTypeName(type: string): string {
    return this.customerTypeLabel[type as 客户类型] || type;
  }

  getStatusName(status: string): string {
    return this.customerStatusLabel[status as 客户状态] || status;
  }

  getStatusClass(status: string): string {
    return status === 'ENABLED'
      ? 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800'
      : 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800';
  }
}
