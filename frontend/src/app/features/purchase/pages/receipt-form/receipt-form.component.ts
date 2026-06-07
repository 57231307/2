import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PurchaseService } from '../../services/purchase.service';
import {
  PurchaseOrder,
  GoodsReceipt,
  GoodsReceiptItem,
  ReceiptStatus,
  Warehouse,
} from '../../models/purchase.model';

@Component({
  selector: 'app-receipt-form',
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">新建入库单</h1>
        <button
          (click)="goBack()"
          class="btn-secondary"
        >
          返回
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- 基本信息 -->
        <div class="card mb-4">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">关联采购订单 <span class="text-red-500">*</span></label>
              <select
                formControlName="orderId"
                (change)="onOrderChange()"
                class="input-field w-full"
              >
                <option value="">请选择采购订单</option>
                @for (order of orders(); track order.id) {
                  <option [value]="order.id">{{ order.orderNo }} - {{ order.supplierName }}</option>
                }
              </select>
              @if (form.get('orderId')?.invalid && form.get('orderId')?.touched) {
                <span class="text-red-500 text-sm">请选择采购订单</span>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">入库日期 <span class="text-red-500">*</span></label>
              <input
                type="date"
                formControlName="receiptDate"
                class="input-field w-full"
              />
              @if (form.get('receiptDate')?.invalid && form.get('receiptDate')?.touched) {
                <span class="text-red-500 text-sm">请选择入库日期</span>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">仓库 <span class="text-red-500">*</span></label>
              <select
                formControlName="warehouseId"
                class="input-field w-full"
              >
                <option value="">请选择仓库</option>
                @for (warehouse of warehouses(); track warehouse.id) {
                  <option [value]="warehouse.id">{{ warehouse.warehouseName }}</option>
                }
              </select>
              @if (form.get('warehouseId')?.invalid && form.get('warehouseId')?.touched) {
                <span class="text-red-500 text-sm">请选择仓库</span>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <input
                type="text"
                formControlName="notes"
                placeholder="可选"
                class="input-field w-full"
              />
            </div>
          </div>
        </div>

        <!-- 入库明细 -->
        <div class="card mb-4">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">入库明细</h2>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600 w-12">#</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">产品</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">颜色</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">订单数量</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">已入库数量</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">本次入库数量</th>
                  <th class="px-4 py-3 text-center text-sm font-medium text-gray-600 w-24">单位</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600 w-32">缸号</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600 w-32">匹号</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (item of items(); track item.orderItemId; let i = $index) {
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
                    <td class="px-4 py-3 text-sm text-gray-800 text-right">{{ item.receiptQuantity | number: '1.2-2' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 text-right">{{ item.receiptQuantity | number: '1.2-2' }}</td>
                    <td class="px-4 py-3">
                      <input
                        type="number"
                        [value]="item.receiptQuantity"
                        (input)="onQuantityChange(i, $event)"
                        min="0"
                        [max]="getMaxQuantity(item)"
                        step="0.01"
                        class="input-field w-full text-sm text-right"
                      />
                    </td>
                    <td class="px-4 py-3 text-center text-sm text-gray-600">{{ item.unit }}</td>
                    <td class="px-4 py-3">
                      <input
                        type="text"
                        [value]="item.dyeLotNo || ''"
                        (input)="onDyeLotChange(i, $event)"
                        placeholder="缸号"
                        class="input-field w-full text-sm"
                      />
                    </td>
                    <td class="px-4 py-3">
                      <input
                        type="text"
                        [value]="item.pieceNo || ''"
                        (input)="onPieceChange(i, $event)"
                        placeholder="匹号"
                        class="input-field w-full text-sm"
                      />
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                      请先选择关联的采购订单
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end gap-3">
          <button
            type="button"
            (click)="goBack()"
            class="btn-secondary"
          >
            取消
          </button>
          <button
            type="submit"
            [disabled]="form.invalid || items().length === 0 || submitting()"
            class="btn-primary disabled:opacity-50"
          >
            {{ submitting() ? '保存中...' : '保存' }}
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptFormComponent implements OnInit {
  private readonly purchaseService = inject(PurchaseService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  submitting = signal(false);

  orders = signal<PurchaseOrder[]>([]);
  warehouses = signal<Warehouse[]>([]);
  selectedOrder = signal<PurchaseOrder | null>(null);
  items = signal<GoodsReceiptItem[]>([]);

  form = new FormGroup({
    orderId: new FormControl(''),
    receiptDate: new FormControl(''),
    warehouseId: new FormControl(''),
    notes: new FormControl(''),
  });

  ngOnInit(): void {
    this.loadOrders();
    this.loadWarehouses();
    this.setDefaultDate();

    const orderId = this.route.snapshot.queryParamMap.get('orderId');
    if (orderId) {
      this.form.patchValue({ orderId });
      this.loadOrderItems(orderId);
    }
  }

  setDefaultDate(): void {
    const today = new Date().toISOString().split('T')[0];
    this.form.patchValue({ receiptDate: today });
  }

  loadOrders(): void {
    this.purchaseService.getOrders({ page: 1, pageSize: 100 }).subscribe({
      next: (result) => {
        const validOrders = result.items.filter(
          o => o.status === 'confirmed' || o.status === 'partial_received'
        );
        this.orders.set(validOrders);
      },
      error: (err) => {
        console.error('加载订单列表失败', err);
      },
    });
  }

  loadWarehouses(): void {
    this.purchaseService.getWarehouses().subscribe({
      next: (warehouses) => {
        this.warehouses.set(warehouses);
      },
      error: (err) => {
        console.error('加载仓库列表失败', err);
      },
    });
  }

  onOrderChange(): void {
    const orderId = this.form.get('orderId')?.value;
    if (orderId) {
      this.loadOrderItems(orderId);
    } else {
      this.items.set([]);
      this.selectedOrder.set(null);
    }
  }

  loadOrderItems(orderId: string): void {
    this.purchaseService.getOrder(orderId).subscribe({
      next: (order) => {
        this.selectedOrder.set(order);
        const items: GoodsReceiptItem[] = order.items.map(item => ({
          id: '',
          orderItemId: item.id,
          productId: item.productId,
          productName: item.productName,
          colorVariantId: item.colorVariantId,
          colorCode: item.colorCode,
          colorName: item.colorName,
          receiptQuantity: 0,
          unit: item.unit,
          dyeLotNo: '',
          pieceNo: '',
        }));
        this.items.set(items);
      },
      error: (err) => {
        console.error('加载订单详情失败', err);
      },
    });
  }

  getMaxQuantity(item: GoodsReceiptItem): number {
    const orderItem = this.selectedOrder()?.items.find(i => i.id === item.orderItemId);
    if (!orderItem) return 0;
    return orderItem.quantity - orderItem.receivedQuantity;
  }

  onQuantityChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const quantity = parseFloat(input.value) || 0;

    this.items.update(items => {
      const updated = [...items];
      updated[index] = { ...updated[index], receiptQuantity: quantity };
      return updated;
    });
  }

  onDyeLotChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const dyeLotNo = input.value;

    this.items.update(items => {
      const updated = [...items];
      updated[index] = { ...updated[index], dyeLotNo };
      return updated;
    });
  }

  onPieceChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const pieceNo = input.value;

    this.items.update(items => {
      const updated = [...items];
      updated[index] = { ...updated[index], pieceNo };
      return updated;
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.items().length === 0) {
      return;
    }

    const validItems = this.items().filter(item => item.receiptQuantity > 0);
    if (validItems.length === 0) {
      alert('请至少填写一项入库数量');
      return;
    }

    this.submitting.set(true);

    const formValue = this.form.value;
    const order = this.selectedOrder();
    const warehouse = this.warehouses().find(w => w.id === formValue.warehouseId);

    const receipt: Partial<GoodsReceipt> = {
      orderId: formValue.orderId!,
      orderNo: order?.orderNo || '',
      receiptDate: new Date(formValue.receiptDate!),
      warehouseId: formValue.warehouseId!,
      warehouseName: warehouse?.warehouseName || '',
      notes: formValue.notes || '',
      items: validItems,
      status: ReceiptStatus.待入库,
    };

    this.purchaseService.createReceipt(receipt).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/purchase/receipts']);
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('保存入库单失败', err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/purchase/receipts']);
  }
}
