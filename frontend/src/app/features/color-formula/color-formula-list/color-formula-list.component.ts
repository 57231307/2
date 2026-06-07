import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ColorFormulaService } from '../services/color-formula.service';
import { 颜色配方, 颜色配方查询参数, 色差检测请求, 色差检测结果 } from '../models/color-formula.model';
import { 配方状态, 色差等级 } from '../enums/color-formula.enum';

@Component({
  selector: 'app-color-formula-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PageHeaderComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="颜色配方" subtitle="染色配方管理">
      <div class="flex gap-2">
        <button routerLink="create" class="erp-btn erp-btn-primary">
          新增配方
        </button>
      </div>
    </app-page-header>

    <div class="space-y-4">
      <div class="erp-card p-4">
        <div class="flex gap-4 flex-wrap">
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">配方编码</label>
            <input type="text" [(ngModel)]="searchParams.code" (ngModelChange)="onSearchChange()"
              placeholder="请输入配方编码" class="erp-input w-full" />
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">配方名称</label>
            <input type="text" [(ngModel)]="searchParams.name" (ngModelChange)="onSearchChange()"
              placeholder="请输入配方名称" class="erp-input w-full" />
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="erp-label">状态</label>
            <select [(ngModel)]="searchParams.status" (ngModelChange)="onSearchChange()"
              class="erp-input w-full">
              <option value="">全部</option>
              <option [value]="'DRAFT'">{{ statusLabel['DRAFT'] }}</option>
              <option [value]="'ACTIVE'">{{ statusLabel['ACTIVE'] }}</option>
              <option [value]="'INACTIVE'">{{ statusLabel['INACTIVE'] }}</option>
              <option [value]="'ARCHIVED'">{{ statusLabel['ARCHIVED'] }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="erp-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 120px">配方编码</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">配方名称</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">目标颜色</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 80px">版本</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 100px">总用量</th>
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
              } @else if (formulaList().length === 0) {
                <tr>
                  <td colspan="7" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
                </tr>
              } @else {
                @for (formula of formulaList(); track formula.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ formula.code }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ formula.name }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ formula.targetColorName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">v{{ formula.version }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ formula.totalAmount }} {{ formula.items[0]?.unit || 'g' }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span [class]="getStatusClass(formula.status)">
                        {{ getStatusName(formula.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right text-sm">
                      <button (click)="openColorDifferenceDialog(formula)"
                        class="text-primary-600 hover:text-primary-800 mr-3">
                        色差检测
                      </button>
                      <a [routerLink]="[formula.id]"
                        class="text-primary-600 hover:text-primary-800 mr-3">
                        编辑
                      </a>
                      <button (click)="confirmDelete(formula)"
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

    <!-- 色差检测弹窗 -->
    @if (showColorDifferenceDialog()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-[500px]">
          <h3 class="text-lg font-semibold mb-4">色差检测</h3>
          
          @if (selectedFormula()) {
            <div class="mb-4 p-3 bg-gray-50 rounded">
              <div class="text-sm text-gray-600">配方: {{ selectedFormula()?.name }}</div>
              <div class="text-sm text-gray-600">目标颜色: {{ selectedFormula()?.targetColorName }}</div>
            </div>
          }

          <div class="space-y-4">
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="erp-label">L值</label>
                <input type="number" step="0.01" [(ngModel)]="labValue.l"
                  class="erp-input w-full" placeholder="L" />
              </div>
              <div>
                <label class="erp-label">a值</label>
                <input type="number" step="0.01" [(ngModel)]="labValue.a"
                  class="erp-input w-full" placeholder="a" />
              </div>
              <div>
                <label class="erp-label">b值</label>
                <input type="number" step="0.01" [(ngModel)]="labValue.b"
                  class="erp-input w-full" placeholder="b" />
              </div>
            </div>

            @if (colorDifferenceResult()) {
              <div class="p-4 rounded-lg" [class.bg-green-50]="colorDifferenceResult()?.isQualified" [class.bg-red-50]="!colorDifferenceResult()?.isQualified">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium">检测结果</span>
                  <span [class]="getDeltaEGradeClass(colorDifferenceResult()?.grade || '')">
                    {{ getDeltaEGradeName(colorDifferenceResult()?.grade || '') }}
                  </span>
                </div>
                <div class="text-3xl font-bold" [class.text-green-600]="colorDifferenceResult()?.isQualified" [class.text-red-600]="!colorDifferenceResult()?.isQualified">
                  ΔE = {{ colorDifferenceResult()?.deltaE?.toFixed(2) }}
                </div>
                <div class="text-sm mt-2" [class.text-green-600]="colorDifferenceResult()?.isQualified" [class.text-red-600]="!colorDifferenceResult()?.isQualified">
                  {{ colorDifferenceResult()?.isQualified ? '合格' : '不合格' }}
                </div>
              </div>
            }
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button (click)="closeColorDifferenceDialog()"
              class="erp-btn erp-btn-secondary">
              关闭
            </button>
            <button (click)="checkColorDifference()" [disabled]="isCheckingColorDifference()"
              class="erp-btn erp-btn-primary">
              @if (isCheckingColorDifference()) {
                检测中...
              } @else {
                检测
              }
            </button>
          </div>
        </div>
      </div>
    }

    @if (showConfirmDialog()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-96">
          <h3 class="text-lg font-semibold mb-4">确认删除</h3>
          <p class="text-gray-600 mb-6">确定要删除配方 "{{ formulaToDelete()?.name }}" 吗？此操作不可撤销。</p>
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
export class ColorFormulaListComponent implements OnInit {
  private readonly colorFormulaService = inject(ColorFormulaService);

  readonly formulaStatus = 配方状态;
  readonly deltaEGrade = 色差等级;

  readonly statusLabel: Record<string, string> = {
    'DRAFT': '草稿',
    'ACTIVE': '正式',
    'INACTIVE': '停用',
    'ARCHIVED': '归档'
  };

  readonly gradeLabel: Record<string, string> = {
    'PERFECT': '完美',
    'EXCELLENT': '优秀',
    'GOOD': '良好',
    'ACCEPTABLE': '可接受',
    'POOR': '差'
  };

  formulaList = signal<颜色配方[]>([]);
  isLoading = signal(false);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  searchParams: 颜色配方查询参数 = {
    code: '',
    name: '',
    status: ''
  };

  showConfirmDialog = signal(false);
  formulaToDelete = signal<颜色配方 | null>(null);

  showColorDifferenceDialog = signal(false);
  selectedFormula = signal<颜色配方 | null>(null);
  isCheckingColorDifference = signal(false);
  colorDifferenceResult = signal<色差检测结果 | null>(null);
  labValue = { l: 0, a: 0, b: 0 };

  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.loadFormulaList();
  }

  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadFormulaList();
    }, 300);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadFormulaList();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadFormulaList();
  }

  loadFormulaList() {
    this.isLoading.set(true);
    const params: 颜色配方查询参数 = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      ...this.searchParams
    };

    this.colorFormulaService.获取配方列表(params).subscribe({
      next: (result) => {
        this.formulaList.set(result.items);
        this.totalCount.set(result.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  openColorDifferenceDialog(formula: 颜色配方) {
    this.selectedFormula.set(formula);
    this.colorDifferenceResult.set(null);
    this.labValue = { l: 0, a: 0, b: 0 };
    this.showColorDifferenceDialog.set(true);
  }

  closeColorDifferenceDialog() {
    this.showColorDifferenceDialog.set(false);
    this.selectedFormula.set(null);
    this.colorDifferenceResult.set(null);
  }

  checkColorDifference() {
    const formula = this.selectedFormula();
    if (!formula?.id) return;

    this.isCheckingColorDifference.set(true);

    const request: 色差检测请求 = {
      formulaId: formula.id,
      labValue: this.labValue
    };

    this.colorFormulaService.检测色差(request).subscribe({
      next: (result) => {
        this.colorDifferenceResult.set(result);
        this.isCheckingColorDifference.set(false);
      },
      error: () => {
        this.isCheckingColorDifference.set(false);
      }
    });
  }

  confirmDelete(formula: 颜色配方) {
    this.formulaToDelete.set(formula);
    this.showConfirmDialog.set(true);
  }

  cancelDelete() {
    this.showConfirmDialog.set(false);
    this.formulaToDelete.set(null);
  }

  executeDelete() {
    const formula = this.formulaToDelete();
    if (formula?.id) {
      this.colorFormulaService.删除配方(formula.id).subscribe({
        next: () => {
          this.cancelDelete();
          this.loadFormulaList();
        }
      });
    }
  }

  getStatusName(status: string): string {
    return this.statusLabel[status] || status;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800';
      case 'DRAFT':
        return 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800';
      case 'INACTIVE':
        return 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800';
      case 'ARCHIVED':
        return 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800';
      default:
        return 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800';
    }
  }

  getDeltaEGradeName(grade: string): string {
    return this.gradeLabel[grade] || grade;
  }

  getDeltaEGradeClass(grade: string): string {
    switch (grade) {
      case 'PERFECT':
        return 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800';
      case 'EXCELLENT':
        return 'px-2 py-1 text-xs rounded-full bg-green-50 text-green-700';
      case 'GOOD':
        return 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800';
      case 'ACCEPTABLE':
        return 'px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800';
      case 'POOR':
        return 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800';
      default:
        return 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800';
    }
  }
}
