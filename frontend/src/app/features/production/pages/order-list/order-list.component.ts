import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ProductionService } from '../../services/production.service';
import {
  ProductionOrder,
  ProductionOrderStatus,
  ProductionPriority,
  ProductionOrderQueryParams,
  PageResult,
} from '../../models/production.model';

@Component({
  selector: 'app-production-order-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">生产工单管理</h1>
          <p class="text-sm text-gray-500 mt-1">管理生产工单，跟踪生产进度</p>
        </div>
        <button (click)="createOrder()" class="btn-primary">
          新建工单
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
              placeholder="工单号/产品名称"
              class="input-field w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">工单状态</label>
            <select
              [(ngModel)]="queryParams.status"
              (ngModelChange)="loadOrders()"
              class="input-field w-full"
            >
              <option [ngValue]="undefined">全部</option>
              <option [value]="'draft'">草稿</option>
              <option [value]="'confirmed'">已确认</option>
              <option [value]="'in_production'">生产中</option>
              <option [value]="'pending_storage'">待入库</option>
              <option [value]="'completed'">已完成</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">优先级</label>
            <select
              [(ngModel)]="queryParams.priority"
              (ngModelChange)="loadOrders()"
              class="input-field w-full"
            >
              <option [ngValue]="undefined">全部</option>
              <option [value]="'urgent'">紧急</option>
              <option [value]="'high'">高</option>
              <option [value]="'medium'">中</option>
              <option [value]="'low'">低</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">日期范围</label>
            <input
              type="date"
              [(ngModel)]="dateRange"
              (ngModelChange)="onDateChange()"
              class="input-field w-full"
            />
          </div>
        </div>
      </div>

      <!-- 工单列表 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">工单号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">产品信息</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">颜色</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">计划数量</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">完成数量</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">完成率</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">优先级</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">状态</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">开始日期</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">预计完成</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (order of orders(); track order.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-primary-600 cursor-pointer" (click)="viewOrder(order.id)">
                    {{ order.orderNo }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ order.productName }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">
                    @if (order.colorCode || order.colorName) {
                      {{ order.colorCode }}-{{ order.colorName }}
                    } @else {
                      -
                    }
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800 text-right">{{ order.plannedQuantity | number }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 text-right">{{ order.actualQuantity | number }}</td>
                  <td class="px-4 py-3 text-center">
                    <span [class]="getCompletionRateClass(order)">
                      {{ getCompletionRate(order) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span [class]="getPriorityClass(order.priority)">
                      {{ getPriorityText(order.priority) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span [class]="getStatusClass(order.status)">
                      {{ getStatusText(order.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ order.startDate | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ order.expectedFinishDate | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <button (click)="viewOrder(order.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                        查看
                      </button>
                      @if (order.status === 'draft') {
                        <button (click)="editOrder(order.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                          编辑
                        </button>
                        <button (click)="deleteOrder(order)" class="text-red-600 hover:text-red-800 text-sm">
                          删除
                        </button>
                        <button (click)="confirmOrder(order)" class="text-green-600 hover:text-green-800 text-sm">
                          确认
                        </button>
                      }
                      @if (order.status === 'confirmed') {
                        <button (click)="startProduction(order)" class="text-blue-600 hover:text-blue-800 text-sm">
                          开始生产
                        </button>
                      }
                      @if (order.status === 'in_production') {
                        <button (click)="pendingStorage(order)" class="text-yellow-600 hover:text-yellow-800 text-sm">
                          待入库
                        </button>
                      }
                      @if (order.status === 'pending_storage') {
                        <button (click)="completeOrder(order)" class="text-green-600 hover:text-green-800 text-sm">
                          完成
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="11" class="px-4 py-8 text-center text-gray-500">
                    暂无工单数据
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
export class ProductionOrderListComponent {
  private readonly productionService = inject(ProductionService);
  private readonly router = inject(Router);

  readonly ProductionOrderStatus = ProductionOrderStatus;
  readonly ProductionPriority = ProductionPriority;

  orders = signal<ProductionOrder[]>([]);
  pageResult = signal<PageResult<ProductionOrder> | null>(null);

  queryParams: ProductionOrderQueryParams = {
    page: 1,
    pageSize: 10,
    keyword: '',
    status: undefined,
    priority: undefined,
    startDate: undefined,
    endDate: undefined,
  };

  dateRange: string = '';

  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.loadOrders();
  }

  loadOrders(): void {
    if (this.dateRange) {
      const date = new Date(this.dateRange);
      this.queryParams.startDate = date;
      this.queryParams.endDate = date;
    } else {
      this.queryParams.startDate = undefined;
      this.queryParams.endDate = undefined;
    }

    this.productionService.getOrders(this.queryParams).subscribe({
      next: (result) => {
        this.orders.set(result.items);
        this.pageResult.set(result);
      },
      error: (err) => {
        console.error('加载工单列表失败', err);
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
    this.router.navigate(['/production/orders/new']);
  }

  viewOrder(id: string): void {
    this.router.navigate(['/production/orders', id]);
  }

  editOrder(id: string): void {
    this.router.navigate(['/production/orders', id, 'edit']);
  }

  deleteOrder(order: ProductionOrder): void {
    if (confirm(`确定要删除工单 ${order.orderNo} 吗？`)) {
      this.productionService.deleteOrder(order.id).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          console.error('删除工单失败', err);
        },
      });
    }
  }

  confirmOrder(order: ProductionOrder): void {
    if (confirm(`确定要确认工单 ${order.orderNo} 吗？`)) {
      this.productionService.updateOrderStatus(order.id, ProductionOrderStatus.已确认).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          console.error('确认工单失败', err);
        },
      });
    }
  }

  startProduction(order: ProductionOrder): void {
    if (confirm(`确定要开始生产工单 ${order.orderNo} 吗？`)) {
      this.productionService.updateOrderStatus(order.id, ProductionOrderStatus.生产中).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          console.error('更新工单状态失败', err);
        },
      });
    }
  }

  pendingStorage(order: ProductionOrder): void {
    if (confirm(`确定要将工单 ${order.orderNo} 标记为待入库吗？`)) {
      this.productionService.updateOrderStatus(order.id, ProductionOrderStatus.待入库).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          console.error('更新工单状态失败', err);
        },
      });
    }
  }

  completeOrder(order: ProductionOrder): void {
    if (confirm(`确定要完成工单 ${order.orderNo} 吗？`)) {
      this.productionService.updateOrderStatus(order.id, ProductionOrderStatus.已完成).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          console.error('完成工单失败', err);
        },
      });
    }
  }

  getCompletionRate(order: ProductionOrder): string {
    if (order.plannedQuantity === 0) return '0%';
    const rate = (order.actualQuantity / order.plannedQuantity) * 100;
    return `${rate.toFixed(0)}%`;
  }

  getCompletionRateClass(order: ProductionOrder): string {
    const rate = order.plannedQuantity > 0 
      ? (order.actualQuantity / order.plannedQuantity) * 100 
      : 0;
    if (rate >= 100) return 'px-2 py-1 text-xs rounded bg-green-100 text-green-700';
    if (rate >= 50) return 'px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700';
    return 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-600';
  }

  getPriorityClass(priority: ProductionPriority): string {
    const classes: Record<ProductionPriority, string> = {
      [ProductionPriority.紧急]: 'px-2 py-1 text-xs rounded bg-red-100 text-red-700',
      [ProductionPriority.高]: 'px-2 py-1 text-xs rounded bg-orange-100 text-orange-700',
      [ProductionPriority.中]: 'px-2 py-1 text-xs rounded bg-blue-100 text-blue-700',
      [ProductionPriority.低]: 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-600',
    };
    return classes[priority] || '';
  }

  getPriorityText(priority: ProductionPriority): string {
    const texts: Record<ProductionPriority, string> = {
      [ProductionPriority.紧急]: '紧急',
      [ProductionPriority.高]: '高',
      [ProductionPriority.中]: '中',
      [ProductionPriority.低]: '低',
    };
    return texts[priority] || priority;
  }

  getStatusClass(status: ProductionOrderStatus): string {
    const classes: Record<ProductionOrderStatus, string> = {
      [ProductionOrderStatus.草稿]: 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-600',
      [ProductionOrderStatus.已确认]: 'px-2 py-1 text-xs rounded bg-blue-100 text-blue-700',
      [ProductionOrderStatus.生产中]: 'px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700',
      [ProductionOrderStatus.待入库]: 'px-2 py-1 text-xs rounded bg-purple-100 text-purple-700',
      [ProductionOrderStatus.已完成]: 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
    };
    return classes[status] || '';
  }

  getStatusText(status: ProductionOrderStatus): string {
    const texts: Record<ProductionOrderStatus, string> = {
      [ProductionOrderStatus.草稿]: '草稿',
      [ProductionOrderStatus.已确认]: '已确认',
      [ProductionOrderStatus.生产中]: '生产中',
      [ProductionOrderStatus.待入库]: '待入库',
      [ProductionOrderStatus.已完成]: '已完成',
    };
    return texts[status] || status;
  }
}
