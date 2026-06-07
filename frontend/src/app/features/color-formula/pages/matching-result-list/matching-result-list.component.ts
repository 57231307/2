import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ColorFormulaService } from '../../services/color-formula.service';
import { 配色结果 } from '../../models/color-matching-result.model';

@Component({
  selector: 'app-matching-result-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PageHeaderComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="配色结果记录" subtitle="配色结果管理">
      <div class="flex gap-2">
        <button routerLink="create" class="erp-btn erp-btn-primary">
          新建记录
        </button>
      </div>
    </app-page-header>

    <div class="space-y-4">
      <div class="erp-card p-4">
        <div class="flex gap-4 flex-wrap">
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">是否合格</label>
            <select [(ngModel)]="searchParams.isQualified" (ngModelChange)="onSearchChange()"
              class="erp-input w-full">
              <option value="">全部</option>
              <option [ngValue]="true">合格</option>
              <option [ngValue]="false">不合格</option>
            </select>
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">搜索</label>
            <input type="text" [(ngModel)]="searchParams.search" (ngModelChange)="onSearchChange()"
              placeholder="记录编号" class="erp-input w-full" />
          </div>
        </div>
      </div>

      <div class="erp-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">记录编号</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">配方编号</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">配色日期</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">目标颜色</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">实际颜色</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">色差ΔE</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">是否合格</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @if (isLoading()) {
                <tr>
                  <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                    <div class="flex items-center justify-center gap-2">
                      <div class="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>加载中...</span>
                    </div>
                  </td>
                </tr>
              } @else if (resultList().length === 0) {
                <tr>
                  <td colspan="9" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
                </tr>
              } @else {
                @for (result of resultList(); track result.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ result.resultNo }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ result.formula?.code || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ result.customer?.name || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ result.matchingDate | date:'yyyy-MM-dd' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ result.targetColor }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ result.actualColor }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 text-right">{{ result.colorDifference | number:'1.2-2' }}</td>
                    <td class="px-4 py-3 text-center">
                      @if (result.isQualified) {
                        <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">合格</span>
                      } @else {
                        <span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">不合格</span>
                      }
                    </td>
                    <td class="px-4 py-3 text-right text-sm">
                      <a [routerLink]="[result.id]"
                        class="text-primary-600 hover:text-primary-800 mr-3">
                        详情
                      </a>
                      <button (click)="confirmDelete(result)"
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
          <p class="text-gray-600 mb-6">确定要删除记录 "{{ resultToDelete()?.resultNo }}" 吗？此操作不可撤销。</p>
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
export class MatchingResultListComponent implements OnInit {
  private readonly colorFormulaService = inject(ColorFormulaService);

  resultList = signal<配色结果[]>([]);
  isLoading = signal(false);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  searchParams: { isQualified: boolean | null; search: string } = {
    isQualified: null,
    search: '',
  };

  showConfirmDialog = signal(false);
  resultToDelete = signal<配色结果 | null>(null);

  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.loadResultList();
  }

  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadResultList();
    }, 300);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadResultList();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadResultList();
  }

  loadResultList() {
    this.isLoading.set(true);
    const params = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      ...this.searchParams
    };

    this.colorFormulaService.获取配色结果列表(params).subscribe({
      next: (result) => {
        this.resultList.set(result.items);
        this.totalCount.set(result.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  confirmDelete(result: 配色结果) {
    this.resultToDelete.set(result);
    this.showConfirmDialog.set(true);
  }

  cancelDelete() {
    this.showConfirmDialog.set(false);
    this.resultToDelete.set(null);
  }

  executeDelete() {
    const result = this.resultToDelete();
    if (result?.id) {
      this.colorFormulaService.删除配色结果(result.id).subscribe({
        next: () => {
          this.cancelDelete();
          this.loadResultList();
        }
      });
    }
  }
}
