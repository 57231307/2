import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { CustomerContactService } from '../../services/customer-contact.service';
import { CustomerService } from '../../services/customer.service';
import { 客户联系人, 客户联系人查询参数 } from '../../models/customer-contact.model';
import { 客户 } from '../../models/customer.model';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PageHeaderComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="客户联系人管理" subtitle="客户联系人信息管理">
      <div class="flex gap-2">
        <button routerLink="create" class="erp-btn erp-btn-primary">
          新增联系人
        </button>
      </div>
    </app-page-header>

    <div class="space-y-4">
      <div class="erp-card p-4">
        <div class="flex gap-4 flex-wrap">
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">客户</label>
            <select [(ngModel)]="searchParams.customerId" (ngModelChange)="onSearchChange()"
              class="erp-input w-full">
              <option value="">全部客户</option>
              @for (customer of customers(); track customer.id) {
                <option [value]="customer.id">{{ customer.name }}</option>
              }
            </select>
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">搜索</label>
            <input type="text" [(ngModel)]="searchParams.search" (ngModelChange)="onSearchChange()"
              placeholder="姓名/电话/邮箱" class="erp-input w-full" />
          </div>
        </div>
      </div>

      <div class="erp-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联系人姓名</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">所属客户</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">职务</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">电话</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">默认</th>
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
              } @else if (contactList().length === 0) {
                <tr>
                  <td colspan="7" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
                </tr>
              } @else {
                @for (contact of contactList(); track contact.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ contact.contactName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ contact.customer?.name || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ contact.position || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ contact.phone || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ contact.email || '-' }}</td>
                    <td class="px-4 py-3 text-center">
                      @if (contact.isDefault) {
                        <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">默认</span>
                      }
                    </td>
                    <td class="px-4 py-3 text-right text-sm">
                      <a [routerLink]="[contact.id]"
                        class="text-primary-600 hover:text-primary-800 mr-3">
                        编辑
                      </a>
                      <button (click)="confirmDelete(contact)"
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
          <p class="text-gray-600 mb-6">确定要删除联系人 "{{ contactToDelete()?.contactName }}" 吗？此操作不可撤销。</p>
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
export class ContactListComponent implements OnInit {
  private readonly contactService = inject(CustomerContactService);
  private readonly customerService = inject(CustomerService);

  contactList = signal<客户联系人[]>([]);
  customers = signal<客户[]>([]);
  isLoading = signal(false);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  searchParams: 客户联系人查询参数 = {
    customerId: '',
    search: '',
    page: 1,
    pageSize: 10
  };

  showConfirmDialog = signal(false);
  contactToDelete = signal<客户联系人 | null>(null);

  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.loadCustomers();
    this.loadContactList();
  }

  loadCustomers() {
    this.customerService.获取客户列表({ page: 1, pageSize: 100 }).subscribe({
      next: (result) => {
        this.customers.set(result.items);
      }
    });
  }

  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadContactList();
    }, 300);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadContactList();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadContactList();
  }

  loadContactList() {
    this.isLoading.set(true);
    const params: 客户联系人查询参数 = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      ...this.searchParams
    };

    this.contactService.获取联系人列表(params).subscribe({
      next: (result) => {
        this.contactList.set(result.items);
        this.totalCount.set(result.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  confirmDelete(contact: 客户联系人) {
    this.contactToDelete.set(contact);
    this.showConfirmDialog.set(true);
  }

  cancelDelete() {
    this.showConfirmDialog.set(false);
    this.contactToDelete.set(null);
  }

  executeDelete() {
    const contact = this.contactToDelete();
    if (contact?.id) {
      this.contactService.删除联系人(contact.id).subscribe({
        next: () => {
          this.cancelDelete();
          this.loadContactList();
        }
      });
    }
  }
}
