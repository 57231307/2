import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../services/finance.service';
import { AccountReceivable, ArApStatus, PageResult } from '../models/finance.model';

@Component({
  selector: 'app-account-receivable-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">应收款管理</h1>
        <button (click)="createReceivable()" class="btn-primary">
          新建应收款
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
              placeholder="应收单号/客户名称"
              class="input-field w-full"
            />
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
              <option [ngValue]="3">{{ statusLabels[2] }}</option>
              <option [ngValue]="4">{{ statusLabels[3] }}</option>
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

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="card p-4">
          <div class="text-sm text-gray-500">应收总额</div>
          <div class="text-2xl font-bold text-gray-800">¥{{ totalAmount() | number: '1.2-2' }}</div>
        </div>
        <div class="card p-4">
          <div class="text-sm text-gray-500">已收金额</div>
          <div class="text-2xl font-bold text-green-600">¥{{ totalPaidAmount() | number: '1.2-2' }}</div>
        </div>
        <div class="card p-4">
          <div class="text-sm text-gray-500">待收款</div>
          <div class="text-2xl font-bold text-orange-600">¥{{ totalBalance() | number: '1.2-2' }}</div>
        </div>
        <div class="card p-4">
          <div class="text-sm text-gray-500">逾期金额</div>
          <div class="text-2xl font-bold text-red-600">¥{{ overdueAmount() | number: '1.2-2' }}</div>
        </div>
      </div>

      <!-- 应收款列表 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">应收单号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">客户名称</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">来源单据</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">应收金额</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">已收金额</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">待收金额</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">到期日期</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (ar of receivables(); track ar.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-primary-600 cursor-pointer" (click)="viewReceivable(ar.id)">
                    {{ ar.arNo }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ ar.customerName }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ ar.sourceNo }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 text-right font-medium">¥{{ ar.amount | number: '1.2-2' }}</td>
                  <td class="px-4 py-3 text-sm text-green-600 text-right">¥{{ ar.paidAmount | number: '1.2-2' }}</td>
                  <td class="px-4 py-3 text-sm text-orange-600 text-right">¥{{ ar.balance | number: '1.2-2' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ ar.dueDate | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3">
                    <span [class]="getStatusClass(ar.status)">
                      {{ ar.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <button (click)="viewReceivable(ar.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                        查看
                      </button>
                      @if (ar.status !== statusLabels[2]) {
                        <button (click)="registerPayment(ar)" class="text-green-600 hover:text-green-800 text-sm">
                          收款
                        </button>
                      }
                      @if (ar.balance > 0) {
                        <button (click)="verifyReceivable(ar)" class="text-blue-600 hover:text-blue-800 text-sm">
                          核销
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                    暂无应收款数据
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
export class AccountReceivableListComponent implements OnInit {
  private financeService = inject(FinanceService);
  private router = inject(Router);

  readonly ArApStatus = ArApStatus;
  readonly statusLabels = ['待收款', '部分核销', '已核销', '逾期'];

  receivables = signal<AccountReceivable[]>([]);
  pageResult = signal<PageResult<AccountReceivable> | null>(null);

  totalAmount = signal(0);
  totalPaidAmount = signal(0);
  totalBalance = signal(0);
  overdueAmount = signal(0);

  selectedStatus = 0;

  queryParams: { page: number; pageSize: number; keyword?: string; status?: string; startDate?: Date; endDate?: Date } = {
    page: 1,
    pageSize: 10,
    keyword: '',
    status: undefined,
    startDate: undefined,
    endDate: undefined
  };

  startDate: string = '';
  endDate: string = '';

  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.loadReceivables();
  }

  loadReceivables(): void {
    const params = { ...this.queryParams };
    this.financeService.getAccountReceivables(params as any).subscribe({
      next: (result) => {
        this.receivables.set(result.items);
        this.pageResult.set(result);
        this.calculateSummary(result.items);
      },
      error: (err) => console.error('加载应收款列表失败', err)
    });
  }

  calculateSummary(items: AccountReceivable[]): void {
    this.totalAmount.set(items.reduce((sum, ar) => sum + ar.amount, 0));
    this.totalPaidAmount.set(items.reduce((sum, ar) => sum + ar.paidAmount, 0));
    this.totalBalance.set(items.reduce((sum, ar) => sum + ar.balance, 0));
    this.overdueAmount.set(items.filter(ar => ar.status === ArApStatus.逾期).reduce((sum, ar) => sum + ar.balance, 0));
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.queryParams.page = 1;
      this.loadReceivables();
    }, 300);
  }

  onStatusChange(): void {
    if (this.selectedStatus === 0) {
      this.queryParams.status = undefined;
    } else {
      this.queryParams.status = this.statusLabels[this.selectedStatus - 1];
    }
    this.queryParams.page = 1;
    this.loadReceivables();
  }

  onDateChange(): void {
    this.queryParams.startDate = this.startDate ? new Date(this.startDate) : undefined;
    this.queryParams.endDate = this.endDate ? new Date(this.endDate) : undefined;
    this.queryParams.page = 1;
    this.loadReceivables();
  }

  goToPage(page: number): void {
    this.queryParams.page = page;
    this.loadReceivables();
  }

  createReceivable(): void {
    this.router.navigate(['/finance/receivables/new']);
  }

  viewReceivable(id: string): void {
    this.router.navigate(['/finance/receivables', id]);
  }

  registerPayment(ar: AccountReceivable): void {
    const amount = prompt(`请输入收款金额（待收金额：¥${ar.balance}）：`, ar.balance.toString());
    if (amount) {
      const paymentAmount = parseFloat(amount);
      if (!isNaN(paymentAmount) && paymentAmount > 0) {
        this.financeService.registerReceivablePayment(ar.id, {
          amount: paymentAmount,
          paymentDate: new Date(),
          accountId: '',
          notes: ''
        }).subscribe({
          next: () => this.loadReceivables(),
          error: (err) => console.error('收款登记失败', err)
        });
      }
    }
  }

  verifyReceivable(ar: AccountReceivable): void {
    if (confirm(`确定要核销应收款 "${ar.arNo}" 吗？`)) {
      this.financeService.verifyAccountReceivable(ar.id).subscribe({
        next: () => this.loadReceivables(),
        error: (err) => console.error('核销应收款失败', err)
      });
    }
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      [ArApStatus.待收款]: 'px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700',
      [ArApStatus.部分核销]: 'px-2 py-1 text-xs rounded bg-blue-100 text-blue-700',
      [ArApStatus.已核销]: 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
      [ArApStatus.逾期]: 'px-2 py-1 text-xs rounded bg-red-100 text-red-700'
    };
    return classes[status] || '';
  }
}