import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SaleService } from '../../services/sale.service';
import { SaleQuotation, SaleQuotationItem, Customer, ColorVariant, QuotationStatus } from '../../models/sale.model';

interface QuotationFormItem {
  productId: string;
  productName: string;
  colorVariantId: string;
  colorCode: string;
  colorName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

@Component({
  selector: 'app-quotation-form',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">
          {{ isEdit ? '编辑报价单' : '新建报价单' }}
        </h1>
        <button
          (click)="goBack()"
          class="btn-secondary"
        >
          返回
        </button>
      </div>

      <div class="card">
        <form (ngSubmit)="onSubmit()">
          <!-- 基本信息 -->
          <div class="mb-6">
            <h3 class="text-lg font-medium text-gray-800 mb-4">基本信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <span class="text-red-500">*</span>客户
                </label>
                <select
                  [(ngModel)]="formData.customerId"
                  name="customerId"
                  [disabled]="isEdit"
                  class="input-field w-full"
                  required
                >
                  <option value="">请选择客户</option>
                  @for (customer of customers(); track customer.id) {
                    <option [value]="customer.id">{{ customer.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <span class="text-red-500">*</span>报价日期
                </label>
                <input
                  type="date"
                  [(ngModel)]="formData.quotationDate"
                  name="quotationDate"
                  [disabled]="isEdit"
                  class="input-field w-full"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <span class="text-red-500">*</span>有效期至
                </label>
                <input
                  type="date"
                  [(ngModel)]="formData.validUntil"
                  name="validUntil"
                  [disabled]="isEdit"
                  class="input-field w-full"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <input
                  type="text"
                  [(ngModel)]="formData.remark"
                  name="remark"
                  [disabled]="isEdit"
                  placeholder="请输入备注"
                  class="input-field w-full"
                />
              </div>
            </div>
          </div>

          <!-- 产品明细 -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-800">产品明细</h3>
              @if (!isEdit || formData.status === statusDraft) {
                <button
                  type="button"
                  (click)="addItem()"
                  class="btn-secondary text-sm"
                >
                  添加产品
                </button>
              }
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">产品</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">颜色</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">数量</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">单位</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">单价</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">金额</th>
                    @if (!isEdit || formData.status === statusDraft) {
                      <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
                    }
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  @for (item of items(); track $index; let i = $index) {
                    <tr>
                      <td class="px-4 py-3">
                        @if (!isEdit || formData.status === statusDraft) {
                          <select
                            [(ngModel)]="item.productId"
                            [name]="'product-' + i"
                            (ngModelChange)="onProductChange(item)"
                            class="input-field w-full text-sm"
                          >
                            <option value="">请选择产品</option>
                            @for (variant of colorVariants(); track variant.id) {
                              <option [value]="variant.id">{{ variant.productName }} - {{ variant.colorName }}</option>
                            }
                          </select>
                        } @else {
                          <span class="text-sm text-gray-800">{{ item.productName }}</span>
                        }
                      </td>
                      <td class="px-4 py-3 text-sm text-gray-600">
                        {{ item.colorCode }} - {{ item.colorName }}
                      </td>
                      <td class="px-4 py-3">
                        @if (!isEdit || formData.status === statusDraft) {
                          <input
                            type="number"
                            [(ngModel)]="item.quantity"
                            [name]="'quantity-' + i"
                            (ngModelChange)="calculateAmount(item)"
                            min="0"
                            step="0.01"
                            class="input-field w-24 text-sm"
                          />
                        } @else {
                          <span class="text-sm text-gray-800">{{ item.quantity }}</span>
                        }
                      </td>
                      <td class="px-4 py-3">
                        @if (!isEdit || formData.status === statusDraft) {
                          <input
                            type="text"
                            [(ngModel)]="item.unit"
                            [name]="'unit-' + i"
                            class="input-field w-20 text-sm"
                          />
                        } @else {
                          <span class="text-sm text-gray-800">{{ item.unit }}</span>
                        }
                      </td>
                      <td class="px-4 py-3">
                        @if (!isEdit || formData.status === statusDraft) {
                          <input
                            type="number"
                            [(ngModel)]="item.unitPrice"
                            [name]="'unitPrice-' + i"
                            (ngModelChange)="calculateAmount(item)"
                            min="0"
                            step="0.01"
                            class="input-field w-24 text-sm"
                          />
                        } @else {
                          <span class="text-sm text-gray-800">¥{{ item.unitPrice | number: '1.2-2' }}</span>
                        }
                      </td>
                      <td class="px-4 py-3 text-sm text-gray-800 font-medium">
                        ¥{{ item.amount | number: '1.2-2' }}
                      </td>
                      @if (!isEdit || formData.status === statusDraft) {
                        <td class="px-4 py-3">
                          <button
                            type="button"
                            (click)="removeItem(i)"
                            class="text-red-600 hover:text-red-800 text-sm"
                          >
                            删除
                          </button>
                        </td>
                      }
                    </tr>
                  } @empty {
                    <tr>
                      <td [attr.colspan]="isEdit || formData.status === statusDraft ? 7 : 6" class="px-4 py-8 text-center text-gray-500">
                        请添加产品明细
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- 价格汇总 -->
          <div class="border-t pt-4">
            <div class="flex justify-end">
              <div class="w-80 space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">总价：</span>
                  <span class="text-gray-800 font-medium">¥{{ totalAmount() | number: '1.2-2' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">折扣率：</span>
                  @if (!isEdit || formData.status === statusDraft) {
                    <input
                      type="number"
                      [(ngModel)]="formData.discountRate"
                      name="discountRate"
                      (ngModelChange)="calculateFinalAmount()"
                      min="0"
                      max="1"
                      step="0.01"
                      class="input-field w-24 text-right text-sm"
                    />
                  } @else {
                    <span class="text-gray-800 font-medium">{{ formData.discountRate * 100 | number: '1.0-0' }}%</span>
                  }
                </div>
                <div class="flex justify-between text-lg">
                  <span class="text-gray-800 font-medium">折后价：</span>
                  <span class="text-primary-600 font-bold">¥{{ finalAmount() | number: '1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              (click)="goBack()"
              class="btn-secondary"
            >
              取消
            </button>
            @if (!isEdit || formData.status === statusDraft) {
              <button
                type="submit"
                [disabled]="isSubmitting()"
                class="btn-primary disabled:opacity-50"
              >
                {{ isSubmitting() ? '保存中...' : '保存' }}
              </button>
            }
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuotationFormComponent implements OnInit {
  private readonly saleService = inject(SaleService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly QuotationStatus = QuotationStatus;
  // 模板中使用的状态常量
  readonly statusDraft = 'draft';

  isEdit = false;
  quotationId: string | null = null;

  customers = signal<Customer[]>([]);
  colorVariants = signal<ColorVariant[]>([]);

  items = signal<QuotationFormItem[]>([]);

  formData: {
    customerId: string;
    quotationDate: string;
    validUntil: string;
    discountRate: number;
    remark: string;
    status?: QuotationStatus;
  } = {
    customerId: '',
    quotationDate: '',
    validUntil: '',
    discountRate: 1,
    remark: '',
  };

  isSubmitting = signal(false);

  totalAmount = computed(() => {
    return this.items().reduce((sum, item) => sum + item.amount, 0);
  });

  finalAmount = computed(() => {
    return this.totalAmount() * this.formData.discountRate;
  });

  ngOnInit(): void {
    // 加载客户列表
    this.saleService.getCustomers().subscribe({
      next: (customers) => this.customers.set(customers),
      error: (err) => console.error('加载客户列表失败', err),
    });

    // 加载颜色变体列表
    this.saleService.getColorVariants().subscribe({
      next: (variants) => this.colorVariants.set(variants),
      error: (err) => console.error('加载颜色变体列表失败', err),
    });

    // 检查是编辑还是新建
    this.quotationId = this.route.snapshot.paramMap.get('id');
    if (this.quotationId) {
      this.isEdit = true;
      this.loadQuotation(this.quotationId);
    } else {
      // 设置默认值
      const today = new Date();
      this.formData.quotationDate = today.toISOString().slice(0, 10);
      const validUntil = new Date(today);
      validUntil.setDate(validUntil.getDate() + 30);
      this.formData.validUntil = validUntil.toISOString().slice(0, 10);
    }
  }

  loadQuotation(id: string): void {
    this.saleService.getQuotation(id).subscribe({
      next: (quotation) => {
        this.formData = {
          customerId: quotation.customerId,
          quotationDate: new Date(quotation.quotationDate).toISOString().slice(0, 10),
          validUntil: new Date(quotation.validUntil).toISOString().slice(0, 10),
          discountRate: quotation.discountRate,
          remark: quotation.remark || '',
          status: quotation.status,
        };
        this.items.set(quotation.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          colorVariantId: item.colorVariantId,
          colorCode: item.colorCode,
          colorName: item.colorName,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })));
      },
      error: (err) => {
        console.error('加载报价单失败', err);
        alert('加载报价单失败');
        this.goBack();
      },
    });
  }

  onProductChange(item: QuotationFormItem): void {
    const variant = this.colorVariants().find(v => v.id === item.colorVariantId);
    if (variant) {
      item.productName = variant.productName;
      item.colorCode = variant.colorCode;
      item.colorName = variant.colorName;
      item.unitPrice = variant.unitPrice;
      item.unit = 'meter';
      this.calculateAmount(item);
    } else {
      item.productName = '';
      item.colorCode = '';
      item.colorName = '';
      item.unitPrice = 0;
      item.amount = 0;
    }
  }

  calculateAmount(item: QuotationFormItem): void {
    item.amount = item.quantity * item.unitPrice;
  }

  addItem(): void {
    this.items.update(items => [...items, {
      productId: '',
      productName: '',
      colorVariantId: '',
      colorCode: '',
      colorName: '',
      quantity: 0,
      unit: 'meter',
      unitPrice: 0,
      amount: 0,
    }]);
  }

  removeItem(index: number): void {
    this.items.update(items => items.filter((_, i) => i !== index));
  }

  calculateFinalAmount(): void {
    // 折后价会在 computed 自动更新
  }

  onSubmit(): void {
    if (!this.formData.customerId) {
      alert('请选择客户');
      return;
    }
    if (!this.formData.quotationDate) {
      alert('请选择报价日期');
      return;
    }
    if (!this.formData.validUntil) {
      alert('请选择有效期');
      return;
    }
    if (this.items().length === 0) {
      alert('请添加产品明细');
      return;
    }

    this.isSubmitting.set(true);

    const data: any = {
      customerId: this.formData.customerId,
      quotationDate: this.formData.quotationDate,
      validUntil: this.formData.validUntil,
      discountRate: this.formData.discountRate,
      remark: this.formData.remark,
      items: this.items().filter(item => item.colorVariantId).map(item => ({
        productId: item.productId,
        colorVariantId: item.colorVariantId,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        remark: '',
      })),
    };

    const request = this.isEdit
      ? this.saleService.updateQuotation(this.quotationId!, data)
      : this.saleService.createQuotation(data);

    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        alert(this.isEdit ? '更新成功' : '创建成功');
        this.goBack();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('保存报价单失败', err);
        alert('保存失败：' + (err.error?.message || '未知错误'));
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/sales/quotations']);
  }
}
