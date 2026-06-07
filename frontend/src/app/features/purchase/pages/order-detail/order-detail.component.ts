import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PurchaseService } from '../../services/purchase.service';
import { PurchaseOrder, PurchaseOrderStatus, GoodsReceipt, ReceiptStatus } from '../../models/purchase.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">采购订单详情</h1>
        <div class="flex gap-3">
          <button
            (click)="goBack()"
            class="btn-secondary"
          >
            返回
          </button>
          @if (order() && order()!.status === statusDraft) {
            <button
              (click)="editOrder()"
              class="btn-primary"
            >
              编辑
            </button>
          }
          @if (order() && (order()!.status === statusConfirmed || order()!.status === statusPartialReceived)) {
            <button
              (click)="createReceipt()"
              class="btn-primary"
            >
              创建入库单
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="card p-8 text-center">
          <span class="text-gray-500">加载中...</span>
        </div>
      } @else if (order()) {
        <!-- 基本信息 -->
        <div class="card mb-4">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-800">订单信息</h2>
              <p class="text-sm text-gray-500 mt-1">订单号: {{ order()!.orderNo }}</p>
            </div>
            <span [class]="getStatusClass(order()!.status)">
              {{ getStatusText(order()!.status) }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">供应商</label>
              <p class="text-gray-800">{{ order()!.supplierName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">订单日期</label>
              <p class="text-gray-800">{{ order()!.orderDate | date: 'yyyy-MM-dd' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">预计交货日期</label>
              <p class="text-gray-800">{{ order()!.expectedDeliveryDate | date: 'yyyy-MM-dd' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">订单金额</label>
              <p class="text-gray-800 font-semibold">¥{{ order()!.totalAmount | number: '1.2-2' }}</p>
            </div>
          </div>

          @if (order()!.notes) {
            <div class="mt-4 pt-4 border-t">
              <label class="block text-sm font-medium text-gray-500 mb-1">备注</label>
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
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">#</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">产品名称</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">颜色</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">数量</th>
                  <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">单位</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">单价</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">金额</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">已入库数量</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (item of order()!.items; track item.id; let i = $index) {
                  <tr>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ i + 1 }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800">{{ item.productName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">
                      @if (item.colorName) {
                        {{ item.colorName }} ({{ item.colorCode }})
                      } @else {
                        -
                      }
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-800 text-right">{{ item.quantity | number: '1.2-2' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ item.unit }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 text-right">¥{{ item.unitPrice | number: '1.2-2' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 font-medium text-right">¥{{ item.amount | number: '1.2-2' }}</td>
                    <td class="px-4 py-3 text-sm text-right">
                      <span [class]="item.receivedQuantity >= item.quantity ? 'text-green-600' : 'text-yellow-600'">
                        {{ item.receivedQuantity | number: '1.2-2' }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
              <tfoot class="bg-gray-50">
                <tr>
                  <td colspan="6" class="px-4 py-3 text-right font-medium text-gray-700">合计</td>
                  <td class="px-4 py-3 text-right font-bold text-gray-800">¥{{ order()!.totalAmount | number: '1.2-2' }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- 入库记录 -->
        @if (receipts().length > 0) {
          <div class="card">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">入库记录</h2>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">入库单号</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">入库日期</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">仓库</th>
                    <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">状态</th>
                    <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  @for (receipt of receipts(); track receipt.id) {
                    <tr>
                      <td class="px-4 py-3 text-sm text-primary-600 cursor-pointer" (click)="viewReceipt(receipt.id)">
                        {{ receipt.receiptNo }}
                      </td>
                      <td class="px-4 py-3 text-sm text-gray-600">{{ receipt.receiptDate | date: 'yyyy-MM-dd' }}</td>
                      <td class="px-4 py-3 text-sm text-gray-800">{{ receipt.warehouseName }}</td>
                      <td class="px-4 py-3 text-center">
                        <span [class]="getReceiptStatusClass(receipt.status)">
                          {{ getReceiptStatusText(receipt.status) }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-center">
                        <button
                          (click)="viewReceipt(receipt.id)"
                          class="text-primary-600 hover:text-primary-800 text-sm"
                        >
                          查看
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- 操作按钮组 -->
        @if (order()!.status === statusDraft) {
          <div class="flex justify-end gap-3 mt-4">
            <button
              (click)="confirmOrder()"
              class="btn-primary"
            >
              确认订单
            </button>
            <button
              (click)="deleteOrder()"
              class="btn-danger"
            >
              删除订单
            </button>
          </div>
        }

        @if (order()!.status === statusPartialReceived) {
          <div class="flex justify-end gap-3 mt-4">
            <button
              (click)="completeOrder()"
              class="btn-primary"
            >
              完成订单
            </button>
            <button
              (click)="cancelOrder()"
              class="btn-secondary"
            >
              取消订单
            </button>
          </div>
        }

        @if (order()!.status === statusConfirmed) {
          <div class="flex justify-end gap-3 mt-4">
            <button
              (click)="createReceipt()"
              class="btn-primary"
            >
              创建入库单
            </button>
            <button
              (click)="cancelOrder()"
              class="btn-secondary"
            >
              取消订单
            </button>
          </div>
        }
      } @else {
        <div class="card p-8 text-center">
          <span class="text-gray-500">未找到订单信息</span>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent implements OnInit {
  private readonly purchaseService = inject(PurchaseService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // 状态常量，用于模板中引用
  readonly statusDraft = PurchaseOrderStatus.草稿;
  readonly statusConfirmed = PurchaseOrderStatus.已确认;
  readonly statusPartialReceived = PurchaseOrderStatus.部分入库;
  readonly statusCompleted = PurchaseOrderStatus.已完成;
  readonly statusCancelled = PurchaseOrderStatus.已取消;

  loading = signal(true);
  order = signal<PurchaseOrder | null>(null);
  receipts = signal<GoodsReceipt[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(id);
    } else {
      this.loading.set(false);
    }
  }

  loadOrder(id: string): void {
    this.loading.set(true);
    this.purchaseService.getOrder(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loadReceipts(id);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('加载订单失败', err);
      },
    });
  }

  loadReceipts(orderId: string): void {
    this.purchaseService.getReceipts({
      page: 1,
      pageSize: 100,
      orderId,
    }).subscribe({
      next: (result) => {
        this.receipts.set(result.items);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('加载入库记录失败', err);
      },
    });
  }

  editOrder(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate(['/purchase/orders', id, 'edit']);
    }
  }

  viewReceipt(id: string): void {
    this.router.navigate(['/purchase/receipts', id]);
  }

  createReceipt(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate(['/purchase/receipts/new'], { queryParams: { orderId: id } });
    }
  }

  confirmOrder(): void {
    const order = this.order();
    if (!order) return;

    if (confirm(`确定要确认订单 ${order.orderNo} 吗？`)) {
      this.purchaseService.updateOrderStatus(order.id, PurchaseOrderStatus.已确认).subscribe({
        next: (updated) => {
          this.order.set(updated);
        },
        error: (err) => {
          console.error('确认订单失败', err);
        },
      });
    }
  }

  completeOrder(): void {
    const order = this.order();
    if (!order) return;

    if (confirm(`确定要完成订单 ${order.orderNo} 吗？`)) {
      this.purchaseService.updateOrderStatus(order.id, PurchaseOrderStatus.已完成).subscribe({
        next: (updated) => {
          this.order.set(updated);
        },
        error: (err) => {
          console.error('完成订单失败', err);
        },
      });
    }
  }

  cancelOrder(): void {
    const order = this.order();
    if (!order) return;

    if (confirm(`确定要取消订单 ${order.orderNo} 吗？`)) {
      this.purchaseService.updateOrderStatus(order.id, PurchaseOrderStatus.已取消).subscribe({
        next: (updated) => {
          this.order.set(updated);
        },
        error: (err) => {
          console.error('取消订单失败', err);
        },
      });
    }
  }

  deleteOrder(): void {
    const order = this.order();
    if (!order) return;

    if (confirm(`确定要删除订单 ${order.orderNo} 吗？`)) {
      this.purchaseService.deleteOrder(order.id).subscribe({
        next: () => {
          this.router.navigate(['/purchase']);
        },
        error: (err) => {
          console.error('删除订单失败', err);
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/purchase']);
  }

  getStatusClass(status: PurchaseOrderStatus): string {
    const classes: Record<string, string> = {
      [PurchaseOrderStatus.草稿]: 'px-3 py-1 text-sm rounded bg-gray-100 text-gray-600',
      [PurchaseOrderStatus.已确认]: 'px-3 py-1 text-sm rounded bg-blue-100 text-blue-700',
      [PurchaseOrderStatus.部分入库]: 'px-3 py-1 text-sm rounded bg-yellow-100 text-yellow-700',
      [PurchaseOrderStatus.已完成]: 'px-3 py-1 text-sm rounded bg-green-100 text-green-700',
      [PurchaseOrderStatus.已取消]: 'px-3 py-1 text-sm rounded bg-red-100 text-red-700',
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

  getReceiptStatusClass(status: ReceiptStatus): string {
    const classes: Record<string, string> = {
      [ReceiptStatus.待入库]: 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-600',
      [ReceiptStatus.部分入库]: 'px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700',
      [ReceiptStatus.已入库]: 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
    };
    return classes[status] || '';
  }

  getReceiptStatusText(status: ReceiptStatus): string {
    const texts: Record<string, string> = {
      [ReceiptStatus.待入库]: '待入库',
      [ReceiptStatus.部分入库]: '部分入库',
      [ReceiptStatus.已入库]: '已入库',
    };
    return texts[status] || status;
  }
}
