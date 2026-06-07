import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ProductionService } from '../../services/production.service';
import {
  ProductionReceipt,
  ProductionReceiptStatus,
  ReceiptQueryParams,
  PageResult,
  ProductionOrder,
} from '../../models/production.model';

@Component({
  selector: 'app-receipt-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">生产入库</h1>
          <p class="text-sm text-gray-500 mt-1">管理生产入库单</p>
        </div>
        <button (click)="createReceipt()" class="btn-primary">
          新建入库单
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
              placeholder="入库单号/工单号"
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
              <option value="pending">待入库</option>
              <option value="received">已入库</option>
              <option value="partial">部分入库</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">生产工单</label>
            <select
              [(ngModel)]="queryParams.productionOrderId"
              (ngModelChange)="loadReceipts()"
              class="input-field w-full"
            >
              <option [ngValue]="undefined">全部</option>
              @for (order of productionOrders(); track order.id) {
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
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">关联工单</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">入库日期</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">仓库</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">入库数量</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">状态</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (receipt of receipts(); track receipt.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-primary-600 cursor-pointer" (click)="viewReceipt(receipt.id)">
                    {{ receipt.receiptNo }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ receipt.productionOrderNo }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ receipt.receiptDate | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ receipt.warehouseName }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 text-center">
                    {{ getTotalQuantity(receipt) | number }}
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span [class]="getStatusClass(receipt.status)">
                      {{ getStatusText(receipt.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <button (click)="viewReceipt(receipt.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                        查看
                      </button>
                      @if (receipt.status === 'pending') {
                        <button (click)="editReceipt(receipt.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                          编辑
                        </button>
                        <button (click)="deleteReceipt(receipt)" class="text-red-600 hover:text-red-800 text-sm">
                          删除
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-4 py-8 text-center text-gray-500">
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
export class ReceiptListComponent {
  private readonly productionService = inject(ProductionService);
  private readonly router = inject(Router);

  readonly ProductionReceiptStatus = ProductionReceiptStatus;

  receipts = signal<ProductionReceipt[]>([]);
  productionOrders = signal<ProductionOrder[]>([]);
  pageResult = signal<PageResult<ProductionReceipt> | null>(null);

  queryParams: ReceiptQueryParams = {
    page: 1,
    pageSize: 10,
    keyword: '',
    status: undefined,
    productionOrderId: undefined,
  };

  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.loadReceipts();
    this.loadProductionOrders();
  }

  loadReceipts(): void {
    this.productionService.getReceipts(this.queryParams).subscribe({
      next: (result) => {
        this.receipts.set(result.items);
        this.pageResult.set(result);
      },
      error: (err) => {
        console.error('加载入库单列表失败', err);
      },
    });
  }

  loadProductionOrders(): void {
    this.productionService.getOrders({ page: 1, pageSize: 100 }).subscribe({
      next: (result) => this.productionOrders.set(result.items),
      error: (err) => console.error('加载工单列表失败', err),
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
    this.router.navigate(['/production/receipts/new']);
  }

  viewReceipt(id: string): void {
    this.router.navigate(['/production/receipts', id]);
  }

  editReceipt(id: string): void {
    this.router.navigate(['/production/receipts', id, 'edit']);
  }

  deleteReceipt(receipt: ProductionReceipt): void {
    if (confirm(`确定要删除入库单 ${receipt.receiptNo} 吗？`)) {
      this.productionService.deleteReceipt(receipt.id).subscribe({
        next: () => {
          this.loadReceipts();
        },
        error: (err) => {
          console.error('删除入库单失败', err);
        },
      });
    }
  }

  getTotalQuantity(receipt: ProductionReceipt): number {
    return receipt.items.reduce((sum, item) => sum + item.receiptQuantity, 0);
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'pending': 'px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700',
      'received': 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
      'partial': 'px-2 py-1 text-xs rounded bg-blue-100 text-blue-700',
    };
    return classes[status] || '';
  }

  getStatusText(status: string): string {
    const texts: Record<string, string> = {
      'pending': '待入库',
      'received': '已入库',
      'partial': '部分入库',
    };
    return texts[status] || status;
  }
}
