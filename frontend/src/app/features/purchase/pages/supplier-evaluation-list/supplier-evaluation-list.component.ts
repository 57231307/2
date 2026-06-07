import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PurchaseService } from '../../services/purchase.service';
import {
  SupplierEvaluation,
  SupplierEvaluationLevel,
  SupplierEvaluationQueryParams,
} from '../../models/supplier-evaluation.model';
import { PageResult, Supplier } from '../../models/purchase.model';

@Component({
  selector: 'app-supplier-evaluation-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">供应商评估管理</h1>
        <div class="flex gap-3">
          <button
            (click)="navigateToEvaluations()"
            class="btn-secondary"
          >
            评估记录
          </button>
          <button
            (click)="createEvaluation()"
            class="btn-primary"
          >
            新建评估
          </button>
        </div>
      </div>

      <!-- 筛选区域 -->
      <div class="card mb-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
            <select
              [(ngModel)]="queryParams.supplierId"
              (ngModelChange)="onSupplierChange()"
              class="input-field w-full"
            >
              <option [ngValue]="undefined">全部</option>
              @for (supplier of suppliers(); track supplier.id) {
                <option [value]="supplier.id">{{ supplier.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">评估等级</label>
            <select
              [(ngModel)]="queryParams.level"
              (ngModelChange)="loadEvaluations()"
              class="input-field w-full"
            >
              <option [ngValue]="undefined">全部</option>
              <option [value]="levelA">A级（优秀）</option>
              <option [value]="levelB">B级（良好）</option>
              <option [value]="levelC">C级（一般）</option>
              <option [value]="levelD">D级（较差）</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">评估人</label>
            <input
              type="text"
              [(ngModel)]="queryParams.evaluator"
              (ngModelChange)="onSearchChange()"
              placeholder="请输入评估人"
              class="input-field w-full"
            />
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

      <!-- 评估列表 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">评估编号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">供应商</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">评估日期</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">评估人</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">质量</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">交期</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">价格</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">服务</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">综合</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">等级</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (evaluation of evaluations(); track evaluation.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-primary-600 cursor-pointer" (click)="viewEvaluation(evaluation.id)">
                    {{ evaluation.evaluationNo }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ evaluation.supplierName }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ evaluation.evaluationDate | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ evaluation.evaluator }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ evaluation.qualityScore | number: '1.1-1' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ evaluation.deliveryScore | number: '1.1-1' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ evaluation.priceScore | number: '1.1-1' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ evaluation.serviceScore | number: '1.1-1' }}</td>
                  <td class="px-4 py-3 text-sm font-medium text-gray-800 text-center">{{ evaluation.totalScore | number: '1.1-1' }}</td>
                  <td class="px-4 py-3 text-center">
                    <span [class]="getLevelClass(evaluation.level)">
                      {{ evaluation.level }}级
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-center gap-2">
                      <button
                        (click)="viewEvaluation(evaluation.id)"
                        class="text-primary-600 hover:text-primary-800 text-sm"
                      >
                        查看
                      </button>
                      <button
                        (click)="editEvaluation(evaluation.id)"
                        class="text-primary-600 hover:text-primary-800 text-sm"
                      >
                        编辑
                      </button>
                      <button
                        (click)="deleteEvaluation(evaluation)"
                        class="text-red-600 hover:text-red-800 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="11" class="px-4 py-8 text-center text-gray-500">
                    暂无评估数据
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierEvaluationListComponent {
  private readonly purchaseService = inject(PurchaseService);
  private readonly router = inject(Router);

  // 等级常量
  readonly levelA = SupplierEvaluationLevel.A;
  readonly levelB = SupplierEvaluationLevel.B;
  readonly levelC = SupplierEvaluationLevel.C;
  readonly levelD = SupplierEvaluationLevel.D;

  evaluations = signal<SupplierEvaluation[]>([]);
  pageResult = signal<PageResult<SupplierEvaluation> | null>(null);
  suppliers = signal<Supplier[]>([]);

  queryParams: SupplierEvaluationQueryParams = {
    page: 1,
    pageSize: 10,
    supplierId: undefined,
    evaluator: undefined,
    level: undefined,
    evaluationDateFrom: undefined,
    evaluationDateTo: undefined,
  };

  startDate: string = '';
  endDate: string = '';

  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.loadEvaluations();
    this.loadSuppliers();
  }

  loadEvaluations(): void {
    this.purchaseService.getSupplierEvaluations(this.queryParams).subscribe({
      next: (result) => {
        this.evaluations.set(result.items);
        this.pageResult.set(result);
      },
      error: (err) => {
        console.error('加载评估列表失败', err);
      },
    });
  }

  loadSuppliers(): void {
    this.purchaseService.getSuppliers().subscribe({
      next: (suppliers) => {
        this.suppliers.set(suppliers);
      },
      error: (err) => {
        console.error('加载供应商列表失败', err);
      },
    });
  }

  onSupplierChange(): void {
    this.queryParams.page = 1;
    this.loadEvaluations();
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.queryParams.page = 1;
      this.loadEvaluations();
    }, 300);
  }

  onDateChange(): void {
    this.queryParams.evaluationDateFrom = this.startDate ? new Date(this.startDate) : undefined;
    this.queryParams.evaluationDateTo = this.endDate ? new Date(this.endDate) : undefined;
    this.queryParams.page = 1;
    this.loadEvaluations();
  }

  goToPage(page: number): void {
    this.queryParams.page = page;
    this.loadEvaluations();
  }

  createEvaluation(): void {
    this.router.navigate(['/purchase/evaluations/new']);
  }

  viewEvaluation(id: string): void {
    this.router.navigate(['/purchase/evaluations', id]);
  }

  editEvaluation(id: string): void {
    this.router.navigate(['/purchase/evaluations', id, 'edit']);
  }

  deleteEvaluation(evaluation: SupplierEvaluation): void {
    if (confirm(`确定要删除评估 ${evaluation.evaluationNo} 吗？`)) {
      this.purchaseService.deleteSupplierEvaluation(evaluation.id).subscribe({
        next: () => {
          this.loadEvaluations();
        },
        error: (err) => {
          console.error('删除评估失败', err);
        },
      });
    }
  }

  navigateToEvaluations(): void {
    // 导航到评估记录（当前页面）
  }

  getLevelClass(level: SupplierEvaluationLevel): string {
    const classes: Record<string, string> = {
      [SupplierEvaluationLevel.A]: 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
      [SupplierEvaluationLevel.B]: 'px-2 py-1 text-xs rounded bg-blue-100 text-blue-700',
      [SupplierEvaluationLevel.C]: 'px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700',
      [SupplierEvaluationLevel.D]: 'px-2 py-1 text-xs rounded bg-red-100 text-red-700',
    };
    return classes[level] || '';
  }
}
