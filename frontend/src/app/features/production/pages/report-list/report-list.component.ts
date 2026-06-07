import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ProductionService } from '../../services/production.service';
import { 工序汇报, 工序汇报状态, 工序汇报状态显示 } from '../../models/process-report.model';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PageHeaderComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="工序汇报管理" subtitle="生产工序汇报记录">
      <div class="flex gap-2">
        <button routerLink="create" class="erp-btn erp-btn-primary">
          新建汇报
        </button>
      </div>
    </app-page-header>

    <div class="space-y-4">
      <div class="erp-card p-4">
        <div class="flex gap-4 flex-wrap">
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
              placeholder="汇报编号" class="erp-input w-full" />
          </div>
        </div>
      </div>

      <div class="erp-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">汇报编号</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">派工单号</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工序</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">汇报日期</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">良品数量</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">不良品数量</th>
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
              } @else if (reportList().length === 0) {
                <tr>
                  <td colspan="8" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
                </tr>
              } @else {
                @for (report of reportList(); track report.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ report.reportNo }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ report.dispatch?.dispatchNo || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ report.step?.stepName || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ report.reportDate | date:'yyyy-MM-dd' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 text-right">{{ report.qualifiedQuantity }}</td>
                    <td class="px-4 py-3 text-sm text-right">
                      <span [class.text-red-600]="report.defectiveQuantity > 0">
                        {{ report.defectiveQuantity }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span [class]="getStatusClass(report.status)">
                        {{ getStatusText(report.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right text-sm">
                      <a [routerLink]="[report.id]"
                        class="text-primary-600 hover:text-primary-800 mr-3">
                        详情
                      </a>
                      @if (report.status === 'DRAFT') {
                        <button (click)="confirmDelete(report)"
                          class="text-red-600 hover:text-red-800">
                          删除
                        </button>
                      }
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
          <p class="text-gray-600 mb-6">确定要删除汇报 "{{ reportToDelete()?.reportNo }}" 吗？此操作不可撤销。</p>
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
export class ReportListComponent implements OnInit {
  private readonly productionService = inject(ProductionService);

  readonly statusList = Object.entries(工序汇报状态显示).map(([value, label]) => ({ value, label }));

  reportList = signal<工序汇报[]>([]);
  isLoading = signal(false);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  searchParams: { status: string; search: string } = {
    status: '',
    search: '',
  };

  showConfirmDialog = signal(false);
  reportToDelete = signal<工序汇报 | null>(null);

  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.loadReportList();
  }

  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadReportList();
    }, 300);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadReportList();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadReportList();
  }

  loadReportList() {
    this.isLoading.set(true);
    const params = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      ...this.searchParams
    };

    this.productionService.getProcessReports(params).subscribe({
      next: (result) => {
        this.reportList.set(result.items);
        this.totalCount.set(result.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getStatusText(status: string): string {
    return 工序汇报状态显示[status as 工序汇报状态] || status;
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'DRAFT': 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800',
      'SUBMITTED': 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
      'CONFIRMED': 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
    };
    return statusClasses[status] || '';
  }

  confirmDelete(report: 工序汇报) {
    this.reportToDelete.set(report);
    this.showConfirmDialog.set(true);
  }

  cancelDelete() {
    this.showConfirmDialog.set(false);
    this.reportToDelete.set(null);
  }

  executeDelete() {
    const report = this.reportToDelete();
    if (report?.id) {
      this.productionService.deleteProcessReport(report.id).subscribe({
        next: () => {
          this.cancelDelete();
          this.loadReportList();
        }
      });
    }
  }
}
