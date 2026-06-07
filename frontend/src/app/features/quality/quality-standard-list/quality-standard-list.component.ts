import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QualityService } from '../services/quality.service';
import { QualityStandard, PageResult, InspectionType, QualityStandardStatus } from '../models/quality.model';

@Component({
  selector: 'app-quality-standard-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">质检标准管理</h1>
        <button (click)="createStandard()" class="btn-primary">
          新建标准
        </button>
      </div>

      <!-- 筛选区域 -->
      <div class="card mb-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">关键词搜索</label>
            <input
              type="text"
              [(ngModel)]="queryParams.keyword"
              (ngModelChange)="onSearchChange()"
              placeholder="标准编号/名称"
              class="input-field w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">检验类型</label>
            <select
              [(ngModel)]="selectedType"
              (ngModelChange)="onTypeChange()"
              class="input-field w-full"
            >
              <option [ngValue]="0">全部</option>
              <option [ngValue]="1">{{ typeLabels[0] }}</option>
              <option [ngValue]="2">{{ typeLabels[1] }}</option>
              <option [ngValue]="3">{{ typeLabels[2] }}</option>
              <option [ngValue]="4">{{ typeLabels[3] }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="onStatusChange()"
              class="input-field w-full"
            >
              <option [ngValue]="0">全部</option>
              <option [ngValue]="1">{{ statusLabels[0] }}</option>
              <option [ngValue]="2">{{ statusLabels[1] }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 标准列表 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">标准编号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">标准名称</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">检验类型</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">检验项目数</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">创建时间</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (standard of standards(); track standard.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-primary-600 cursor-pointer" (click)="viewStandard(standard.id)">
                    {{ standard.code }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ standard.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ standard.type }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ standard.items.length }} 项</td>
                  <td class="px-4 py-3">
                    <span [class]="getStatusClass(standard.status)">
                      {{ standard.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ standard.createTime | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <button (click)="viewStandard(standard.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                        查看
                      </button>
                      <button (click)="editStandard(standard.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                        编辑
                      </button>
                      <button (click)="deleteStandard(standard)" class="text-red-600 hover:text-red-800 text-sm">
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                    暂无质检标准数据
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
export class QualityStandardListComponent implements OnInit {
  private qualityService = inject(QualityService);
  private router = inject(Router);

  readonly InspectionType = InspectionType;
  readonly QualityStandardStatus = QualityStandardStatus;
  readonly typeLabels = ['外观检验', '物理性能检验', '化学性能检验', '综合检验'];
  readonly statusLabels = ['启用', '停用'];
  readonly typeValues = ['外观检验', '物理性能检验', '化学性能检验', '综合检验'];
  readonly statusValues = ['启用', '停用'];

  standards = signal<QualityStandard[]>([]);
  pageResult = signal<PageResult<QualityStandard> | null>(null);

  selectedType = 0;
  selectedStatus = 0;

  queryParams: { page: number; pageSize: number; keyword?: string; type?: string; status?: string } = {
    page: 1,
    pageSize: 10,
    keyword: '',
    type: undefined,
    status: undefined
  };

  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.loadStandards();
  }

  loadStandards(): void {
    this.qualityService.getQualityStandards(this.queryParams as any).subscribe({
      next: (result) => {
        this.standards.set(result.items);
        this.pageResult.set(result);
      },
      error: (err) => console.error('加载质检标准列表失败', err)
    });
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.queryParams.page = 1;
      this.loadStandards();
    }, 300);
  }

  onTypeChange(): void {
    if (this.selectedType === 0) {
      this.queryParams.type = undefined;
    } else {
      this.queryParams.type = this.typeValues[this.selectedType - 1];
    }
    this.queryParams.page = 1;
    this.loadStandards();
  }

  onStatusChange(): void {
    if (this.selectedStatus === 0) {
      this.queryParams.status = undefined;
    } else {
      this.queryParams.status = this.statusValues[this.selectedStatus - 1];
    }
    this.queryParams.page = 1;
    this.loadStandards();
  }

  goToPage(page: number): void {
    this.queryParams.page = page;
    this.loadStandards();
  }

  createStandard(): void {
    this.router.navigate(['/quality/standards/new']);
  }

  viewStandard(id: string): void {
    this.router.navigate(['/quality/standards', id]);
  }

  editStandard(id: string): void {
    this.router.navigate(['/quality/standards', id, 'edit']);
  }

  deleteStandard(standard: QualityStandard): void {
    if (confirm(`确定要删除质检标准 "${standard.name}" 吗？`)) {
      this.qualityService.deleteQualityStandard(standard.id).subscribe({
        next: () => this.loadStandards(),
        error: (err) => console.error('删除质检标准失败', err)
      });
    }
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      '启用': 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
      '停用': 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-600'
    };
    return classes[status] || '';
  }
}