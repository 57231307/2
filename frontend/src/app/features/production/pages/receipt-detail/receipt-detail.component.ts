import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ProductionService } from '../../services/production.service';
import { ProductionReceipt, ProductionReceiptStatus } from '../../models/production.model';

@Component({
  selector: 'app-receipt-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      @if (receipt()) {
        <!-- 页面标题 -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-800">{{ receipt()!.receiptNo }}</h1>
              <span [class]="getStatusClass(receipt()!.status)">
                {{ getStatusText(receipt()!.status) }}
              </span>
            </div>
            <p class="text-sm text-gray-500 mt-1">入库单详情</p>
          </div>
          <div class="flex gap-2">
            <button (click)="goBack()" class="btn-secondary">
              返回列表
            </button>
            @if (receipt()!.status === 'pending') {
              <button (click)="editReceipt()" class="btn-primary">
                编辑入库单
              </button>
            }
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="card mb-4">
          <h3 class="text-lg font-medium text-gray-800 mb-4">基本信息</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p class="text-sm text-gray-500 mb-1">入库单号</p>
              <p class="text-gray-800 font-medium">{{ receipt()!.receiptNo }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">关联工单</p>
              <p class="text-primary-600 cursor-pointer hover:text-primary-800" (click)="viewOrder()">
                {{ receipt()!.productionOrderNo }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">入库日期</p>
              <p class="text-gray-800">{{ receipt()!.receiptDate | date: 'yyyy-MM-dd' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">仓库</p>
              <p class="text-gray-800">{{ receipt()!.warehouseName }}</p>
            </div>
          </div>
        </div>

        <!-- 入库明细 -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-800 mb-4">入库明细</h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">颜色</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">入库数量</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">缸号</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">匹号</th>
                  <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">单位</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (item of receipt()!.items; track item.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-800">
                      {{ item.dyeLotNo ? item.dyeLotNo + '-' : '' }}{{ item.pieceNo ? item.pieceNo + '-' : '' }}{{ item.colorVariantId || '-' }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-800 text-right font-medium">
                      {{ item.receiptQuantity | number }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ item.dyeLotNo || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ item.pieceNo || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ item.unit }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                      暂无入库明细
                    </td>
                  </tr>
                }
              </tbody>
              @if (receipt()!.items.length > 0) {
                <tfoot class="bg-gray-50">
                  <tr>
                    <td class="px-4 py-3 text-sm font-medium text-gray-800">合计</td>
                    <td class="px-4 py-3 text-sm font-medium text-gray-800 text-right">
                      {{ getTotalQuantity() | number }}
                    </td>
                    <td colspan="3"></td>
                  </tr>
                </tfoot>
              }
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
export class ReceiptDetailComponent implements OnInit {
  private readonly productionService = inject(ProductionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly ProductionReceiptStatus = ProductionReceiptStatus;

  receipt = signal<ProductionReceipt | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReceipt(id);
    }
  }

  loadReceipt(id: string): void {
    this.productionService.getReceipt(id).subscribe({
      next: (receipt) => this.receipt.set(receipt),
      error: (err) => {
        console.error('加载入库单详情失败', err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/production/receipts']);
  }

  editReceipt(): void {
    if (this.receipt()) {
      this.router.navigate(['/production/receipts', this.receipt()!.id, 'edit']);
    }
  }

  viewOrder(): void {
    if (this.receipt()) {
      this.router.navigate(['/production/orders', this.receipt()!.productionOrderId]);
    }
  }

  getTotalQuantity(): number {
    const r = this.receipt();
    if (!r) return 0;
    return r.items.reduce((sum, item) => sum + item.receiptQuantity, 0);
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
