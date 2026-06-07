import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ProductionService } from '../../services/production.service';
import {
  ProductionOrder,
  ProductionOrderItem,
  ProductionOrderStatus,
  ProductionPriority,
  Product,
  ColorVariant,
} from '../../models/production.model';

@Component({
  selector: 'app-production-order-form',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ isEdit() ? '编辑工单' : '新建工单' }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ isEdit() ? '编辑生产工单信息' : '创建新的生产工单' }}</p>
        </div>
        <button (click)="goBack()" class="btn-secondary">
          返回列表
        </button>
      </div>

      <div class="card">
        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- 基本信息 -->
          <div class="border-b border-gray-200 pb-4">
            <h3 class="text-lg font-medium text-gray-800 mb-4">基本信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- 产品选择 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  产品 <span class="text-red-500">*</span>
                </label>
                <select
                  [(ngModel)]="formData.productId"
                  name="productId"
                  (ngModelChange)="onProductChange()"
                  required
                  class="input-field w-full"
                >
                  <option value="">请选择产品</option>
                  @for (product of products(); track product.id) {
                    <option [value]="product.id">{{ product.name }} ({{ product.code }})</option>
                  }
                </select>
              </div>

              <!-- 颜色变体选择 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">颜色</label>
                <select
                  [(ngModel)]="formData.colorVariantId"
                  name="colorVariantId"
                  class="input-field w-full"
                >
                  <option value="">请选择颜色</option>
                  @for (variant of colorVariants(); track variant.id) {
                    <option [value]="variant.id">{{ variant.colorCode }} - {{ variant.colorName }}</option>
                  }
                </select>
              </div>

              <!-- 计划数量 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  计划数量 <span class="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  [(ngModel)]="formData.plannedQuantity"
                  name="plannedQuantity"
                  required
                  min="1"
                  class="input-field w-full"
                  placeholder="请输入计划数量"
                />
              </div>

              <!-- 优先级 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                <select
                  [(ngModel)]="formData.priority"
                  name="priority"
                  class="input-field w-full"
                >
                  <option [value]="'low'">低</option>
                  <option [value]="'medium'">中</option>
                  <option [value]="'high'">高</option>
                  <option [value]="'urgent'">紧急</option>
                </select>
              </div>

              <!-- 开始日期 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  开始日期 <span class="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  [(ngModel)]="formData.startDate"
                  name="startDate"
                  required
                  class="input-field w-full"
                />
              </div>

              <!-- 预计完成日期 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  预计完成日期 <span class="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  [(ngModel)]="formData.expectedFinishDate"
                  name="expectedFinishDate"
                  required
                  class="input-field w-full"
                />
              </div>
            </div>
          </div>

          <!-- 工单明细 -->
          <div class="border-b border-gray-200 pb-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-800">工单明细</h3>
              <button type="button" (click)="addItem()" class="btn-secondary text-sm">
                添加明细
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">产品</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">计划数量</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">完成数量</th>
                    <th class="px-4 py-2 text-center text-sm font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  @for (item of items(); track item.id; let i = $index) {
                    <tr>
                      <td class="px-4 py-2">
                        <select
                          [(ngModel)]="item.productId"
                          [name]="'item-product-' + i"
                          (ngModelChange)="onItemProductChange(item)"
                          class="input-field w-full"
                        >
                          <option value="">请选择产品</option>
                          @for (product of products(); track product.id) {
                            <option [value]="product.id">{{ product.name }}</option>
                          }
                        </select>
                      </td>
                      <td class="px-4 py-2">
                        <input
                          type="number"
                          [(ngModel)]="item.plannedQuantity"
                          [name]="'item-planned-' + i"
                          min="0"
                          class="input-field w-full text-right"
                        />
                      </td>
                      <td class="px-4 py-2">
                        <input
                          type="number"
                          [(ngModel)]="item.actualQuantity"
                          [name]="'item-actual-' + i"
                          min="0"
                          class="input-field w-full text-right"
                        />
                      </td>
                      <td class="px-4 py-2 text-center">
                        <button type="button" (click)="removeItem(i)" class="text-red-600 hover:text-red-800 text-sm">
                          删除
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="px-4 py-4 text-center text-gray-500">
                        暂无明细，点击"添加明细"按钮添加
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- 备注 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea
              [(ngModel)]="formData.notes"
              name="notes"
              rows="3"
              class="input-field w-full"
              placeholder="请输入备注信息"
            ></textarea>
          </div>

          <!-- 提交按钮 -->
          <div class="flex justify-end gap-3 pt-4 border-t">
            <button type="button" (click)="goBack()" class="btn-secondary">
              取消
            </button>
            <button type="submit" class="btn-primary" [disabled]="isSubmitting()">
              {{ isSubmitting() ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductionOrderFormComponent implements OnInit {
  private readonly productionService = inject(ProductionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly ProductionPriority = ProductionPriority;

  isEdit = signal(false);
  isSubmitting = signal(false);
  orderId = signal<string | null>(null);

  products = signal<Product[]>([]);
  colorVariants = signal<ColorVariant[]>([]);
  items = signal<ProductionOrderItem[]>([]);

  formData: {
    productId: string;
    colorVariantId: string;
    plannedQuantity: number;
    priority: ProductionPriority;
    startDate: string;
    expectedFinishDate: string;
    notes: string;
  } = {
    productId: '',
    colorVariantId: '',
    plannedQuantity: 0,
    priority: ProductionPriority.中,
    startDate: '',
    expectedFinishDate: '',
    notes: '',
  };

  ngOnInit(): void {
    this.loadProducts();
    this.loadColorVariants();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderId.set(id);
      this.isEdit.set(true);
      this.loadOrder(id);
    } else {
      // 设置默认日期
      const today = new Date();
      this.formData.startDate = today.toISOString().split('T')[0];
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      this.formData.expectedFinishDate = nextWeek.toISOString().split('T')[0];
    }
  }

  loadProducts(): void {
    this.productionService.getProducts().subscribe({
      next: (products) => this.products.set(products),
      error: (err) => console.error('加载产品列表失败', err),
    });
  }

  loadColorVariants(productId?: string): void {
    this.productionService.getColorVariants(productId).subscribe({
      next: (variants) => this.colorVariants.set(variants),
      error: (err) => console.error('加载颜色变体失败', err),
    });
  }

  loadOrder(id: string): void {
    this.productionService.getOrder(id).subscribe({
      next: (order) => {
        this.formData = {
          productId: order.productId,
          colorVariantId: order.colorVariantId || '',
          plannedQuantity: order.plannedQuantity,
          priority: order.priority,
          startDate: new Date(order.startDate).toISOString().split('T')[0],
          expectedFinishDate: new Date(order.expectedFinishDate).toISOString().split('T')[0],
          notes: order.notes || '',
        };
        this.items.set(order.items);
      },
      error: (err) => {
        console.error('加载工单详情失败', err);
      },
    });
  }

  onProductChange(): void {
    if (this.formData.productId) {
      this.loadColorVariants(this.formData.productId);
    } else {
      this.colorVariants.set([]);
    }
  }

  onItemProductChange(item: ProductionOrderItem): void {
    const product = this.products().find(p => p.id === item.productId);
    if (product) {
      item.productName = product.name;
    }
  }

  addItem(): void {
    const newItem: ProductionOrderItem = {
      id: crypto.randomUUID(),
      productId: '',
      productName: '',
      plannedQuantity: 0,
      actualQuantity: 0,
    };
    this.items.update(items => [...items, newItem]);
  }

  removeItem(index: number): void {
    this.items.update(items => items.filter((_, i) => i !== index));
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting.set(true);

    const orderData: Partial<ProductionOrder> = {
      productId: this.formData.productId,
      colorVariantId: this.formData.colorVariantId || undefined,
      plannedQuantity: this.formData.plannedQuantity,
      priority: this.formData.priority,
      startDate: new Date(this.formData.startDate),
      expectedFinishDate: new Date(this.formData.expectedFinishDate),
      notes: this.formData.notes || undefined,
      items: this.items(),
    };

    const selectedVariant = this.colorVariants().find(v => v.id === this.formData.colorVariantId);
    if (selectedVariant) {
      orderData.colorCode = selectedVariant.colorCode;
      orderData.colorName = selectedVariant.colorName;
    }

    const product = this.products().find(p => p.id === this.formData.productId);
    if (product) {
      orderData.productName = product.name;
    }

    const request = this.isEdit() && this.orderId()
      ? this.productionService.updateOrder(this.orderId()!, orderData)
      : this.productionService.createOrder(orderData);

    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/production/orders']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('保存工单失败', err);
        alert('保存失败，请重试');
      },
    });
  }

  validateForm(): boolean {
    if (!this.formData.productId) {
      alert('请选择产品');
      return false;
    }
    if (!this.formData.plannedQuantity || this.formData.plannedQuantity <= 0) {
      alert('请输入有效的计划数量');
      return false;
    }
    if (!this.formData.startDate) {
      alert('请选择开始日期');
      return false;
    }
    if (!this.formData.expectedFinishDate) {
      alert('请选择预计完成日期');
      return false;
    }
    return true;
  }

  goBack(): void {
    this.router.navigate(['/production/orders']);
  }
}
