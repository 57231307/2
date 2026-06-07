import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SaleService } from '../../services/sale.service';
import { DeliveryNote, DeliveryStatus } from '../../models/sale.model';

@Component({
  selector: 'app-delivery-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      @if (delivery()) {
        <!-- 页面标题 -->
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">发货单详情</h1>
          <div class="flex gap-2">
            <button (click)="goBack()" class="btn-secondary">返回</button>
            <button (click)="printDelivery()" class="btn-primary">打印</button>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="card mb-4">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-800">基本信息</h2>
              <p class="text-sm text-gray-500 mt-1">发货单号：{{ delivery()!.deliveryNo }}</p>
            </div>
            <span [class]="getStatusClass(delivery()!.status)">
              {{ getStatusText(delivery()!.status) }}
            </span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-gray-500">关联订单</p>
              <p class="text-primary-600 font-medium cursor-pointer" (click)="viewOrder()">
                {{ delivery()!.orderNo }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500">发货日期</p>
              <p class="text-gray-800">{{ delivery()!.deliveryDate | date: 'yyyy-MM-dd' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">发货状态</p>
              <p class="text-gray-800">{{ getStatusText(delivery()!.status) }}</p>
            </div>
          </div>
        </div>

        <!-- 发货明细 -->
        <div class="card mb-4">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">发货明细</h2>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">颜色编号</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">颜色名称</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">缸号</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">匹号</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">发货数量</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (item of delivery()!.items; track item.id) {
                  <tr>
                    <td class="px-4 py-3 text-sm text-gray-800">{{ item.colorCode }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ item.colorName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800">{{ item.dyeLotNo }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800">{{ item.pieceNo }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 text-right font-medium">
                      {{ item.deliveryQuantity }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- 操作按钮 -->
        @if (delivery()!.status === DeliveryStatus.待发货) {
          <div class="flex justify-center gap-4">
            <button (click)="confirmDelivery()" class="btn-primary px-8">
              确认发货
            </button>
          </div>
        }
      } @else {
        <div class="text-center py-8 text-gray-500">
          加载中...
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryDetailComponent {
  private readonly saleService = inject(SaleService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly DeliveryStatus = DeliveryStatus;

  delivery = signal<DeliveryNote | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDelivery(id);
    }
  }

  loadDelivery(id: string): void {
    this.saleService.getDeliveryNote(id).subscribe({
      next: (delivery) => {
        this.delivery.set(delivery);
      },
      error: (err) => {
        console.error('加载发货单详情失败', err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/sales/delivery']);
  }

  viewOrder(): void {
    const orderId = this.delivery()?.orderId;
    if (orderId) {
      this.router.navigate(['/sales/orders', orderId]);
    }
  }

  confirmDelivery(): void {
    if (confirm('确定要确认此发货单吗？')) {
      this.saleService.confirmDelivery(this.delivery()!.id).subscribe({
        next: (delivery) => {
          this.delivery.set(delivery);
        },
        error: (err) => {
          console.error('确认发货失败', err);
        },
      });
    }
  }

  printDelivery(): void {
    window.print();
  }

  getStatusClass(status: DeliveryStatus): string {
    const classes: Record<DeliveryStatus, string> = {
      [DeliveryStatus.待发货]: 'px-3 py-1 text-sm rounded bg-gray-100 text-gray-600',
      [DeliveryStatus.部分发货]: 'px-3 py-1 text-sm rounded bg-yellow-100 text-yellow-700',
      [DeliveryStatus.已发货]: 'px-3 py-1 text-sm rounded bg-green-100 text-green-700',
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
