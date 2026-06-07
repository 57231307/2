import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ProductionService } from '../../services/production.service';
import {
  ProductionOrder,
  ProductionOrderStatus,
  ProductionPriority,
} from '../../models/production.model';

@Component({
  selector: 'app-production-order-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      @if (order()) {
        <!-- 页面标题 -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-800">{{ order()!.orderNo }}</h1>
              <span [class]="getStatusClass(order()!.status)">
                {{ getStatusText(order()!.status) }}
              </span>
              <span [class]="getPriorityClass(order()!.priority)">
                {{ getPriorityText(order()!.priority) }}
              </span>
            </div>
            <p class="text-sm text-gray-500 mt-1">生产工单详情</p>
          </div>
          <div class="flex gap-2">
            <button (click)="goBack()" class="btn-secondary">
              返回列表
            </button>
            @if (order()!.status === 'draft') {
              <button (click)="editOrder()" class="btn-primary">
                编辑工单
              </button>
            }
            @if (order()!.status === 'confirmed') {
              <button (click)="startProduction()" class="btn-primary">
                开始生产
              </button>
            }
            @if (order()!.status === 'in_production') {
              <button (click)="pendingStorage()" class="btn-primary">
                标记待入库
              </button>
            }
            @if (order()!.status === 'pending_storage') {
              <button (click)="completeOrder()" class="btn-primary">
                完成工单
              </button>
            }
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="card mb-4">
          <h3 class="text-lg font-medium text-gray-800 mb-4">基本信息</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p class="text-sm text-gray-500 mb-1">产品名称</p>
              <p class="text-gray-800 font-medium">{{ order()!.productName }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">颜色</p>
              <p class="text-gray-800">
                @if (order()!.colorCode || order()!.colorName) {
                  {{ order()!.colorCode }}-{{ order()!.colorName }}
                } @else {
                  -
                }
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">计划数量</p>
              <p class="text-gray-800 font-medium">{{ order()!.plannedQuantity | number }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">完成数量</p>
              <p class="text-gray-800 font-medium">{{ order()!.actualQuantity | number }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">完成率</p>
              <p class="text-gray-800 font-medium">{{ getCompletionRate() }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">开始日期</p>
              <p class="text-gray-800">{{ order()!.startDate | date: 'yyyy-MM-dd' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">预计完成日期</p>
              <p class="text-gray-800">{{ order()!.expectedFinishDate | date: 'yyyy-MM-dd' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">实际完成日期</p>
              <p class="text-gray-800">
                @if (order()!.actualFinishDate) {
                  {{ order()!.actualFinishDate | date: 'yyyy-MM-dd' }}
                } @else {
                  -
                }
              </p>
            </div>
          </div>
          @if (order()!.notes) {
            <div class="mt-4 pt-4 border-t">
              <p class="text-sm text-gray-500 mb-1">备注</p>
              <p class="text-gray-800">{{ order()!.notes }}</p>
            </div>
          }
        </div>

        <!-- 工单明细 -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-800 mb-4">工单明细</h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">产品</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">计划数量</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">完成数量</th>
                  <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">完成率</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (item of order()!.items; track item.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-800">{{ item.productName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 text-right">{{ item.plannedQuantity | number }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 text-right">{{ item.actualQuantity | number }}</td>
                    <td class="px-4 py-3 text-center">
                      {{ getItemCompletionRate(item) }}
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-4 py-8 text-center text-gray-500">
                      暂无明细数据
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <div class="flex justify-center items-center h-64">
          <p class="text-gray-500">加载中...</p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductionOrderDetailComponent implements OnInit {
  private readonly productionService = inject(ProductionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly ProductionOrderStatus = ProductionOrderStatus;
  readonly ProductionPriority = ProductionPriority;

  order = signal<ProductionOrder | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(id);
    }
  }

  loadOrder(id: string): void {
    this.productionService.getOrder(id).subscribe({
      next: (order) => this.order.set(order),
      error: (err) => {
        console.error('加载工单详情失败', err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/production/orders']);
  }

  editOrder(): void {
    if (this.order()) {
      this.router.navigate(['/production/orders', this.order()!.id, 'edit']);
    }
  }

  startProduction(): void {
    if (this.order() && confirm(`确定要开始生产工单 ${this.order()!.orderNo} 吗？`)) {
      this.productionService.updateOrderStatus(this.order()!.id, ProductionOrderStatus.生产中).subscribe({
        next: () => this.loadOrder(this.order()!.id),
        error: (err) => console.error('更新工单状态失败', err),
      });
    }
  }

  pendingStorage(): void {
    if (this.order() && confirm(`确定要将工单 ${this.order()!.orderNo} 标记为待入库吗？`)) {
      this.productionService.updateOrderStatus(this.order()!.id, ProductionOrderStatus.待入库).subscribe({
        next: () => this.loadOrder(this.order()!.id),
        error: (err) => console.error('更新工单状态失败', err),
      });
    }
  }

  completeOrder(): void {
    if (this.order() && confirm(`确定要完成工单 ${this.order()!.orderNo} 吗？`)) {
      this.productionService.updateOrderStatus(this.order()!.id, ProductionOrderStatus.已完成).subscribe({
        next: () => this.loadOrder(this.order()!.id),
        error: (err) => console.error('完成工单失败', err),
      });
    }
  }

  getCompletionRate(): string {
    const o = this.order();
    if (!o || o.plannedQuantity === 0) return '0%';
    return `${((o.actualQuantity / o.plannedQuantity) * 100).toFixed(0)}%`;
  }

  getItemCompletionRate(item: { plannedQuantity: number; actualQuantity: number }): string {
    if (item.plannedQuantity === 0) return '0%';
    return `${((item.actualQuantity / item.plannedQuantity) * 100).toFixed(0)}%`;
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
}
