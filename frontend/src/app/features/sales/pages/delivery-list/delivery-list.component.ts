import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SaleService } from '../../services/sale.service';
import { DeliveryNote, DeliveryStatus, DeliveryQueryParams, PageResult } from '../../models/sale.model';

@Component({
  selector: 'app-delivery-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">发货管理</h1>
        <button (click)="createDelivery()" class="btn-primary">
          创建发货单
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
              placeholder="发货单号/订单号"
              class="input-field w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">发货状态</label>
            <select
              [(ngModel)]="queryParams.status"
              (ngModelChange)="loadDeliveryNotes()"
              class="input-field w-full"
            >
              <option [ngValue]="undefined">全部</option>
              <option [value]="DeliveryStatus.待发货">待发货</option>
              <option [value]="DeliveryStatus.部分发货">部分发货</option>
              <option [value]="DeliveryStatus.已发货">已发货</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">订单号</label>
            <input
              type="text"
              [(ngModel)]="orderKeyword"
              (ngModelChange)="onOrderKeywordChange()"
              placeholder="输入订单号"
              class="input-field w-full"
            />
          </div>
        </div>
      </div>

      <!-- 发货单列表 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">发货单号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">关联订单</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">发货日期</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (delivery of deliveries(); track delivery.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-primary-600 cursor-pointer" (click)="viewDelivery(delivery.id)">
                    {{ delivery.deliveryNo }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ delivery.orderNo }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ delivery.deliveryDate | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3">
                    <span [class]="getStatusClass(delivery.status)">
                      {{ getStatusText(delivery.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <button
                        (click)="viewDelivery(delivery.id)"
                        class="text-primary-600 hover:text-primary-800 text-sm"
                      >
                        查看
                      </button>
                      @if (delivery.status === DeliveryStatus.待发货) {
                        <button
                          (click)="confirmDelivery(delivery)"
                          class="text-green-600 hover:text-green-800 text-sm"
                        >
                          确认发货
                        </button>
                        <button
                          (click)="deleteDelivery(delivery)"
                          class="text-red-600 hover:text-red-800 text-sm"
                        >
                          删除
                        </button>
                      }
                      <button
                        (click)="printDelivery(delivery)"
                        class="text-gray-600 hover:text-gray-800 text-sm"
                      >
                        打印
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                    暂无发货单数据
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
export class DeliveryListComponent {
  private readonly saleService = inject(SaleService);
  private readonly router = inject(Router);

  readonly DeliveryStatus = DeliveryStatus;

  deliveries = signal<DeliveryNote[]>([]);
  pageResult = signal<PageResult<DeliveryNote> | null>(null);

  queryParams: DeliveryQueryParams = {
    page: 1,
    pageSize: 10,
    keyword: '',
    status: undefined,
    orderId: undefined,
  };

  orderKeyword = '';

  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.loadDeliveryNotes();
  }

  loadDeliveryNotes(): void {
    this.saleService.getDeliveryNotes(this.queryParams).subscribe({
      next: (result) => {
        this.deliveries.set(result.items);
        this.pageResult.set(result);
      },
      error: (err) => {
        console.error('加载发货单列表失败', err);
      },
    });
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.queryParams.page = 1;
      this.loadDeliveryNotes();
    }, 300);
  }

  onOrderKeywordChange(): void {
    this.queryParams.page = 1;
    this.loadDeliveryNotes();
  }

  goToPage(page: number): void {
    this.queryParams.page = page;
    this.loadDeliveryNotes();
  }

  createDelivery(): void {
    this.router.navigate(['/sales/delivery/new']);
  }

  viewDelivery(id: string): void {
    this.router.navigate(['/sales/delivery', id]);
  }

  deleteDelivery(delivery: DeliveryNote): void {
    if (confirm(`确定要删除发货单 ${delivery.deliveryNo} 吗？`)) {
      this.saleService.deleteDeliveryNote(delivery.id).subscribe({
        next: () => {
          this.loadDeliveryNotes();
        },
        error: (err) => {
          console.error('删除发货单失败', err);
        },
      });
    }
  }

  confirmDelivery(delivery: DeliveryNote): void {
    if (confirm(`确定要确认发货单 ${delivery.deliveryNo} 吗？`)) {
      this.saleService.confirmDelivery(delivery.id).subscribe({
        next: () => {
          this.loadDeliveryNotes();
        },
        error: (err) => {
          console.error('确认发货失败', err);
        },
      });
    }
  }

  printDelivery(delivery: DeliveryNote): void {
    // 打印功能
    window.print();
  }

  getStatusClass(status: DeliveryStatus): string {
    const classes: Record<DeliveryStatus, string> = {
      [DeliveryStatus.待发货]: 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-600',
      [DeliveryStatus.部分发货]: 'px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700',
      [DeliveryStatus.已发货]: 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
    };
    return classes[status] || '';
  }

  getStatusText(status: DeliveryStatus): string {
    const texts: Record<DeliveryStatus, string> = {
      [DeliveryStatus.待发货]: '待发货',
      [DeliveryStatus.部分发货]: '部分发货',
      [DeliveryStatus.已发货]: '已发货',
    };
    return texts[status] || status;
  }
}
