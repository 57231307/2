import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { PatternService } from '../services/pattern.service';
import { 花型, 花型查询参数, 花型版权 } from '../models/pattern.model';
import { 花型风格, 花型用途, 花型状态 } from '../enums/pattern.enum';

@Component({
  selector: 'app-pattern-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PageHeaderComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="花型管理" subtitle="花型图案管理">
      <div class="flex gap-2">
        <button (click)="loadExpiringCopyrights()" class="erp-btn erp-btn-secondary">
          版权预警
        </button>
        <button routerLink="create" class="erp-btn erp-btn-primary">
          新增花型
        </button>
      </div>
    </app-page-header>

    <!-- 版权到期预警提示 -->
    @if (expiringCopyrights().length > 0) {
      <div class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="text-yellow-800 font-medium">版权即将到期提醒</span>
          </div>
          <button (click)="expiringCopyrights.set([])" class="text-yellow-600 hover:text-yellow-800">
            关闭
          </button>
        </div>
        <div class="mt-2 text-sm text-yellow-700">
          以下花型版权将在30天内到期，请及时处理：
        </div>
        <div class="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
          @for (copyright of expiringCopyrights(); track copyright.id) {
            <div class="bg-white p-2 rounded border border-yellow-200 text-sm">
              <span class="font-medium">{{ copyright.copyrightNo }}</span>
              <span class="text-yellow-600 ml-2"> {{ formatDate(copyright.endDate) }} 到期</span>
            </div>
          }
        </div>
      </div>
    }

    <div class="space-y-4">
      <div class="erp-card p-4">
        <div class="flex gap-4 flex-wrap">
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">花型编码</label>
            <input type="text" [(ngModel)]="searchParams.code" (ngModelChange)="onSearchChange()"
              placeholder="请输入花型编码" class="erp-input w-full" />
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">花型名称</label>
            <input type="text" [(ngModel)]="searchParams.name" (ngModelChange)="onSearchChange()"
              placeholder="请输入花型名称" class="erp-input w-full" />
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">风格</label>
            <select [(ngModel)]="searchParams.style" (ngModelChange)="onSearchChange()"
              class="erp-input w-full">
              <option value="">全部</option>
              <option [value]="'SIMPLE'">{{ styleLabel['SIMPLE'] }}</option>
              <option [value]="'VINTAGE'">{{ styleLabel['VINTAGE'] }}</option>
              <option [value]="'ROMANTIC'">{{ styleLabel['ROMANTIC'] }}</option>
              <option [value]="'FASHION'">{{ styleLabel['FASHION'] }}</option>
              <option [value]="'ETHNIC'">{{ styleLabel['ETHNIC'] }}</option>
              <option [value]="'MODERN'">{{ styleLabel['MODERN'] }}</option>
            </select>
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">用途</label>
            <select [(ngModel)]="searchParams.usage" (ngModelChange)="onSearchChange()"
              class="erp-input w-full">
              <option value="">全部</option>
              <option [value]="'APPAREL'">{{ usageLabel['APPAREL'] }}</option>
              <option [value]="'HOME_TEXTILE'">{{ usageLabel['HOME_TEXTILE'] }}</option>
              <option [value]="'DECORATION'">{{ usageLabel['DECORATION'] }}</option>
              <option [value]="'OTHER'">{{ usageLabel['OTHER'] }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="erp-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 100px">花型编码</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">花型名称</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 80px">风格</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 80px">用途</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 80px">使用次数</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 120px">版权号</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 80px">状态</th>
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
              } @else if (patternList().length === 0) {
                <tr>
                  <td colspan="8" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
                </tr>
              } @else {
                @for (pattern of patternList(); track pattern.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ pattern.code }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ pattern.name }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ getStyleName(pattern.style) }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ getUsageName(pattern.usage) }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ pattern.usageCount }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ pattern.copyright?.copyrightNo || '-' }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span [class]="getStatusClass(pattern.status)">
                        {{ getStatusName(pattern.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right text-sm">
                      <a [routerLink]="[pattern.id]"
                        class="text-primary-600 hover:text-primary-800 mr-3">
                        编辑
                      </a>
                      <button (click)="confirmDelete(pattern)"
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
          <p class="text-gray-600 mb-6">确定要删除花型 "{{ patternToDelete()?.name }}" 吗？此操作不可撤销。</p>
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
export class PatternListComponent implements OnInit {
  private readonly patternService = inject(PatternService);

  readonly patternStyle = 花型风格;
  readonly patternUsage = 花型用途;
  readonly patternStatus = 花型状态;

  readonly styleLabel: Record<string, string> = {
    'SIMPLE': '简约',
    'VINTAGE': '复古',
    'ROMANTIC': '浪漫',
    'FASHION': '时尚',
    'ETHNIC': '民族',
    'MODERN': '现代'
  };

  readonly usageLabel: Record<string, string> = {
    'APPAREL': '服装',
    'HOME_TEXTILE': '家纺',
    'DECORATION': '装饰',
    'OTHER': '其他'
  };

  readonly statusLabel: Record<string, string> = {
    'ENABLED': '启用',
    'DISABLED': '停用'
  };

  patternList = signal<花型[]>([]);
  isLoading = signal(false);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  expiringCopyrights = signal<花型版权[]>([]);

  searchParams: 花型查询参数 = {
    code: '',
    name: '',
    style: '',
    usage: '',
    status: ''
  };

  showConfirmDialog = signal(false);
  patternToDelete = signal<花型 | null>(null);

  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.loadPatternList();
  }

  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadPatternList();
    }, 300);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadPatternList();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadPatternList();
  }

  loadExpiringCopyrights() {
    this.patternService.获取即将到期版权(30).subscribe({
      next: (copyrights) => {
        this.expiringCopyrights.set(copyrights);
      }
    });
  }

  loadPatternList() {
    this.isLoading.set(true);
    const params: 花型查询参数 = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      ...this.searchParams
    };

    this.patternService.获取花型列表(params).subscribe({
      next: (result) => {
        this.patternList.set(result.items);
        this.totalCount.set(result.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  confirmDelete(pattern: 花型) {
    this.patternToDelete.set(pattern);
    this.showConfirmDialog.set(true);
  }

  cancelDelete() {
    this.showConfirmDialog.set(false);
    this.patternToDelete.set(null);
  }

  executeDelete() {
    const pattern = this.patternToDelete();
    if (pattern?.id) {
      this.patternService.删除花型(pattern.id).subscribe({
        next: () => {
          this.cancelDelete();
          this.loadPatternList();
        }
      });
    }
  }

  getStyleName(style: string): string {
    return this.styleLabel[style as 花型风格] || style;
  }

  getUsageName(usage: string): string {
    return this.usageLabel[usage as 花型用途] || usage;
  }

  getStatusName(status: string): string {
    return this.statusLabel[status as 花型状态] || status;
  }

  getStatusClass(status: string): string {
    return status === 'ENABLED'
      ? 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800'
      : 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800';
  }

  formatDate(date: Date | string): string {
    if (!date) return '-';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
