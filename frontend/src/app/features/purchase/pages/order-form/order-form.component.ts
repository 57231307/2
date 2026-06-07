import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PurchaseService } from '../../services/purchase.service';
import { PurchaseOrderStatus } from '../../models/purchase.model';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">
          {{ isEdit() ? '编辑采购订单' : '新建采购订单' }}
        </h1>
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
              <label class="block text-sm font-medium text-gray-700 mb-1">供应商 <span class="text-red-500">*</span></label>
              <select
                formControlName="supplierId"
                class="input-field w-full"
              >
                <option value="">请选择供应商</option>
                @for (supplier of suppliers(); track supplier.id) {
                  <option [value]="supplier.id">{{ supplier.name }}</option>
                }
              </select>
              @if (form.get('supplierId')?.invalid && form.get('supplierId')?.touched) {
                <span class="text-red-500 text-sm">请选择供应商</span>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">订单日期 <span class="text-red-500">*</span></label>
              <input
                type="date"
                formControlName="orderDate"
                class="input-field w-full"
              />
              @if (form.get('orderDate')?.invalid && form.get('orderDate')?.touched) {
                <span class="text-red-500 text-sm">请选择订单日期</span>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">预计交货日期 <span class="text-red-500">*</span></label>
              <input
                type="date"
                formControlName="expectedDeliveryDate"
                class="input-field w-full"
              />
              @if (form.get('expectedDeliveryDate')?.invalid && form.get('expectedDeliveryDate')?.touched) {
                <span class="text-red-500 text-sm">请选择预计交货日期</span>
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

        <!-- 订单明细 -->
        <div class="card mb-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-800">订单明细</h2>
            <button
              type="button"
              (click)="addItem()"
              class="btn-secondary text-sm"
            >
              添加明细
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600 w-12">#</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600 min-w-48">产品</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600 min-w-32">颜色</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600 w-32">数量</th>
                  <th class="px-4 py-3 text-center text-sm font-medium text-gray-600 w-24">单位</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600 w-32">单价</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600 w-32">金额</th>
                  <th class="px-4 py-3 text-center text-sm font-medium text-gray-600 w-20">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (item of items(); track item.id; let i = $index) {
                  <tr>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ i + 1 }}</td>
                    <td class="px-4 py-3">
                      <select
                        [value]="item.productId"
                        (change)="onProductChange(i, $event)"
                        class="input-field w-full text-sm"
                      >
                        <option value="">请选择产品</option>
                        @for (product of products(); track product.id) {
                          <option [value]="product.id">{{ product.productName }}</option>
                        }
                      </select>
                    </td>
                    <td class="px-4 py-3">
                      <select
                        [value]="item.colorVariantId || ''"
                        (change)="onColorChange(i, $event)"
                        class="input-field w-full text-sm"
                      >
                        <option value="">请选择颜色</option>
                        @for (variant of getColorVariants(item.productId); track variant.id) {
                          <option [value]="variant.id">{{ variant.colorName }} ({{ variant.colorCode }})</option>
                        }
                      </select>
                    </td>
                    <td class="px-4 py-3">
                      <input
                        type="number"
                        [value]="item.quantity"
                        (input)="onQuantityChange(i, $event)"
                        min="0"
                        step="0.01"
                        class="input-field w-full text-sm text-right"
                      />
                    </td>
                    <td class="px-4 py-3 text-center">
                      <input
                        type="text"
                        [value]="item.unit"
                        (input)="onUnitChange(i, $event)"
                        placeholder="米/码/件"
                        class="input-field w-full text-sm text-center"
                      />
                    </td>
                    <td class="px-4 py-3">
                      <input
                        type="number"
                        [value]="item.unitPrice"
                        (input)="onUnitPriceChange(i, $event)"
                        min="0"
                        step="0.01"
                        class="input-field w-full text-sm text-right"
                      />
                    </td>
                    <td class="px-4 py-3 text-right font-medium text-gray-800">
                      ¥{{ item.amount | number: '1.2-2' }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <button
                        type="button"
                        (click)="removeItem(i)"
                        class="text-red-600 hover:text-red-800 text-sm"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                      请点击"添加明细"按钮添加订单明细
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- 金额汇总 -->
          <div class="flex justify-end mt-4 pt-4 border-t">
            <div class="text-right">
              <div class="text-sm text-gray-600 mb-1">订单总金额</div>
              <div class="text-2xl font-bold text-gray-800">¥{{ totalAmount() | number: '1.2-2' }}</div>
            </div>
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
export class OrderFormComponent implements OnInit {
  private readonly purchaseService = inject(PurchaseService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isEdit = signal(false);
  orderId = signal<string | null>(null);
  submitting = signal(false);

  suppliers = signal<any[]>([]);
  products = signal<any[]>([]);
  colorVariants = signal<any[]>([]);
  items = signal<any[]>([]);

  form = new FormGroup({
    supplierId: new FormControl(''),
    orderDate: new FormControl(''),
    expectedDeliveryDate: new FormControl(''),
    notes: new FormControl(''),
  });

  totalAmount = computed(() => {
    return this.items().reduce((sum: number, item: any) => sum + item.amount, 0);
  });

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadProducts();
    this.loadColorVariants();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.orderId.set(id);
      this.loadOrder(id);
    }
  }

  loadOrder(id: string): void {
    this.purchaseService.getOrder(id).subscribe({
      next: (order) => {
        this.form.patchValue({
          supplierId: order.supplierId,
          orderDate: this.formatDate(order.orderDate),
          expectedDeliveryDate: this.formatDate(order.expectedDeliveryDate),
          notes: order.notes || '',
        });
        this.items.set(order.items.map((item: any) => ({
          ...item,
          amount: item.quantity * item.unitPrice,
        })));
      },
      error: (err) => {
        console.error('加载订单失败', err);
      },
    });
  }

  loadSuppliers(): void {
    this.purchaseService.getSuppliers().subscribe({
      next: (suppliers) => this.suppliers.set(suppliers),
      error: (err) => console.error('加载供应商失败', err),
    });
  }

  loadProducts(): void {
    this.purchaseService.getProducts().subscribe({
      next: (products) => this.products.set(products),
      error: (err) => console.error('加载产品失败', err),
    });
  }

  loadColorVariants(): void {
    this.purchaseService.getColorVariants().subscribe({
      next: (variants) => this.colorVariants.set(variants),
      error: (err) => console.error('加载颜色变体失败', err),
    });
  }

  getColorVariants(productId: string): any[] {
    return this.colorVariants().filter((v: any) => v.productId === productId);
  }

  addItem(): void {
    const newItem = {
      id: this.generateId(),
      productId: '',
      productName: '',
      colorVariantId: undefined,
      colorCode: undefined,
      colorName: undefined,
      quantity: 0,
      unit: '米',
      unitPrice: 0,
      amount: 0,
      receivedQuantity: 0,
    };
    this.items.update(items => [...items, newItem]);
  }

  removeItem(index: number): void {
    this.items.update(items => items.filter((_: any, i: number) => i !== index));
  }

  onProductChange(index: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const productId = select.value;
    const product = this.products().find((p: any) => p.id === productId);

    this.items.update((items: any[]) => {
      const updated = [...items];
      updated[index] = {
        ...updated[index],
        productId,
        productName: product?.productName || '',
        unit: product?.unit || '米',
        unitPrice: product?.unitPrice || 0,
        amount: updated[index].quantity * (product?.unitPrice || 0),
      };
      return updated;
    });
  }

  onColorChange(index: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const colorVariantId = select.value;
    const variant = this.colorVariants().find((v: any) => v.id === colorVariantId);

    this.items.update((items: any[]) => {
      const updated = [...items];
      updated[index] = {
        ...updated[index],
        colorVariantId: colorVariantId || undefined,
        colorCode: variant?.colorCode || undefined,
        colorName: variant?.colorName || undefined,
      };
      return updated;
    });
  }

  onQuantityChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const quantity = parseFloat(input.value) || 0;

    this.items.update((items: any[]) => {
      const updated = [...items];
      updated[index] = {
        ...updated[index],
        quantity,
        amount: quantity * updated[index].unitPrice,
      };
      return updated;
    });
  }

  onUnitChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const unit = input.value;

    this.items.update((items: any[]) => {
      const updated = [...items];
      updated[index] = { ...updated[index], unit };
      return updated;
    });
  }

  onUnitPriceChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const unitPrice = parseFloat(input.value) || 0;

    this.items.update((items: any[]) => {
      const updated = [...items];
      updated[index] = {
        ...updated[index],
        unitPrice,
        amount: updated[index].quantity * unitPrice,
      };
      return updated;
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.items().length === 0) {
      return;
    }

    this.submitting.set(true);

    const formValue = this.form.value;
    const supplier = this.suppliers().find((s: any) => s.id === formValue.supplierId);
    const order: any = {
      supplierId: formValue.supplierId,
      supplierName: supplier?.name || '',
      orderDate: new Date(formValue.orderDate!),
      expectedDeliveryDate: new Date(formValue.expectedDeliveryDate!),
      notes: formValue.notes || '',
      items: this.items(),
      totalAmount: this.totalAmount(),
      receivedAmount: 0,
      status: PurchaseOrderStatus.草稿,
    };

    const request = this.isEdit()
      ? this.purchaseService.updateOrder(this.orderId()!, order)
      : this.purchaseService.createOrder(order);

    request.subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/purchase']);
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('保存订单失败', err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/purchase']);
  }

  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  private generateId(): string {
    return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
