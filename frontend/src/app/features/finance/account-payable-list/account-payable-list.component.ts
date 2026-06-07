import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../services/finance.service';
import { AccountPayable, ArApStatus, PageResult } from '../models/finance.model';

@Component({
  selector: 'app-account-payable-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">应付款管理</h1>
        <button (click)="createPayable()" class="btn-primary">
          新建应付款
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
              placeholder="应付单号/供应商名称"
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
          <div class="text-sm text-gray-500">应付总额</div>
          <div class="text-2xl font-bold text-gray-800">¥{{ totalAmount() | number: '1.2-2' }}</div>
        </div>
        <div class="card p-4">
          <div class="text-sm text-gray-500">已付金额</div>
          <div class="text-2xl font-bold text-green-600">¥{{ totalPaidAmount() | number: '1.2-2' }}</div>
        </div>
        <div class="card p-4">
          <div class="text-sm text-gray-500">待付款</div>
          <div class="text-2xl font-bold text-orange-600">¥{{ totalBalance() | number: '1.2-2' }}</div>
        </div>
        <div class="card p-4">
          <div class="text-sm text-gray-500">逾期金额</div>
          <div class="text-2xl font-bold text-red-600">¥{{ overdueAmount() | number: '1.2-2' }}</div>
        </div>
      </div>

      <!-- 应付款列表 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">应付单号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">供应商名称</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">来源单据</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">应付金额</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">已付金额</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">待付金额</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">到期日期</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (ap of payables(); track ap.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-primary-600 cursor-pointer" (click)="viewPayable(ap.id)">
                    {{ ap.apNo }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ ap.supplierName }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ ap.sourceNo }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 text-right font-medium">¥{{ ap.amount | number: '1.2-2' }}</td>
                  <td class="px-4 py-3 text-sm text-green-600 text-right">¥{{ ap.paidAmount | number: '1.2-2' }}</td>
                  <td class="px-4 py-3 text-sm text-orange-600 text-right">¥{{ ap.balance | number: '1.2-2' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ ap.dueDate | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3">
                    <span [class]="getStatusClass(ap.status)">
                      {{ ap.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <button (click)="viewPayable(ap.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                        查看
                      </button>
                      @if (ap.status !== statusLabels[2]) {
                        <button (click)="registerPayment(ap)" class="text-green-600 hover:text-green-800 text-sm">
                          付款
                        </button>
                      }
                      @if (ap.balance > 0) {
                        <button (click)="verifyPayable(ap)" class="text-blue-600 hover:text-blue-800 text-sm">
                          核销
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                    暂无应付款数据
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
export class AccountPayableListComponent implements OnInit {
  private financeService = inject(FinanceService);
  private router = inject(Router);

  readonly ArApStatus = ArApStatus;
  readonly statusLabels = ['待付款', '部分核销', '已核销', '逾期'];

  payables = signal<AccountPayable[]>([]);
  pageResult = signal<PageResult<AccountPayable> | null>(null);

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
    this.loadPayables();
  }

  loadPayables(): void {
    const params = { ...this.queryParams };
    this.financeService.getAccountPayables(params as any).subscribe({
      next: (result) => {
        this.payables.set(result.items);
        this.pageResult.set(result);
        this.calculateSummary(result.items);
      },
      error: (err) => console.error('加载应付款列表失败', err)
    });
  }

  calculateSummary(items: AccountPayable[]): void {
    this.totalAmount.set(items.reduce((sum, ap) => sum + ap.amount, 0));
    this.totalPaidAmount.set(items.reduce((sum, ap) => sum + ap.paidAmount, 0));
    this.totalBalance.set(items.reduce((sum, ap) => sum + ap.balance, 0));
    this.overdueAmount.set(items.filter(ap => ap.status === ArApStatus.逾期).reduce((sum, ap) => sum + ap.balance, 0));
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.queryParams.page = 1;
      this.loadPayables();
    }, 300);
  }

  onStatusChange(): void {
    if (this.selectedStatus === 0) {
      this.queryParams.status = undefined;
    } else {
      this.queryParams.status = this.statusLabels[this.selectedStatus - 1];
    }
    this.queryParams.page = 1;
    this.loadPayables();
  }

  onDateChange(): void {
    this.queryParams.startDate = this.startDate ? new Date(this.startDate) : undefined;
    this.queryParams.endDate = this.endDate ? new Date(this.endDate) : undefined;
    this.queryParams.page = 1;
    this.loadPayables();
  }

  goToPage(page: number): void {
    this.queryParams.page = page;
    this.loadPayables();
  }

  createPayable(): void {
    this.router.navigate(['/finance/payables/new']);
  }

  viewPayable(id: string): void {
    this.router.navigate(['/finance/payables', id]);
  }

  registerPayment(ap: AccountPayable): void {
    const amount = prompt(`请输入付款金额（待付金额：¥${ap.balance}）：`, ap.balance.toString());
    if (amount) {
      const paymentAmount = parseFloat(amount);
      if (!isNaN(paymentAmount) && paymentAmount > 0) {
        this.financeService.registerPayablePayment(ap.id, {
          amount: paymentAmount,
          paymentDate: new Date(),
          accountId: '',
          notes: ''
        }).subscribe({
          next: () => this.loadPayables(),
          error: (err) => console.error('付款登记失败', err)
        });
      }
    }
  }

  verifyPayable(ap: AccountPayable): void {
    if (confirm(`确定要核销应付款 "${ap.apNo}" 吗？`)) {
      this.financeService.verifyAccountPayable(ap.id).subscribe({
        next: () => this.loadPayables(),
        error: (err) => console.error('核销应付款失败', err)
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