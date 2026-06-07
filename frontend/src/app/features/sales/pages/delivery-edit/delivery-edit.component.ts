import { Component, inject, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SaleService } from '../../services/sale.service';
import { DeliveryNote, DeliveryNoteItem, SaleOrder, ColorVariant, Batch } from '../../models/sale.model';

@Component({
  selector: 'app-delivery-edit',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">创建发货单</h1>
        <button (click)="goBack()" class="btn-secondary">返回</button>
      </div>

      <form [formGroup]="deliveryForm" (ngSubmit)="onSubmit()">
        <!-- 基本信息 -->
        <div class="card mb-4">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">关联订单 <span class="text-red-500">*</span></label>
              <select
                formControlName="orderId"
                (change)="onOrderChange()"
                class="input-field w-full"
              >
                <option value="">请选择订单</option>
                @for (order of orders(); track order.id) {
                  <option [value]="order.id">
                    {{ order.orderNo }} - {{ order.customerName }}
                  </option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">发货日期 <span class="text-red-500">*</span></label>
              <input
                type="date"
                formControlName="deliveryDate"
                class="input-field w-full"
              />
            </div>
          </div>
        </div>

        <!-- 发货明细 -->
        <div class="card mb-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-800">发货明细</h2>
            <button
              type="button"
              (click)="addItem()"
              class="btn-primary text-sm"
              [disabled]="!selectedOrder()"
            >
              添加发货项
            </button>
          </div>

          @if (!selectedOrder()) {
            <div class="text-center py-8 text-gray-500">
              请先选择关联订单
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-left text-sm font-medium text-gray-600">颜色编号</th>
                    <th class="px-3 py-2 text-left text-sm font-medium text-gray-600">颜色名称</th>
                    <th class="px-3 py-2 text-left text-sm font-medium text-gray-600">批次（缸号/匹号）</th>
                    <th class="px-3 py-2 text-left text-sm font-medium text-gray-600">发货数量</th>
                    <th class="px-3 py-2 text-left text-sm font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody formArrayName="items">
                  @for (item of items.controls; track item; let i = $index) {
                    <tr [formGroupName]="i" class="border-b">
                      <td class="px-3 py-2">
                        <select
                          formControlName="colorVariantId"
                          (change)="onColorVariantChange(i)"
                          class="input-field w-full text-sm"
                        >
                          <option value="">选择颜色</option>
                          @for (variant of orderColorVariants(); track variant.id) {
                            <option [value]="variant.id">
                              {{ variant.colorCode }} - {{ variant.colorName }}
                            </option>
                          }
                        </select>
                      </td>
                      <td class="px-3 py-2 text-sm text-gray-600">
                        {{ item.get('colorName')?.value }}
                      </td>
                      <td class="px-3 py-2">
                        <select
                          formControlName="batchId"
                          (change)="onBatchChange(i)"
                          class="input-field w-full text-sm"
                        >
                          <option value="">选择批次</option>
                          @for (batch of batches(); track batch.id) {
                            <option [value]="batch.id">
                              {{ batch.dyeLotNo }} / {{ batch.pieceNo }} (可发: {{ batch.availableQuantity }})
                            </option>
                          }
                        </select>
                      </td>
                      <td class="px-3 py-2">
                        <input
                          type="number"
                          formControlName="deliveryQuantity"
                          min="1"
                          class="input-field w-24 text-sm"
                        />
                      </td>
                      <td class="px-3 py-2">
                        <button
                          type="button"
                          (click)="removeItem(i)"
                          class="text-red-600 hover:text-red-800 text-sm"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            @if (items.length === 0) {
              <div class="text-center py-8 text-gray-500">
                请添加发货明细
              </div>
            }
          }
        </div>

        <!-- 提交按钮 -->
        <div class="flex justify-end gap-4">
          <button type="button" (click)="goBack()" class="btn-secondary">
            取消
          </button>
          <button
            type="submit"
            [disabled]="deliveryForm.invalid || items.length === 0"
            class="btn-primary disabled:opacity-50"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryEditComponent {
  private readonly saleService = inject(SaleService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  orders = signal<SaleOrder[]>([]);
  selectedOrder = signal<SaleOrder | null>(null);
  orderColorVariants = signal<ColorVariant[]>([]);
  batches = signal<Batch[]>([]);

  deliveryForm = new FormGroup({
    orderId: new FormControl('', Validators.required),
    orderNo: new FormControl(''),
    deliveryDate: new FormControl(this.formatDate(new Date()), Validators.required),
    items: new FormArray([]),
  });

  get items(): FormArray {
    return this.deliveryForm.get('items') as FormArray;
  }

  constructor() {
    effect(() => {
      this.loadOrders();

      const orderId = this.route.snapshot.queryParamMap.get('orderId');
      if (orderId) {
        this.deliveryForm.patchValue({ orderId });
        this.onOrderChange();
      }
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  loadOrders(): void {
    this.saleService.getOrders({ page: 1, pageSize: 100, status: 'confirmed' } as any).subscribe({
      next: (result) => {
        this.orders.set(result.items);
      },
    });
  }

  onOrderChange(): void {
    const orderId = this.deliveryForm.get('orderId')?.value;
    if (orderId) {
      const order = this.orders().find((o) => o.id === orderId);
      if (order) {
        this.selectedOrder.set(order);
        this.deliveryForm.patchValue({ orderNo: order.orderNo });

        // 提取订单中的颜色变体
        const variants = order.items.map((item) => ({
          id: item.colorVariantId,
          colorCode: item.colorCode,
          colorName: item.colorName,
          unitPrice: item.unitPrice,
          costPrice: 0,
          productId: item.productId,
          productName: item.productName,
        }));
        this.orderColorVariants.set(variants);
      }
    } else {
      this.selectedOrder.set(null);
      this.orderColorVariants.set([]);
    }
  }

  onColorVariantChange(index: number): void {
    const colorVariantId = this.items.at(index).get('colorVariantId')?.value;
    if (colorVariantId) {
      const variant = this.orderColorVariants().find((v) => v.id === colorVariantId);
      if (variant) {
        this.items.at(index).patchValue({
          colorCode: variant.colorCode,
          colorName: variant.colorName,
        });

        // 加载批次
        this.saleService.getBatches(colorVariantId).subscribe({
          next: (batches) => {
            this.batches.set(batches);
          },
        });
      }
    }
  }

  onBatchChange(index: number): void {
    const batchId = this.items.at(index).get('batchId')?.value;
    if (batchId) {
      const batch = this.batches().find((b) => b.id === batchId);
      if (batch) {
        this.items.at(index).patchValue({
          dyeLotNo: batch.dyeLotNo,
          pieceNo: batch.pieceNo,
        });
      }
    }
  }

  addItem(): void {
    const itemGroup = new FormGroup({
      colorVariantId: new FormControl('', Validators.required),
      colorCode: new FormControl(''),
      colorName: new FormControl(''),
      batchId: new FormControl('', Validators.required),
      dyeLotNo: new FormControl(''),
      pieceNo: new FormControl(''),
      deliveryQuantity: new FormControl(1, [Validators.required, Validators.min(1)]),
    });
    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  onSubmit(): void {
    if (this.deliveryForm.invalid) {
      return;
    }

    const formValue = this.deliveryForm.value;

    const delivery: Partial<DeliveryNote> = {
      orderId: formValue.orderId!,
      orderNo: formValue.orderNo!,
      deliveryDate: new Date(formValue.deliveryDate!),
      items: this.items.controls.map((item, index) => ({
        id: '',
        colorVariantId: item.get('colorVariantId')?.value || '',
        colorCode: item.get('colorCode')?.value || '',
        colorName: item.get('colorName')?.value || '',
        batchId: item.get('batchId')?.value || '',
        dyeLotNo: item.get('dyeLotNo')?.value || '',
        pieceNo: item.get('pieceNo')?.value || '',
        deliveryQuantity: item.get('deliveryQuantity')?.value || 0,
      })),
    };

    this.saleService.createDeliveryNote(delivery).subscribe({
      next: () => {
        this.router.navigate(['/sales/delivery']);
      },
      error: (err) => {
        console.error('创建发货单失败', err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/sales/delivery']);
  }
}
