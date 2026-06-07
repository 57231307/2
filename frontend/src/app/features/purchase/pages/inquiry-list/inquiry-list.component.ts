import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { PurchaseService } from '../../services/purchase.service';
import { 询价单, 询价单状态, 询价单状态显示 } from '../../models/purchase-inquiry.model';

@Component({
  selector: 'app-inquiry-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PageHeaderComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="询价单管理" subtitle="采购询价单管理">
      <div class="flex gap-2">
        <button routerLink="create" class="erp-btn erp-btn-primary">
          新建询价
        </button>
        <button (click)="goToCompare()" [disabled]="selectedInquiries().length < 2" class="erp-btn erp-btn-secondary">
          对比询价单
        </button>
      </div>
    </app-page-header>

    <div class="space-y-4">
      <div class="erp-card p-4">
        <div class="flex gap-4 flex-wrap">
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">供应商</label>
            <select [(ngModel)]="searchParams.supplierId" (ngModelChange)="onSearchChange()"
              class="erp-input w-full">
              <option value="">全部供应商</option>
            </select>
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">状态</label>
            <select [(ngModel)]="searchParams.status" (ngModelChange)="onSearchChange()"
              class="erp-input w-full">
              <option value="">全部状态</option>
              @for (status of statusList; track status.value) {
                <option [value]="status.value">{{ status.label }}</option>
              }
            </select>
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">搜索</label>
            <input type="text" [(ngModel)]="searchParams.search" (ngModelChange)="onSearchChange()"
              placeholder="询价单号" class="erp-input w-full" />
          </div>
        </div>
      </div>

      <div class="erp-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 40px">
                  <input type="checkbox" (change)="toggleSelectAll($event)" [checked]="isAllSelected()" />
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">询价单号</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">供应商</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">询价日期</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">有效期至</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">总金额</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @if (isLoading()) {
                <tr>
                  <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                    <div class="flex items-center justify-center gap-2">
                      <div class="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>加载中...</span>
                    </div>
                  </td>
                </tr>
              } @else if (inquiryList().length === 0) {
                <tr>
                  <td colspan="8" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
                </tr>
              } @else {
                @for (inquiry of inquiryList(); track inquiry.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3">
                      <input type="checkbox" [checked]="isSelected(inquiry.id)"
                        (change)="toggleSelect(inquiry.id)" />
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ inquiry.inquiryNo }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ inquiry.supplierName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ inquiry.inquiryDate | date:'yyyy-MM-dd' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ inquiry.validUntil | date:'yyyy-MM-dd' || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 text-right">{{ inquiry.totalAmount | number:'1.2-2' }}</td>
                    <td class="px-4 py-3 text-center">
                      <span [class]="getStatusClass(inquiry.status)">
                        {{ getStatusText(inquiry.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right text-sm">
                      <a [routerLink]="[inquiry.id]"
                        class="text-primary-600 hover:text-primary-800 mr-3">
                        详情
                      </a>
                      <button (click)="confirmDelete(inquiry)"
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
          <p class="text-gray-600 mb-6">确定要删除询价单 "{{ inquiryToDelete()?.inquiryNo }}" 吗？此操作不可撤销。</p>
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
export class InquiryListComponent implements OnInit {
  private readonly purchaseService = inject(PurchaseService);

  readonly statusList = Object.entries(询价单状态显示).map(([value, label]) => ({ value, label }));

  inquiryList = signal<询价单[]>([]);
  isLoading = signal(false);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  selectedInquiries = signal<string[]>([]);

  searchParams: { supplierId: string; status: string; search: string } = {
    supplierId: '',
    status: '',
    search: '',
  };

  showConfirmDialog = signal(false);
  inquiryToDelete = signal<询价单 | null>(null);

  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.loadInquiryList();
  }

  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadInquiryList();
    }, 300);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadInquiryList();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadInquiryList();
  }

  loadInquiryList() {
    this.isLoading.set(true);
    const params = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      ...this.searchParams
    };

    this.purchaseService.getInquiries(params).subscribe({
      next: (result) => {
        this.inquiryList.set(result.items);
        this.totalCount.set(result.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  toggleSelect(id: string) {
    const selected = this.selectedInquiries();
    if (selected.includes(id)) {
      this.selectedInquiries.set(selected.filter(s => s !== id));
    } else {
      this.selectedInquiries.set([...selected, id]);
    }
  }

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedInquiries.set(this.inquiryList().map(i => i.id));
    } else {
      this.selectedInquiries.set([]);
    }
  }

  isSelected(id: string): boolean {
    return this.selectedInquiries().includes(id);
  }

  isAllSelected(): boolean {
    return this.inquiryList().length > 0 && this.selectedInquiries().length === this.inquiryList().length;
  }

  goToCompare() {
    const ids = this.selectedInquiries();
    if (ids.length >= 2) {
      window.location.href = `/purchase/inquiry-compare?ids=${ids.join(',')}`;
    }
  }

  getStatusText(status: string): string {
    return 询价单状态显示[status as 询价单状态] || status;
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'DRAFT': 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800',
      'SUBMITTED': 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
      'COMPARED': 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
      'CANCELLED': 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800',
    };
    return statusClasses[status] || '';
  }

  confirmDelete(inquiry: 询价单) {
    this.inquiryToDelete.set(inquiry);
    this.showConfirmDialog.set(true);
  }

  cancelDelete() {
    this.showConfirmDialog.set(false);
    this.inquiryToDelete.set(null);
  }

  executeDelete() {
    const inquiry = this.inquiryToDelete();
    if (inquiry?.id) {
      this.purchaseService.deleteInquiry(inquiry.id).subscribe({
        next: () => {
          this.cancelDelete();
          this.loadInquiryList();
        }
      });
    }
  }
}
