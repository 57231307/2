import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SaleService } from '../../services/sale.service';
import { SaleReturn, ReturnStatus } from '../../models/sale.model';

@Component({
  selector: 'app-return-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      @if (returnOrder()) {
        <!-- 页面标题 -->
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">退货单详情</h1>
          <button (click)="goBack()" class="btn-secondary">返回</button>
        </div>

        <!-- 基本信息 -->
        <div class="card mb-4">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-800">基本信息</h2>
              <p class="text-sm text-gray-500 mt-1">退货单号：{{ returnOrder()!.returnNo }}</p>
            </div>
            <span [class]="getStatusClass(returnOrder()!.status)">
              {{ getStatusText(returnOrder()!.status) }}
            </span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-gray-500">原发货单号</p>
              <p class="text-primary-600 font-medium cursor-pointer" (click)="viewDeliveryNote()">
                {{ returnOrder()!.deliveryNoteNo }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500">关联订单</p>
              <p class="text-gray-800">{{ returnOrder()!.orderNo }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">退货日期</p>
              <p class="text-gray-800">{{ returnOrder()!.returnDate | date: 'yyyy-MM-dd' }}</p>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t">
            <p class="text-sm text-gray-500">退货原因</p>
            <p class="text-gray-800">{{ returnOrder()!.reason }}</p>
          </div>
          @if (returnOrder()!.notes) {
            <div class="mt-4 pt-4 border-t">
              <p class="text-sm text-gray-500">备注</p>
              <p class="text-gray-800">{{ returnOrder()!.notes }}</p>
            </div>
          }
        </div>

        <!-- 退货明细 -->
        <div class="card mb-4">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">退货明细</h2>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">颜色编号</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">颜色名称</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">退货数量</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (item of returnOrder()!.items; track item.id) {
                  <tr>
                    <td class="px-4 py-3 text-sm text-gray-800">{{ item.colorCode }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ item.colorName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 text-right font-medium">
                      {{ item.returnQuantity }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- 操作按钮 -->
        @if (returnOrder()!.status === ReturnStatus.待处理) {
          <div class="flex justify-center gap-4">
            <button (click)="confirmReturn()" class="btn-primary px-8">
              确认退货
            </button>
            <button (click)="rejectReturn()" class="btn-danger px-8">
              拒绝退货
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
export class ReturnDetailComponent {
  private readonly saleService = inject(SaleService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly ReturnStatus = ReturnStatus;

  returnOrder = signal<SaleReturn | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReturn(id);
    }
  }

  loadReturn(id: string): void {
    this.saleService.getReturn(id).subscribe({
      next: (returnOrder) => {
        this.returnOrder.set(returnOrder);
      },
      error: (err) => {
        console.error('加载退货单详情失败', err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/sales/returns']);
  }

  viewDeliveryNote(): void {
    const deliveryNoteId = this.returnOrder()?.deliveryNoteId;
    if (deliveryNoteId) {
      this.router.navigate(['/sales/delivery', deliveryNoteId]);
    }
  }

  confirmReturn(): void {
    if (confirm('确定要确认此退货单吗？')) {
      this.saleService.updateReturn(this.returnOrder()!.id, { status: ReturnStatus.已确认 } as any).subscribe({
        next: (returnOrder) => {
          this.returnOrder.set(returnOrder);
        },
        error: (err) => {
          console.error('确认退货失败', err);
        },
      });
    }
  }

  rejectReturn(): void {
    if (confirm('确定要拒绝此退货单吗？')) {
      this.saleService.updateReturn(this.returnOrder()!.id, { status: ReturnStatus.已拒绝 } as any).subscribe({
        next: (returnOrder) => {
          this.returnOrder.set(returnOrder);
        },
        error: (err) => {
          console.error('拒绝退货失败', err);
        },
      });
    }
  }

  getStatusClass(status: ReturnStatus): string {
    const classes: Record<ReturnStatus, string> = {
      [ReturnStatus.待处理]: 'px-3 py-1 text-sm rounded bg-gray-100 text-gray-600',
      [ReturnStatus.已确认]: 'px-3 py-1 text-sm rounded bg-green-100 text-green-700',
      [ReturnStatus.已拒绝]: 'px-3 py-1 text-sm rounded bg-red-100 text-red-700',
    };
    return classes[status] || '';
  }

  getStatusText(status: ReturnStatus): string {
    const texts: Record<ReturnStatus, string> = {
      [ReturnStatus.待处理]: '待处理',
      [ReturnStatus.已确认]: '已确认',
      [ReturnStatus.已拒绝]: '已拒绝',
    };
    return texts[status] || status;
  }
}
