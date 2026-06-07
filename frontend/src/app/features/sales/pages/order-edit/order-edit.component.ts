import { Component, inject, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SaleService } from '../../services/sale.service';
import { SaleOrder, SaleOrderItem, ColorVariant, Customer, OrderStatus } from '../../models/sale.model';

@Component({
  selector: 'app-order-edit',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">
          {{ isEdit() ? '编辑订单' : '新建订单' }}
        </h1>
        <button (click)="goBack()" class="btn-secondary">返回</button>
      </div>

      <form [formGroup]="orderForm" (ngSubmit)="onSubmit()">
        <!-- 基本信息 -->
        <div class="card mb-4">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">客户名称 <span class="text-red-500">*</span></label>
              <select
                formControlName="customerId"
                class="input-field w-full"
              >
                <option value="">请选择客户</option>
                @for (customer of customers(); track customer.id) {
                  <option [value]="customer.id">{{ customer.name }}</option>
                }
              </select>
              @if (orderForm.get('customerId')?.invalid && orderForm.get('customerId')?.touched) {
                <span class="text-red-500 text-sm">请选择客户</span>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">订单日期 <span class="text-red-500">*</span></label>
              <input
                type="date"
                formControlName="orderDate"
                class="input-field w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">交货日期 <span class="text-red-500">*</span></label>
              <input
                type="date"
                formControlName="deliveryDate"
                class="input-field w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <input
                type="text"
                formControlName="notes"
                placeholder="可选填写备注信息"
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
              class="btn-primary text-sm"
            >
              添加产品
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left text-sm font-medium text-gray-600">产品</th>
                  <th class="px-3 py-2 text-left text-sm font-medium text-gray-600">颜色</th>
                  <th class="px-3 py-2 text-left text-sm font-medium text-gray-600">数量</th>
                  <th class="px-3 py-2 text-left text-sm font-medium text-gray-600">单位</th>
                  <th class="px-3 py-2 text-left text-sm font-medium text-gray-600">单价</th>
                  <th class="px-3 py-2 text-left text-sm font-medium text-gray-600">金额</th>
                  <th class="px-3 py-2 text-left text-sm font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody formArrayName="items">
                @for (item of items.controls; track item; let i = $index) {
                  <tr [formGroupName]="i" class="border-b">
                    <td class="px-3 py-2">
                      <select
                        formControlName="productId"
                        (change)="onProductChange(i)"
                        class="input-field w-full text-sm"
                      >
                        <option value="">选择产品</option>
                      </select>
                    </td>
                    <td class="px-3 py-2">
                      <select
                        formControlName="colorVariantId"
                        (change)="onColorVariantChange(i)"
                        class="input-field w-full text-sm"
                      >
                        <option value="">选择颜色</option>
                        @for (variant of colorVariants(); track variant.id) {
                          <option [value]="variant.id">
                            {{ variant.colorCode }} - {{ variant.colorName }}
                          </option>
                        }
                      </select>
                    </td>
                    <td class="px-3 py-2">
                      <input
                        type="number"
                        formControlName="quantity"
                        (input)="calculateAmount(i)"
                        min="1"
                        class="input-field w-24 text-sm"
                      />
                    </td>
                    <td class="px-3 py-2">
                      <input
                        type="text"
                        formControlName="unit"
                        placeholder="米/码/件"
                        class="input-field w-20 text-sm"
                      />
                    </td>
                    <td class="px-3 py-2">
                      <input
                        type="number"
                        formControlName="unitPrice"
                        (input)="calculateAmount(i)"
                        step="0.01"
                        min="0"
                        class="input-field w-24 text-sm"
                      />
                    </td>
                    <td class="px-3 py-2 text-sm font-medium text-gray-800">
                      ¥{{ getItemAmount(i) | number: '1.2-2' }}
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
              请添加订单明细
            </div>
          }
        </div>

        <!-- 金额汇总 -->
        <div class="card mb-4">
          <div class="flex justify-end">
            <div class="w-64">
              <div class="flex justify-between py-2">
                <span class="text-gray-600">订单总金额：</span>
                <span class="text-xl font-bold text-primary-600">
                  ¥{{ totalAmount() | number: '1.2-2' }}
                </span>
              </div>
              <div class="flex justify-between py-2">
                <span class="text-gray-600">已付金额：</span>
                <input
                  type="number"
                  formControlName="paidAmount"
                  step="0.01"
                  min="0"
                  class="input-field w-32 text-right"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="flex justify-end gap-4">
          <button type="button" (click)="goBack()" class="btn-secondary">
            取消
          </button>
          <button
            type="submit"
            [disabled]="orderForm.invalid || items.length === 0"
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
export class OrderEditComponent {
  private readonly saleService = inject(SaleService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isEdit = signal(false);
  orderId = signal<string | null>(null);
  customers = signal<Customer[]>([]);
  colorVariants = signal<ColorVariant[]>([]);

  orderForm = new FormGroup({
    customerId: new FormControl('', Validators.required),
    customerName: new FormControl(''),
    orderDate: new FormControl(this.formatDate(new Date()), Validators.required),
    deliveryDate: new FormControl('', Validators.required),
    paidAmount: new FormControl(0),
    notes: new FormControl(''),
    items: new FormArray([]),
  });

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  totalAmount = computed(() => {
    return this.items.controls.reduce((sum, item) => {
      const quantity = item.get('quantity')?.value || 0;
      const unitPrice = item.get('unitPrice')?.value || 0;
      return sum + quantity * unitPrice;
    }, 0);
  });

  constructor() {
    effect(() => {
      this.loadCustomers();
      this.loadColorVariants();

      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.orderId.set(id);
        this.isEdit.set(true);
        this.loadOrder(id);
      }
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  loadCustomers(): void {
    this.saleService.getCustomers().subscribe({
      next: (customers) => {
        this.customers.set(customers);
      },
    });
  }

  loadColorVariants(): void {
    this.saleService.getColorVariants().subscribe({
      next: (variants) => {
        this.colorVariants.set(variants);
      },
    });
  }

  loadOrder(id: string): void {
    this.saleService.getOrder(id).subscribe({
      next: (order) => {
        this.orderForm.patchValue({
          customerId: order.customerId,
          customerName: order.customerName,
          orderDate: this.formatDate(new Date(order.orderDate)),
          deliveryDate: this.formatDate(new Date(order.deliveryDate)),
          paidAmount: order.paidAmount,
          notes: order.notes || '',
        });

        // 清空并重新填充items
        while (this.items.length !== 0) {
          this.items.removeAt(0);
        }
        order.items.forEach((item) => {
          this.addItemWithData(item);
        });
      },
    });
  }

  addItem(): void {
    const itemGroup = new FormGroup({
      productId: new FormControl(''),
      productName: new FormControl(''),
      colorVariantId: new FormControl('', Validators.required),
      colorCode: new FormControl(''),
      colorName: new FormControl(''),
      quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
      unit: new FormControl('米', Validators.required),
      unitPrice: new FormControl(0, [Validators.required, Validators.min(0)]),
      amount: new FormControl(0),
    });
    this.items.push(itemGroup);
  }

  addItemWithData(item: SaleOrderItem): void {
    const itemGroup = new FormGroup({
      productId: new FormControl(item.productId),
      productName: new FormControl(item.productName),
      colorVariantId: new FormControl(item.colorVariantId, Validators.required),
      colorCode: new FormControl(item.colorCode),
      colorName: new FormControl(item.colorName),
      quantity: new FormControl(item.quantity, [Validators.required, Validators.min(1)]),
      unit: new FormControl(item.unit, Validators.required),
      unitPrice: new FormControl(item.unitPrice, [Validators.required, Validators.min(0)]),
      amount: new FormControl(item.amount),
    });
    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  onProductChange(index: number): void {
    const productId = this.items.at(index).get('productId')?.value;
    if (productId) {
      this.saleService.getColorVariants(productId).subscribe({
        next: (variants) => {
          // 更新颜色变体列表
        },
      });
    }
  }

  onColorVariantChange(index: number): void {
    const colorVariantId = this.items.at(index).get('colorVariantId')?.value;
    if (colorVariantId) {
      const variant = this.colorVariants().find((v) => v.id === colorVariantId);
      if (variant) {
        this.items.at(index).patchValue({
          colorCode: variant.colorCode,
          colorName: variant.colorName,
          unitPrice: variant.unitPrice,
          productId: variant.productId,
          productName: variant.productName,
        });
        this.calculateAmount(index);
      }
    }
  }

  calculateAmount(index: number): void {
    const quantity = this.items.at(index).get('quantity')?.value || 0;
    const unitPrice = this.items.at(index).get('unitPrice')?.value || 0;
    this.items.at(index).patchValue({ amount: quantity * unitPrice }, { emitEvent: false });
  }

  getItemAmount(index: number): number {
    const item = this.items.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unitPrice')?.value || 0;
    return quantity * unitPrice;
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      return;
    }

    const formValue = this.orderForm.value;
    const customer = this.customers().find((c) => c.id === formValue.customerId);

    const order: Partial<SaleOrder> = {
      customerId: formValue.customerId!,
      customerName: customer?.name || '',
      orderDate: new Date(formValue.orderDate!),
      deliveryDate: new Date(formValue.deliveryDate!),
      paidAmount: formValue.paidAmount || 0,
      notes: formValue.notes || '',
      totalAmount: this.totalAmount(),
      items: this.items.controls.map((item) => ({
        id: '',
        productId: item.get('productId')?.value || '',
        productName: item.get('productName')?.value || '',
        colorVariantId: item.get('colorVariantId')?.value || '',
        colorCode: item.get('colorCode')?.value || '',
        colorName: item.get('colorName')?.value || '',
        quantity: item.get('quantity')?.value || 0,
        unit: item.get('unit')?.value || '',
        unitPrice: item.get('unitPrice')?.value || 0,
        amount: (item.get('quantity')?.value || 0) * (item.get('unitPrice')?.value || 0),
      })),
    };

    if (this.isEdit() && this.orderId()) {
      this.saleService.updateOrder(this.orderId()!, order).subscribe({
        next: () => {
          this.router.navigate(['/sales/orders']);
        },
        error: (err) => {
          console.error('更新订单失败', err);
        },
      });
    } else {
      this.saleService.createOrder(order).subscribe({
        next: () => {
          this.router.navigate(['/sales/orders']);
        },
        error: (err) => {
          console.error('创建订单失败', err);
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/sales/orders']);
  }
}
