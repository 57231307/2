import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QualityService } from '../services/quality.service';
import { QualityInspection, PageResult, InspectionResult } from '../models/quality.model';

@Component({
  selector: 'app-quality-inspection-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">质检报告管理</h1>
        <button (click)="createInspection()" class="btn-primary">
          新建报告
        </button>
      </div>

      <!-- 筛选区域 -->
      <div class="card mb-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">关键词搜索</label>
            <input
              type="text"
              [(ngModel)]="queryParams.keyword"
              (ngModelChange)="onSearchChange()"
              placeholder="报告编号/批次号"
              class="input-field w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">检验结果</label>
            <select
              [(ngModel)]="selectedResult"
              (ngModelChange)="onResultChange()"
              class="input-field w-full"
            >
              <option [ngValue]="0">全部</option>
              <option [ngValue]="1">{{ resultLabels[0] }}</option>
              <option [ngValue]="2">{{ resultLabels[1] }}</option>
              <option [ngValue]="3">{{ resultLabels[2] }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
            <input
              type="date"
              [(ngModel)]="startDate"
              (ngModelChange)="onDateChange()"
              class="input-field w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
            <input
              type="date"
              [(ngModel)]="endDate"
              (ngModelChange)="onDateChange()"
              class="input-field w-full"
            />
          </div>
        </div>
      </div>

      <!-- 报告列表 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">报告编号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">批次编码</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">缸号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">匹号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">质检标准</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">检验日期</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">检验员</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">结果</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (inspection of inspections(); track inspection.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-primary-600 cursor-pointer" (click)="viewInspection(inspection.id)">
                    {{ inspection.reportNo }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ inspection.batchCode }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ inspection.dyeLotNo }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ inspection.pieceNo }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ inspection.standardName }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ inspection.inspectionDate | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ inspection.inspector }}</td>
                  <td class="px-4 py-3">
                    <span [class]="getResultClass(inspection.result)">
                      {{ inspection.result }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <button (click)="viewInspection(inspection.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                        查看
                      </button>
                      <button (click)="printInspection(inspection)" class="text-primary-600 hover:text-primary-800 text-sm">
                        打印
                      </button>
                      <button (click)="deleteInspection(inspection)" class="text-red-600 hover:text-red-800 text-sm">
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                    暂无质检报告数据
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        @if (pageResult()) {
          <div class="flex justify-between items-center mt-4 pt-4 border-t">
            <span class="text-sm text-gray-600">
              共 {{ pageResult()!.total }} 条记录，第 {{ pageResult()!.page }} / {{ pageResult()!.totalPages }} 页
            </span>
            <div class="flex gap-2">
              <button
                [disabled]="pageResult()!.page <= 1"
                (click)="goToPage(pageResult()!.page - 1)"
                class="btn-secondary disabled:opacity-50"
              >
                上一页
              </button>
              <button
                [disabled]="pageResult()!.page >= pageResult()!.totalPages"
                (click)="goToPage(pageResult()!.page + 1)"
                class="btn-secondary disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QualityInspectionListComponent implements OnInit {
  private qualityService = inject(QualityService);
  private router = inject(Router);

  readonly InspectionResult = InspectionResult;
  readonly resultLabels = ['合格', '不合格', '让步接收'];
  readonly resultValues = ['合格', '不合格', '让步接收'];

  inspections = signal<QualityInspection[]>([]);
  pageResult = signal<PageResult<QualityInspection> | null>(null);

  selectedResult = 0;

  queryParams: { page: number; pageSize: number; keyword?: string; result?: string; startDate?: Date; endDate?: Date } = {
    page: 1,
    pageSize: 10,
    keyword: '',
    result: undefined,
    startDate: undefined,
    endDate: undefined
  };

  startDate: string = '';
  endDate: string = '';

  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.loadInspections();
  }

  loadInspections(): void {
    this.qualityService.getQualityInspections(this.queryParams as any).subscribe({
      next: (result) => {
        this.inspections.set(result.items);
        this.pageResult.set(result);
      },
      error: (err) => console.error('加载质检报告列表失败', err)
    });
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.queryParams.page = 1;
      this.loadInspections();
    }, 300);
  }

  onResultChange(): void {
    if (this.selectedResult === 0) {
      this.queryParams.result = undefined;
    } else {
      this.queryParams.result = this.resultValues[this.selectedResult - 1];
    }
    this.queryParams.page = 1;
    this.loadInspections();
  }

  onDateChange(): void {
    this.queryParams.startDate = this.startDate ? new Date(this.startDate) : undefined;
    this.queryParams.endDate = this.endDate ? new Date(this.endDate) : undefined;
    this.queryParams.page = 1;
    this.loadInspections();
  }

  goToPage(page: number): void {
    this.queryParams.page = page;
    this.loadInspections();
  }

  createInspection(): void {
    this.router.navigate(['/quality/inspections/new']);
  }

  viewInspection(id: string): void {
    this.router.navigate(['/quality/inspections', id]);
  }

  printInspection(inspection: QualityInspection): void {
    window.print();
  }

  deleteInspection(inspection: QualityInspection): void {
    if (confirm(`确定要删除质检报告 "${inspection.reportNo}" 吗？`)) {
      this.qualityService.deleteQualityInspection(inspection.id).subscribe({
        next: () => this.loadInspections(),
        error: (err) => console.error('删除质检报告失败', err)
      });
    }
  }

  getResultClass(result: string): string {
    const classes: Record<string, string> = {
      '合格': 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
      '不合格': 'px-2 py-1 text-xs rounded bg-red-100 text-red-700',
      '让步接收': 'px-2 py-1 text-xs rounded bg-orange-100 text-orange-700'
    };
    return classes[result] || '';
  }
}