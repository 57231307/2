import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PurchaseService } from '../../services/purchase.service';
import {
  GoodsReceipt,
  ReceiptStatus,
  GoodsReceiptQueryParams,
  PageResult,
  PurchaseOrder,
} from '../../models/purchase.model';

@Component({
  selector: 'app-receipt-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">采购入库管理</h1>
        <div class="flex gap-3">
          <button
            (click)="navigateToOrders()"
            class="btn-secondary"
          >
            采购订单
          </button>
          <button
            (click)="navigateToReturns()"
            class="btn-secondary"
          >
            退货管理
          </button>
          <button
            (click)="createReceipt()"
            class="btn-primary"
          >
            新建入库单
          </button>
        </div>
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
              placeholder="入库单号/订单号"
              class="input-field w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">入库状态</label>
            <select
              [(ngModel)]="queryParams.status"
              (ngModelChange)="loadReceipts()"
              class="input-field w-full"
            >
              <option [ngValue]="undefined">全部</option>
              <option [value]="statusPending">待入库</option>
              <option [value]="statusPartial">部分入库</option>
              <option [value]="statusReceived">已入库</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">关联订单</label>
            <select
              [(ngModel)]="queryParams.orderId"
              (ngModelChange)="loadReceipts()"
              class="input-field w-full"
            >
              <option [ngValue]="undefined">全部</option>
              @for (order of orders(); track order.id) {
                <option [value]="order.id">{{ order.orderNo }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- 入库单列表 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">入库单号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">关联订单</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">入库日期</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">仓库</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">状态</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (receipt of receipts(); track receipt.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-primary-600 cursor-pointer" (click)="viewReceipt(receipt.id)">
                    {{ receipt.receiptNo }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ receipt.orderNo }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ receipt.receiptDate | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ receipt.warehouseName }}</td>
                  <td class="px-4 py-3 text-center">
                    <span [class]="getStatusClass(receipt.status)">
                      {{ getStatusText(receipt.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-center gap-2">
                      <button
                        (click)="viewReceipt(receipt.id)"
                        class="text-primary-600 hover:text-primary-800 text-sm"
                      >
                        查看
                      </button>
                      @if (receipt.status === statusPending || receipt.status === statusPartial) {
                        <button
                          (click)="confirmReceipt(receipt)"
                          class="text-green-600 hover:text-green-800 text-sm"
                        >
                          确认入库
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                    暂无入库单数据
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
export class ReceiptListComponent implements OnInit {
  private readonly purchaseService = inject(PurchaseService);
  private readonly router = inject(Router);

  // 状态常量
  readonly statusPending = ReceiptStatus.待入库;
  readonly statusPartial = ReceiptStatus.部分入库;
  readonly statusReceived = ReceiptStatus.已入库;

  receipts = signal<GoodsReceipt[]>([]);
  orders = signal<PurchaseOrder[]>([]);
  pageResult = signal<PageResult<GoodsReceipt> | null>(null);

  queryParams: GoodsReceiptQueryParams = {
    page: 1,
    pageSize: 10,
    keyword: '',
    status: undefined,
    orderId: undefined,
  };

  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.loadReceipts();
    this.loadOrders();
  }

  ngOnInit(): void {}

  loadReceipts(): void {
    this.purchaseService.getReceipts(this.queryParams).subscribe({
      next: (result) => {
        this.receipts.set(result.items);
        this.pageResult.set(result);
      },
      error: (err) => {
        console.error('加载入库单列表失败', err);
      },
    });
  }

  loadOrders(): void {
    this.purchaseService.getOrders({ page: 1, pageSize: 100 }).subscribe({
      next: (result) => {
        this.orders.set(result.items);
      },
      error: (err) => {
        console.error('加载订单列表失败', err);
      },
    });
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.queryParams.page = 1;
      this.loadReceipts();
    }, 300);
  }

  goToPage(page: number): void {
    this.queryParams.page = page;
    this.loadReceipts();
  }

  createReceipt(): void {
    this.router.navigate(['/purchase/receipts/new']);
  }

  viewReceipt(id: string): void {
    this.router.navigate(['/purchase/receipts', id]);
  }

  confirmReceipt(receipt: GoodsReceipt): void {
    if (confirm(`确定要确认入库单 ${receipt.receiptNo} 吗？`)) {
      this.purchaseService.confirmReceipt(receipt.id).subscribe({
        next: () => {
          this.loadReceipts();
        },
        error: (err) => {
          console.error('确认入库失败', err);
        },
      });
    }
  }

  navigateToOrders(): void {
    this.router.navigate(['/purchase']);
  }

  navigateToReturns(): void {
    this.router.navigate(['/purchase/returns']);
  }

  getStatusClass(status: ReceiptStatus): string {
    const classes: Record<string, string> = {
      [ReceiptStatus.待入库]: 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-600',
      [ReceiptStatus.部分入库]: 'px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700',
      [ReceiptStatus.已入库]: 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
    };
    return classes[status] || '';
  }

  getStatusText(status: ReceiptStatus): string {
    const texts: Record<string, string> = {
      [ReceiptStatus.待入库]: '待入库',
      [ReceiptStatus.部分入库]: '部分入库',
      [ReceiptStatus.已入库]: '已入库',
    };
    return texts[status] || status;
  }
}
