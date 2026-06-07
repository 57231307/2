import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PurchaseService } from '../../services/purchase.service';
import {
  PurchaseOrder,
  PurchaseOrderStatus,
  PurchaseOrderQueryParams,
  PageResult,
  Supplier,
} from '../../models/purchase.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">采购订单管理</h1>
        <div class="flex gap-3">
          <button
            (click)="navigateToReceipts()"
            class="btn-secondary"
          >
            入库单管理
          </button>
          <button
            (click)="navigateToReturns()"
            class="btn-secondary"
          >
            退货管理
          </button>
          <button
            (click)="createOrder()"
            class="btn-primary"
          >
            新建订单
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
              placeholder="订单号/供应商名称"
              class="input-field w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
            <select
              [(ngModel)]="queryParams.supplierId"
              (ngModelChange)="loadOrders()"
              class="input-field w-full"
            >
              <option [ngValue]="undefined">全部</option>
              @for (supplier of suppliers(); track supplier.id) {
                <option [value]="supplier.id">{{ supplier.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">订单状态</label>
            <select
              [(ngModel)]="queryParams.status"
              (ngModelChange)="loadOrders()"
              class="input-field w-full"
            >
              <option [ngValue]="undefined">全部</option>
              <option [value]="statusDraft">草稿</option>
              <option [value]="statusConfirmed">已确认</option>
              <option [value]="statusPartialReceived">部分入库</option>
              <option [value]="statusCompleted">已完成</option>
              <option [value]="statusCancelled">已取消</option>
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

      <!-- 订单列表 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">订单号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">供应商</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">订单日期</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">预计交货日期</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">订单金额</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">已入库金额</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">状态</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (order of orders(); track order.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-primary-600 cursor-pointer" (click)="viewOrder(order.id)">
                    {{ order.orderNo }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ order.supplierName }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ order.orderDate | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ order.expectedDeliveryDate | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 font-medium text-right">¥{{ order.totalAmount | number: '1.2-2' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 text-right">¥{{ order.receivedAmount | number: '1.2-2' }}</td>
                  <td class="px-4 py-3 text-center">
                    <span [class]="getStatusClass(order.status)">
                      {{ getStatusText(order.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-center gap-2">
                      <button
                        (click)="viewOrder(order.id)"
                        class="text-primary-600 hover:text-primary-800 text-sm"
                      >
                        查看
                      </button>
                      @if (order.status === statusDraft) {
                        <button
                          (click)="editOrder(order.id)"
                          class="text-primary-600 hover:text-primary-800 text-sm"
                        >
                          编辑
                        </button>
                        <button
                          (click)="deleteOrder(order)"
                          class="text-red-600 hover:text-red-800 text-sm"
                        >
                          删除
                        </button>
                      }
                      @if (order.status === statusDraft) {
                        <button
                          (click)="confirmOrder(order)"
                          class="text-green-600 hover:text-green-800 text-sm"
                        >
                          确认
                        </button>
                      }
                      @if (order.status === statusConfirmed || order.status === statusPartialReceived) {
                        <button
                          (click)="createReceipt(order)"
                          class="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          入库
                        </button>
                      }
                      @if (order.status === statusPartialReceived) {
                        <button
                          (click)="completeOrder(order)"
                          class="text-green-600 hover:text-green-800 text-sm"
                        >
                          完成
                        </button>
                      }
                      @if (order.status === statusConfirmed || order.status === statusPartialReceived) {
                        <button
                          (click)="cancelOrder(order)"
                          class="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          取消
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                    暂无订单数据
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
export class OrderListComponent {
  private readonly purchaseService = inject(PurchaseService);
  private readonly router = inject(Router);

  // 状态常量，用于模板中引用
  readonly statusDraft = PurchaseOrderStatus.草稿;
  readonly statusConfirmed = PurchaseOrderStatus.已确认;
  readonly statusPartialReceived = PurchaseOrderStatus.部分入库;
  readonly statusCompleted = PurchaseOrderStatus.已完成;
  readonly statusCancelled = PurchaseOrderStatus.已取消;

  orders = signal<PurchaseOrder[]>([]);
  pageResult = signal<PageResult<PurchaseOrder> | null>(null);
  suppliers = signal<Supplier[]>([]);

  queryParams: PurchaseOrderQueryParams = {
    page: 1,
    pageSize: 10,
    keyword: '',
    status: undefined,
    supplierId: undefined,
    startDate: undefined,
    endDate: undefined,
  };

  startDate: string = '';
  endDate: string = '';

  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.loadOrders();
    this.loadSuppliers();
  }

  loadOrders(): void {
    this.queryParams.startDate = this.startDate ? new Date(this.startDate) : undefined;
    this.queryParams.endDate = this.endDate ? new Date(this.endDate) : undefined;

    this.purchaseService.getOrders(this.queryParams).subscribe({
      next: (result) => {
        this.orders.set(result.items);
        this.pageResult.set(result);
      },
      error: (err) => {
        console.error('加载订单列表失败', err);
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

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.queryParams.page = 1;
      this.loadOrders();
    }, 300);
  }

  onDateChange(): void {
    this.queryParams.page = 1;
    this.loadOrders();
  }

  goToPage(page: number): void {
    this.queryParams.page = page;
    this.loadOrders();
  }

  createOrder(): void {
    this.router.navigate(['/purchase/orders/new']);
  }

  viewOrder(id: string): void {
    this.router.navigate(['/purchase/orders', id]);
  }

  editOrder(id: string): void {
    this.router.navigate(['/purchase/orders', id, 'edit']);
  }

  deleteOrder(order: PurchaseOrder): void {
    if (confirm(`确定要删除订单 ${order.orderNo} 吗？`)) {
      this.purchaseService.deleteOrder(order.id).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          console.error('删除订单失败', err);
        },
      });
    }
  }

  confirmOrder(order: PurchaseOrder): void {
    if (confirm(`确定要确认订单 ${order.orderNo} 吗？`)) {
      this.purchaseService.updateOrderStatus(order.id, PurchaseOrderStatus.已确认).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          console.error('确认订单失败', err);
        },
      });
    }
  }

  cancelOrder(order: PurchaseOrder): void {
    if (confirm(`确定要取消订单 ${order.orderNo} 吗？`)) {
      this.purchaseService.updateOrderStatus(order.id, PurchaseOrderStatus.已取消).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          console.error('取消订单失败', err);
        },
      });
    }
  }

  completeOrder(order: PurchaseOrder): void {
    if (confirm(`确定要完成订单 ${order.orderNo} 吗？`)) {
      this.purchaseService.updateOrderStatus(order.id, PurchaseOrderStatus.已完成).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          console.error('完成订单失败', err);
        },
      });
    }
  }

  createReceipt(order: PurchaseOrder): void {
    this.router.navigate(['/purchase/receipts/new'], { queryParams: { orderId: order.id } });
  }

  navigateToReceipts(): void {
    this.router.navigate(['/purchase/receipts']);
  }

  navigateToReturns(): void {
    this.router.navigate(['/purchase/returns']);
  }

  getStatusClass(status: PurchaseOrderStatus): string {
    const classes: Record<string, string> = {
      [PurchaseOrderStatus.草稿]: 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-600',
      [PurchaseOrderStatus.已确认]: 'px-2 py-1 text-xs rounded bg-blue-100 text-blue-700',
      [PurchaseOrderStatus.部分入库]: 'px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700',
      [PurchaseOrderStatus.已完成]: 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
      [PurchaseOrderStatus.已取消]: 'px-2 py-1 text-xs rounded bg-red-100 text-red-700',
    };
    return classes[status] || '';
  }

  getStatusText(status: PurchaseOrderStatus): string {
    const texts: Record<string, string> = {
      [PurchaseOrderStatus.草稿]: '草稿',
      [PurchaseOrderStatus.已确认]: '已确认',
      [PurchaseOrderStatus.部分入库]: '部分入库',
      [PurchaseOrderStatus.已完成]: '已完成',
      [PurchaseOrderStatus.已取消]: '已取消',
    };
    return texts[status] || status;
  }
}
