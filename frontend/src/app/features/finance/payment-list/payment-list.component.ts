import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../services/finance.service';
import { Payment, PaymentType, PageResult } from '../models/finance.model';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">收付款记录</h1>
        <div class="flex gap-3">
          <button (click)="createPayment(receiveType)" class="btn-primary bg-green-600 hover:bg-green-700">
            收款
          </button>
          <button (click)="createPayment(payType)" class="btn-primary bg-orange-600 hover:bg-orange-700">
            付款
          </button>
        </div>
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
              placeholder="单据编号/对方单位"
              class="input-field w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">类型</label>
            <select
              [(ngModel)]="selectedType"
              (ngModelChange)="onTypeChange()"
              class="input-field w-full"
            >
              <option [ngValue]="0">全部</option>
              <option [ngValue]="1">{{ typeLabels[0] }}</option>
              <option [ngValue]="2">{{ typeLabels[1] }}</option>
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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="card p-4">
          <div class="text-sm text-gray-500">收款总额</div>
          <div class="text-2xl font-bold text-green-600">¥{{ totalReceive() | number: '1.2-2' }}</div>
        </div>
        <div class="card p-4">
          <div class="text-sm text-gray-500">付款总额</div>
          <div class="text-2xl font-bold text-orange-600">¥{{ totalPay() | number: '1.2-2' }}</div>
        </div>
      </div>

      <!-- 收付款记录列表 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">单据编号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">类型</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">对方单位</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">结算账户</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">金额</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">日期</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (payment of payments(); track payment.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-primary-600 cursor-pointer" (click)="viewPayment(payment.id)">
                    {{ payment.paymentNo }}
                  </td>
                  <td class="px-4 py-3">
                    <span [class]="getTypeClass(payment.type)">
                      {{ payment.type === receiveType ? typeLabels[0] : typeLabels[1] }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ payment.counterpartyName }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ payment.accountName }}</td>
                  <td class="px-4 py-3 text-sm text-right font-medium" [class]="payment.type === receiveType ? 'text-green-600' : 'text-orange-600'">
                    {{ payment.type === receiveType ? '+' : '-' }}¥{{ payment.amount | number: '1.2-2' }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ payment.paymentDate | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <button (click)="viewPayment(payment.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                        查看
                      </button>
                      <button (click)="deletePayment(payment)" class="text-red-600 hover:text-red-800 text-sm">
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                    暂无收付款记录
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
export class PaymentListComponent implements OnInit {
  private financeService = inject(FinanceService);
  private router = inject(Router);

  readonly PaymentType = PaymentType;
  readonly receiveType = 'RECEIVE';
  readonly payType = 'PAY';
  readonly typeLabels = ['收款', '付款'];

  payments = signal<Payment[]>([]);
  pageResult = signal<PageResult<Payment> | null>(null);

  totalReceive = signal(0);
  totalPay = signal(0);

  selectedType = 0;

  queryParams: { page: number; pageSize: number; keyword?: string; type?: string; startDate?: Date; endDate?: Date } = {
    page: 1,
    pageSize: 10,
    keyword: '',
    type: undefined,
    startDate: undefined,
    endDate: undefined
  };

  startDate: string = '';
  endDate: string = '';

  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.financeService.getPayments(this.queryParams as any).subscribe({
      next: (result) => {
        this.payments.set(result.items);
        this.pageResult.set(result);
        this.calculateSummary(result.items);
      },
      error: (err) => console.error('加载收付款记录失败', err)
    });
  }

  calculateSummary(items: Payment[]): void {
    this.totalReceive.set(
      items.filter(p => p.type === PaymentType.收款).reduce((sum, p) => sum + p.amount, 0)
    );
    this.totalPay.set(
      items.filter(p => p.type === PaymentType.付款).reduce((sum, p) => sum + p.amount, 0)
    );
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.queryParams.page = 1;
      this.loadPayments();
    }, 300);
  }

  onTypeChange(): void {
    if (this.selectedType === 0) {
      this.queryParams.type = undefined;
    } else {
      this.queryParams.type = this.selectedType === 1 ? this.receiveType : this.payType;
    }
    this.queryParams.page = 1;
    this.loadPayments();
  }

  onDateChange(): void {
    this.queryParams.startDate = this.startDate ? new Date(this.startDate) : undefined;
    this.queryParams.endDate = this.endDate ? new Date(this.endDate) : undefined;
    this.queryParams.page = 1;
    this.loadPayments();
  }

  goToPage(page: number): void {
    this.queryParams.page = page;
    this.loadPayments();
  }

  createPayment(type: string): void {
    this.router.navigate(['/finance/payments/new'], { queryParams: { type } });
  }

  viewPayment(id: string): void {
    this.router.navigate(['/finance/payments', id]);
  }

  deletePayment(payment: Payment): void {
    if (confirm(`确定要删除收付款记录 "${payment.paymentNo}" 吗？`)) {
      this.financeService.deletePayment(payment.id).subscribe({
        next: () => this.loadPayments(),
        error: (err) => console.error('删除收付款记录失败', err)
      });
    }
  }

  getTypeClass(type: string): string {
    return type === this.receiveType
      ? 'px-2 py-1 text-xs rounded bg-green-100 text-green-700'
      : 'px-2 py-1 text-xs rounded bg-orange-100 text-orange-700';
  }
}