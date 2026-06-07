import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SaleService } from '../../services/sale.service';
import { SaleQuotation, QuotationStatus, QuotationQueryParams, PageResult } from '../../models/sale.model';

@Component({
  selector: 'app-quotation-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">销售报价单管理</h1>
        <button
          (click)="createQuotation()"
          class="btn-primary"
        >
          新建报价单
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
              placeholder="报价单号/客户名称"
              class="input-field w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">报价单状态</label>
            <select
              [(ngModel)]="queryParams.status"
              (ngModelChange)="loadQuotations()"
              class="input-field w-full"
            >
              <option [ngValue]="undefined">全部</option>
              <option [value]="statusDraft">草稿</option>
              <option [value]="statusConfirmed">已确认</option>
              <option [value]="statusConverted">已转订单</option>
              <option [value]="statusExpired">已过期</option>
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

      <!-- 报价单列表 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">报价单号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">客户名称</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">报价日期</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">有效期至</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">总价</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">折扣率</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">折后价</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (quotation of quotations(); track quotation.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-primary-600 cursor-pointer" (click)="viewQuotation(quotation.id)">
                    {{ quotation.quotationNo }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ quotation.customerName }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ quotation.quotationDate | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ quotation.validUntil | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">¥{{ quotation.totalAmount | number: '1.2-2' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ quotation.discountRate * 100 | number: '1.0-0' }}%</td>
                  <td class="px-4 py-3 text-sm text-gray-800 font-medium">¥{{ quotation.finalAmount | number: '1.2-2' }}</td>
                  <td class="px-4 py-3">
                    <span [class]="getStatusClass(quotation.status)">
                      {{ getStatusText(quotation.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <button
                        (click)="viewQuotation(quotation.id)"
                        class="text-primary-600 hover:text-primary-800 text-sm"
                      >
                        查看
                      </button>
                      @if (quotation.status === statusDraft) {
                        <button
                          (click)="editQuotation(quotation.id)"
                          class="text-primary-600 hover:text-primary-800 text-sm"
                        >
                          编辑
                        </button>
                        <button
                          (click)="deleteQuotation(quotation)"
                          class="text-red-600 hover:text-red-800 text-sm"
                        >
                          删除
                        </button>
                        <button
                          (click)="confirmQuotation(quotation)"
                          class="text-green-600 hover:text-green-800 text-sm"
                        >
                          确认
                        </button>
                      }
                      @if (quotation.status === statusConfirmed) {
                        <button
                          (click)="convertToOrder(quotation)"
                          class="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          转订单
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                    暂无报价单数据
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
export class QuotationListComponent {
  private readonly saleService = inject(SaleService);
  private readonly router = inject(Router);

  readonly QuotationStatus = QuotationStatus;
  // 模板中使用的状态常量
  readonly statusDraft = 'draft';
  readonly statusConfirmed = 'confirmed';
  readonly statusConverted = 'converted';
  readonly statusExpired = 'expired';

  quotations = signal<SaleQuotation[]>([]);
  pageResult = signal<PageResult<SaleQuotation> | null>(null);

  queryParams: QuotationQueryParams = {
    page: 1,
    pageSize: 10,
    keyword: '',
    status: undefined,
    startDate: undefined,
    endDate: undefined,
  };

  startDate: string = '';
  endDate: string = '';

  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.loadQuotations();
  }

  loadQuotations(): void {
    this.queryParams.startDate = this.startDate ? new Date(this.startDate) : undefined;
    this.queryParams.endDate = this.endDate ? new Date(this.endDate) : undefined;

    this.saleService.getQuotations(this.queryParams).subscribe({
      next: (result) => {
        this.quotations.set(result.items);
        this.pageResult.set(result);
      },
      error: (err) => {
        console.error('加载报价单列表失败', err);
      },
    });
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.queryParams.page = 1;
      this.loadQuotations();
    }, 300);
  }

  onDateChange(): void {
    this.queryParams.page = 1;
    this.loadQuotations();
  }

  goToPage(page: number): void {
    this.queryParams.page = page;
    this.loadQuotations();
  }

  createQuotation(): void {
    this.router.navigate(['/sales/quotations/new']);
  }

  viewQuotation(id: string): void {
    this.router.navigate(['/sales/quotations', id]);
  }

  editQuotation(id: string): void {
    this.router.navigate(['/sales/quotations', id, 'edit']);
  }

  deleteQuotation(quotation: SaleQuotation): void {
    if (confirm(`确定要删除报价单 ${quotation.quotationNo} 吗？`)) {
      this.saleService.deleteQuotation(quotation.id).subscribe({
        next: () => {
          this.loadQuotations();
        },
        error: (err) => {
          console.error('删除报价单失败', err);
        },
      });
    }
  }

  confirmQuotation(quotation: SaleQuotation): void {
    if (confirm(`确定要确认报价单 ${quotation.quotationNo} 吗？`)) {
      this.saleService.confirmQuotation(quotation.id).subscribe({
        next: () => {
          this.loadQuotations();
        },
        error: (err) => {
          console.error('确认报价单失败', err);
        },
      });
    }
  }

  convertToOrder(quotation: SaleQuotation): void {
    if (confirm(`确定要将报价单 ${quotation.quotationNo} 转化为销售订单吗？`)) {
      this.saleService.convertQuotationToOrder(quotation.id).subscribe({
        next: (order) => {
          alert(`订单创建成功，订单号：${order.orderNo}`);
          this.loadQuotations();
        },
        error: (err) => {
          console.error('转订单失败', err);
          alert('转订单失败：' + (err.error?.message || '未知错误'));
        },
      });
    }
  }

  getStatusClass(status: QuotationStatus): string {
    const classes: Record<string, string> = {
      'draft': 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-600',
      'confirmed': 'px-2 py-1 text-xs rounded bg-blue-100 text-blue-700',
      'converted': 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
      'expired': 'px-2 py-1 text-xs rounded bg-red-100 text-red-700',
    };
    return classes[status] || '';
  }

  getStatusText(status: QuotationStatus): string {
    const texts: Record<string, string> = {
      'draft': '草稿',
      'confirmed': '已确认',
      'converted': '已转订单',
      'expired': '已过期',
    };
    return texts[status] || status;
  }
}
