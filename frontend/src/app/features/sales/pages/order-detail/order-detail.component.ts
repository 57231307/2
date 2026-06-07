import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SaleService } from '../../services/sale.service';
import { SaleOrder, OrderStatus } from '../../models/sale.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      @if (order()) {
        <!-- 页面标题 -->
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">订单详情</h1>
          <div class="flex gap-2">
            <button (click)="goBack()" class="btn-secondary">返回</button>
            @if (order()!.status === OrderStatus.草稿) {
              <button (click)="editOrder()" class="btn-primary">编辑</button>
              <button (click)="deleteOrder()" class="btn-danger">删除</button>
            }
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="card mb-4">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-800">基本信息</h2>
              <p class="text-sm text-gray-500 mt-1">订单号：{{ order()!.orderNo }}</p>
            </div>
            <span [class]="getStatusClass(order()!.status)">
              {{ getStatusText(order()!.status) }}
            </span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-gray-500">客户名称</p>
              <p class="text-gray-800 font-medium">{{ order()!.customerName }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">订单日期</p>
              <p class="text-gray-800">{{ order()!.orderDate | date: 'yyyy-MM-dd' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">交货日期</p>
              <p class="text-gray-800">{{ order()!.deliveryDate | date: 'yyyy-MM-dd' }}</p>
            </div>
          </div>
          @if (order()!.notes) {
            <div class="mt-4 pt-4 border-t">
              <p class="text-sm text-gray-500">备注</p>
              <p class="text-gray-800">{{ order()!.notes }}</p>
            </div>
          }
        </div>

        <!-- 订单明细 -->
        <div class="card mb-4">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">订单明细</h2>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">产品名称</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">颜色编号</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">颜色名称</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">数量</th>
                  <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">单位</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">单价</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">金额</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (item of order()!.items; track item.id) {
                  <tr>
                    <td class="px-4 py-3 text-sm text-gray-800">{{ item.productName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ item.colorCode }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ item.colorName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 text-right">{{ item.quantity }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ item.unit }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 text-right">¥{{ item.unitPrice | number: '1.2-2' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 text-right font-medium">¥{{ item.amount | number: '1.2-2' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- 金额汇总 -->
        <div class="card mb-4">
          <div class="flex justify-end">
            <div class="w-64">
              <div class="flex justify-between py-2">
                <span class="text-gray-600">订单总金额：</span>
                <span class="text-xl font-bold text-primary-600">
                  ¥{{ order()!.totalAmount | number: '1.2-2' }}
                </span>
              </div>
              <div class="flex justify-between py-2">
                <span class="text-gray-600">已付金额：</span>
                <span class="text-gray-800">
                  ¥{{ order()!.paidAmount | number: '1.2-2' }}
                </span>
              </div>
              <div class="flex justify-between py-2 border-t pt-2">
                <span class="text-gray-600">未付金额：</span>
                <span class="text-lg font-bold text-red-600">
                  ¥{{ order()!.totalAmount - order()!.paidAmount | number: '1.2-2' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-center gap-4">
          @if (order()!.status === OrderStatus.草稿) {
            <button (click)="confirmOrder()" class="btn-primary px-8">
              确认订单
            </button>
          }
          @if (order()!.status === OrderStatus.已确认) {
            <button (click)="shipOrder()" class="btn-primary px-8">
              创建发货单
            </button>
          }
          @if (order()!.status === OrderStatus.已发货) {
            <button (click)="completeOrder()" class="btn-primary px-8">
              完成订单
            </button>
          }
          @if (order()!.status === OrderStatus.草稿 || order()!.status === OrderStatus.已确认) {
            <button (click)="cancelOrder()" class="btn-danger px-8">
              取消订单
            </button>
          }
        </div>
      } @else {
        <div class="text-center py-8 text-gray-500">
          加载中...
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent {
  private readonly saleService = inject(SaleService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly OrderStatus = OrderStatus;

  order = signal<SaleOrder | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(id);
    }
  }

  loadOrder(id: string): void {
    this.saleService.getOrder(id).subscribe({
      next: (order) => {
        this.order.set(order);
      },
      error: (err) => {
        console.error('加载订单详情失败', err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/sales/orders']);
  }

  editOrder(): void {
    this.router.navigate(['/sales/orders', this.order()!.id, 'edit']);
  }

  deleteOrder(): void {
    if (confirm(`确定要删除订单 ${this.order()!.orderNo} 吗？`)) {
      this.saleService.deleteOrder(this.order()!.id).subscribe({
        next: () => {
          this.router.navigate(['/sales/orders']);
        },
        error: (err) => {
          console.error('删除订单失败', err);
        },
      });
    }
  }

  confirmOrder(): void {
    if (confirm('确定要确认此订单吗？')) {
      this.saleService.updateOrderStatus(this.order()!.id, OrderStatus.已确认).subscribe({
        next: (order) => {
          this.order.set(order);
        },
        error: (err) => {
          console.error('确认订单失败', err);
        },
      });
    }
  }

  shipOrder(): void {
    this.router.navigate(['/sales/delivery/new'], { queryParams: { orderId: this.order()!.id } });
  }

  completeOrder(): void {
    if (confirm('确定要完成此订单吗？')) {
      this.saleService.updateOrderStatus(this.order()!.id, OrderStatus.已完成).subscribe({
        next: (order) => {
          this.order.set(order);
        },
        error: (err) => {
          console.error('完成订单失败', err);
        },
      });
    }
  }

  cancelOrder(): void {
    if (confirm('确定要取消此订单吗？')) {
      this.saleService.updateOrderStatus(this.order()!.id, OrderStatus.已取消).subscribe({
        next: (order) => {
          this.order.set(order);
        },
        error: (err) => {
          console.error('取消订单失败', err);
        },
      });
    }
  }

  getStatusClass(status: OrderStatus): string {
    const classes: Record<OrderStatus, string> = {
      [OrderStatus.草稿]: 'px-3 py-1 text-sm rounded bg-gray-100 text-gray-600',
      [OrderStatus.已确认]: 'px-3 py-1 text-sm rounded bg-blue-100 text-blue-700',
      [OrderStatus.已发货]: 'px-3 py-1 text-sm rounded bg-yellow-100 text-yellow-700',
      [OrderStatus.已完成]: 'px-3 py-1 text-sm rounded bg-green-100 text-green-700',
      [OrderStatus.已取消]: 'px-3 py-1 text-sm rounded bg-red-100 text-red-700',
    };
    return classes[status] || '';
  }

  getStatusText(status: OrderStatus): string {
    const texts: Record<OrderStatus, string> = {
      [OrderStatus.草稿]: '草稿',
      [OrderStatus.已确认]: '已确认',
      [OrderStatus.已发货]: '已发货',
      [OrderStatus.已完成]: '已完成',
      [OrderStatus.已取消]: '已取消',
    };
    return texts[status] || status;
  }
}
