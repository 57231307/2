import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SaleService } from '../../services/sale.service';
import { SaleReturn, ReturnStatus, ReturnQueryParams, PageResult } from '../../models/sale.model';

@Component({
  selector: 'app-return-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">销售退货管理</h1>
        <button (click)="createReturn()" class="btn-primary">
          创建退货单
        </button>
      </div>

      <!-- 筛选区域 -->
      <div class="card mb-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">关键词搜索</label>
            <input
              type="text"
              [(ngModel)]="queryParams.keyword"
              (ngModelChange)="onSearchChange()"
              placeholder="退货单号/原发货单号"
              class="input-field w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">退货状态</label>
            <select
              [(ngModel)]="queryParams.status"
              (ngModelChange)="loadReturns()"
              class="input-field w-full"
            >
              <option [ngValue]="undefined">全部</option>
              <option [value]="ReturnStatus.待处理">待处理</option>
              <option [value]="ReturnStatus.已确认">已确认</option>
              <option [value]="ReturnStatus.已拒绝">已拒绝</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 退货单列表 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">退货单号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">原发货单号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">关联订单</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">退货日期</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (returnOrder of returns(); track returnOrder.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-primary-600 cursor-pointer" (click)="viewReturn(returnOrder.id)">
                    {{ returnOrder.returnNo }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ returnOrder.deliveryNoteNo }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ returnOrder.orderNo }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ returnOrder.returnDate | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3">
                    <span [class]="getStatusClass(returnOrder.status)">
                      {{ getStatusText(returnOrder.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <button
                        (click)="viewReturn(returnOrder.id)"
                        class="text-primary-600 hover:text-primary-800 text-sm"
                      >
                        查看
                      </button>
                      @if (returnOrder.status === ReturnStatus.待处理) {
                        <button
                          (click)="confirmReturn(returnOrder)"
                          class="text-green-600 hover:text-green-800 text-sm"
                        >
                          确认
                        </button>
                        <button
                          (click)="rejectReturn(returnOrder)"
                          class="text-red-600 hover:text-red-800 text-sm"
                        >
                          拒绝
                        </button>
                        <button
                          (click)="deleteReturn(returnOrder)"
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
                  <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                    暂无退货单数据
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
export class ReturnListComponent {
  private readonly saleService = inject(SaleService);
  private readonly router = inject(Router);

  readonly ReturnStatus = ReturnStatus;

  returns = signal<SaleReturn[]>([]);
  pageResult = signal<PageResult<SaleReturn> | null>(null);

  queryParams: ReturnQueryParams = {
    page: 1,
    pageSize: 10,
    keyword: '',
    status: undefined,
  };

  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.loadReturns();
  }

  loadReturns(): void {
    this.saleService.getReturns(this.queryParams).subscribe({
      next: (result) => {
        this.returns.set(result.items);
        this.pageResult.set(result);
      },
      error: (err) => {
        console.error('加载退货单列表失败', err);
      },
    });
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.queryParams.page = 1;
      this.loadReturns();
    }, 300);
  }

  goToPage(page: number): void {
    this.queryParams.page = page;
    this.loadReturns();
  }

  createReturn(): void {
    this.router.navigate(['/sales/returns/new']);
  }

  viewReturn(id: string): void {
    this.router.navigate(['/sales/returns', id]);
  }

  deleteReturn(returnOrder: SaleReturn): void {
    if (confirm(`确定要删除退货单 ${returnOrder.returnNo} 吗？`)) {
      this.saleService.deleteReturn(returnOrder.id).subscribe({
        next: () => {
          this.loadReturns();
        },
        error: (err) => {
          console.error('删除退货单失败', err);
        },
      });
    }
  }

  confirmReturn(returnOrder: SaleReturn): void {
    if (confirm(`确定要确认退货单 ${returnOrder.returnNo} 吗？`)) {
      this.saleService.updateReturn(returnOrder.id, { status: ReturnStatus.已确认 } as any).subscribe({
        next: () => {
          this.loadReturns();
        },
        error: (err) => {
          console.error('确认退货失败', err);
        },
      });
    }
  }

  rejectReturn(returnOrder: SaleReturn): void {
    if (confirm(`确定要拒绝退货单 ${returnOrder.returnNo} 吗？`)) {
      this.saleService.updateReturn(returnOrder.id, { status: ReturnStatus.已拒绝 } as any).subscribe({
        next: () => {
          this.loadReturns();
        },
        error: (err) => {
          console.error('拒绝退货失败', err);
        },
      });
    }
  }

  getStatusClass(status: ReturnStatus): string {
    const classes: Record<ReturnStatus, string> = {
      [ReturnStatus.待处理]: 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-600',
      [ReturnStatus.已确认]: 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
      [ReturnStatus.已拒绝]: 'px-2 py-1 text-xs rounded bg-red-100 text-red-700',
    };
    return classes[status] || '';
  }

  getStatusText(status: ReturnStatus): string {
    const texts: Record<ReturnStatus, string> = {
      [ReturnStatus.待处理]: '待处理',
      [ReturnStatus.已确认]: '已确认',
      [ReturnStatus.已拒绝]: '已拒绝',
    };
    return texts[status] || status;
  }
}
