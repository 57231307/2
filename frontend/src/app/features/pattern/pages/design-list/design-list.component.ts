import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatternService } from '../../services/pattern.service';
import { 花型设计, 花型设计状态, 花型设计查询参数, 分页结果, 花型 } from '../../models/pattern.model';

@Component({
  selector: 'app-design-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">花型设计记录</h1>
        <div class="flex gap-3">
          <button
            (click)="navigateToPatterns()"
            class="btn-secondary"
          >
            花型库
          </button>
          <button
            [routerLink]="['new']"
            class="btn-primary"
          >
            新建设计
          </button>
        </div>
      </div>

      <!-- 筛选区域 -->
      <div class="card mb-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">关键词搜索</label>
            <input
              type="text"
              [(ngModel)]="queryParams.keyword"
              (ngModelChange)="onSearchChange()"
              placeholder="设计编号/设计名称/花型名称"
              class="input-field w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">花型</label>
            <select
              [(ngModel)]="queryParams.patternId"
              (ngModelChange)="loadDesigns()"
              class="input-field w-full"
            >
              <option [ngValue]="undefined">全部</option>
              @for (pattern of patterns(); track pattern.id) {
                <option [value]="pattern.id">{{ pattern.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">设计人</label>
            <input
              type="text"
              [(ngModel)]="queryParams.designer"
              (ngModelChange)="onSearchChange()"
              placeholder="请输入设计人"
              class="input-field w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              [(ngModel)]="queryParams.status"
              (ngModelChange)="loadDesigns()"
              class="input-field w-full"
            >
              <option [ngValue]="undefined">全部</option>
              <option [value]="statusDraft">草稿</option>
              <option [value]="statusPending">待审核</option>
              <option [value]="statusApproved">已审核</option>
              <option [value]="statusArchived">已归档</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">设计日期</label>
            <input
              type="date"
              [(ngModel)]="designDate"
              (ngModelChange)="onDateChange()"
              class="input-field w-full"
            />
          </div>
        </div>
      </div>

      <!-- 设计列表 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">设计编号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">设计名称</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">关联花型</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">版本</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">设计人</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">设计日期</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">状态</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (design of designs(); track design.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-primary-600 cursor-pointer" (click)="viewDesign(design.id)">
                    {{ design.designNo }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ design.designName }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">
                    @if (design.patternName) {
                      {{ design.patternName }}
                    } @else {
                      -
                    }
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ design.designVersion }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ design.designer }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ design.designDate | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3 text-center">
                    <span [class]="getStatusClass(design.status)">
                      {{ getStatusText(design.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-center gap-2">
                      <button
                        (click)="viewDesign(design.id)"
                        class="text-primary-600 hover:text-primary-800 text-sm"
                      >
                        查看
                      </button>
                      @if (design.status === statusDraft) {
                        <button
                          (click)="editDesign(design.id)"
                          class="text-primary-600 hover:text-primary-800 text-sm"
                        >
                          编辑
                        </button>
                        <button
                          (click)="deleteDesign(design)"
                          class="text-red-600 hover:text-red-800 text-sm"
                        >
                          删除
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                    暂无设计记录
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
})
export class DesignListComponent implements OnInit {
  private readonly patternService = inject(PatternService);

  // 状态常量
  readonly statusDraft = 花型设计状态.草稿;
  readonly statusPending = 花型设计状态.待审核;
  readonly statusApproved = 花型设计状态.已审核;
  readonly statusArchived = 花型设计状态.已归档;

  designs = signal<花型设计[]>([]);
  pageResult = signal<分页结果<花型设计> | null>(null);
  patterns = signal<花型[]>([]);

  queryParams: 花型设计查询Params = {
    page: 1,
    pageSize: 10,
    keyword: undefined,
    patternId: undefined,
    designer: undefined,
    status: undefined,
    designDateFrom: undefined,
    designDateTo: undefined,
  };

  designDate: string = '';

  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.loadDesigns();
    this.loadPatterns();
  }

  loadDesigns(): void {
    this.patternService.获取花型设计列表(this.queryParams).subscribe({
      next: (result) => {
        this.designs.set(result.items);
        this.pageResult.set(result);
      },
      error: (err) => {
        console.error('加载设计列表失败', err);
      },
    });
  }

  loadPatterns(): void {
    this.patternService.获取花型列表({ page: 1, pageSize: 100 }).subscribe({
      next: (result) => {
        this.patterns.set(result.items);
      },
      error: (err) => {
        console.error('加载花型列表失败', err);
      },
    });
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.queryParams.page = 1;
      this.loadDesigns();
    }, 300);
  }

  onDateChange(): void {
    this.queryParams.designDateFrom = this.designDate ? new Date(this.designDate) : undefined;
    this.queryParams.designDateTo = this.designDate ? new Date(this.designDate) : undefined;
    this.queryParams.page = 1;
    this.loadDesigns();
  }

  goToPage(page: number): void {
    this.queryParams.page = page;
    this.loadDesigns();
  }

  viewDesign(id: string): void {
    // 使用RouterLink导航
  }

  editDesign(id: string): void {
    // 使用RouterLink导航
  }

  deleteDesign(design: 花型设计): void {
    if (confirm(`确定要删除设计 ${design.designNo} 吗？`)) {
      this.patternService.删除花型设计(design.id).subscribe({
        next: () => {
          this.loadDesigns();
        },
        error: (err) => {
          console.error('删除设计失败', err);
        },
      });
    }
  }

  navigateToPatterns(): void {
    // 导航到花型库
  }

  getStatusClass(status: 花型设计状态): string {
    const classes: Record<string, string> = {
      [花型设计状态.草稿]: 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-600',
      [花型设计状态.待审核]: 'px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700',
      [花型设计状态.已审核]: 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
      [花型设计状态.已归档]: 'px-2 py-1 text-xs rounded bg-blue-100 text-blue-700',
    };
    return classes[status] || '';
  }

  getStatusText(status: 花型设计状态): string {
    return status;
  }
}

interface 花型设计查询Params {
  page: number;
  pageSize: number;
  keyword?: string;
  patternId?: string;
  designer?: string;
  status?: 花型设计状态;
  designDateFrom?: Date;
  designDateTo?: Date;
}
