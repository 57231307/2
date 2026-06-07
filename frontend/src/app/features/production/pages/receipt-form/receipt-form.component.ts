import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ProductionService } from '../../services/production.service';
import {
  ProductionReceipt,
  ProductionReceiptItem,
  ProductionReceiptStatus,
  ProductionOrder,
  ProductionOrderStatus,
  Warehouse,
} from '../../models/production.model';

interface ReceiptItemForm extends ProductionReceiptItem {
  productName?: string;
  colorName?: string;
}

@Component({
  selector: 'app-receipt-form',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ isEdit() ? '编辑入库单' : '新建入库单' }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ isEdit() ? '编辑入库单信息' : '创建新的入库单' }}</p>
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
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- 生产工单选择 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  生产工单 <span class="text-red-500">*</span>
                </label>
                <select
                  [(ngModel)]="formData.productionOrderId"
                  name="productionOrderId"
                  (ngModelChange)="onOrderChange()"
                  required
                  class="input-field w-full"
                  [disabled]="isEdit()"
                >
                  <option value="">请选择生产工单</option>
                  @for (order of productionOrders(); track order.id) {
                    <option [value]="order.id">
                      {{ order.orderNo }} - {{ order.productName }}
                      @if (order.colorCode || order.colorName) {
                        ({{ order.colorCode }}-{{ order.colorName }})
                      }
                    </option>
                  }
                </select>
              </div>

              <!-- 仓库选择 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  入库仓库 <span class="text-red-500">*</span>
                </label>
                <select
                  [(ngModel)]="formData.warehouseId"
                  name="warehouseId"
                  required
                  class="input-field w-full"
                >
                  <option value="">请选择仓库</option>
                  @for (warehouse of warehouses(); track warehouse.id) {
                    <option [value]="warehouse.id">{{ warehouse.name }}</option>
                  }
                </select>
              </div>

              <!-- 入库日期 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  入库日期 <span class="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  [(ngModel)]="formData.receiptDate"
                  name="receiptDate"
                  required
                  class="input-field w-full"
                />
              </div>
            </div>
          </div>

          <!-- 工单信息显示 -->
          @if (selectedOrder()) {
            <div class="border-b border-gray-200 pb-4">
              <h3 class="text-lg font-medium text-gray-800 mb-4">工单信息</h3>
              <div class="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded">
                <div>
                  <p class="text-sm text-gray-500 mb-1">产品名称</p>
                  <p class="text-gray-800 font-medium">{{ selectedOrder()!.productName }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 mb-1">颜色</p>
                  <p class="text-gray-800">
                    @if (selectedOrder()!.colorCode || selectedOrder()!.colorName) {
                      {{ selectedOrder()!.colorCode }}-{{ selectedOrder()!.colorName }}
                    } @else {
                      -
                    }
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 mb-1">计划数量</p>
                  <p class="text-gray-800 font-medium">{{ selectedOrder()!.plannedQuantity | number }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 mb-1">完成数量</p>
                  <p class="text-gray-800 font-medium">{{ selectedOrder()!.actualQuantity | number }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 mb-1">可入库数量</p>
                  <p class="text-gray-800 font-medium text-green-600">
                    {{ selectedOrder()!.plannedQuantity - selectedOrder()!.actualQuantity | number }}
                  </p>
                </div>
              </div>
            </div>
          }

          <!-- 入库明细 -->
          <div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-800">入库明细</h3>
              <button type="button" (click)="addItem()" class="btn-secondary text-sm">
                添加明细
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">颜色</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">入库数量</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">缸号</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">匹号</th>
                    <th class="px-4 py-2 text-center text-sm font-medium text-gray-600">单位</th>
                    <th class="px-4 py-2 text-center text-sm font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  @for (item of items(); track item.id; let i = $index) {
                    <tr>
                      <td class="px-4 py-2">
                        <input
                          type="text"
                          [(ngModel)]="item.colorName"
                          [name]="'item-color-' + i"
                          class="input-field w-full"
                          placeholder="颜色描述"
                        />
                      </td>
                      <td class="px-4 py-2">
                        <input
                          type="number"
                          [(ngModel)]="item.receiptQuantity"
                          [name]="'item-quantity-' + i"
                          min="0"
                          class="input-field w-full text-right"
                          placeholder="0"
                        />
                      </td>
                      <td class="px-4 py-2">
                        <input
                          type="text"
                          [(ngModel)]="item.dyeLotNo"
                          [name]="'item-dyelot-' + i"
                          class="input-field w-full"
                          placeholder="缸号"
                        />
                      </td>
                      <td class="px-4 py-2">
                        <input
                          type="text"
                          [(ngModel)]="item.pieceNo"
                          [name]="'item-piece-' + i"
                          class="input-field w-full"
                          placeholder="匹号"
                        />
                      </td>
                      <td class="px-4 py-2 text-center">
                        <input
                          type="text"
                          [(ngModel)]="item.unit"
                          [name]="'item-unit-' + i"
                          class="input-field w-full text-center"
                          placeholder="单位"
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
                      <td colspan="6" class="px-4 py-4 text-center text-gray-500">
                        暂无入库明细，点击"添加明细"按钮添加
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
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
export class ReceiptFormComponent implements OnInit {
  private readonly productionService = inject(ProductionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly ProductionReceiptStatus = ProductionReceiptStatus;

  isEdit = signal(false);
  isSubmitting = signal(false);
  receiptId = signal<string | null>(null);

  productionOrders = signal<ProductionOrder[]>([]);
  warehouses = signal<Warehouse[]>([]);
  selectedOrder = signal<ProductionOrder | null>(null);
  items = signal<ReceiptItemForm[]>([]);

  formData: {
    productionOrderId: string;
    warehouseId: string;
    receiptDate: string;
  } = {
    productionOrderId: '',
    warehouseId: '',
    receiptDate: '',
  };

  ngOnInit(): void {
    this.loadProductionOrders();
    this.loadWarehouses();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.receiptId.set(id);
      this.isEdit.set(true);
      this.loadReceipt(id);
    } else {
      this.formData.receiptDate = new Date().toISOString().split('T')[0];
    }
  }

  loadProductionOrders(): void {
    const params = { page: 1, pageSize: 100 };
    this.productionService.getOrders(params).subscribe({
      next: (result) => {
        const filteredOrders = result.items.filter(
          (o) => o.status === ProductionOrderStatus.生产中 || 
                 o.status === ProductionOrderStatus.待入库
        );
        this.productionOrders.set(filteredOrders);
      },
      error: (err) => console.error('加载工单列表失败', err),
    });
  }

  loadWarehouses(): void {
    this.productionService.getWarehouses().subscribe({
      next: (warehouses) => this.warehouses.set(warehouses),
      error: (err) => console.error('加载仓库列表失败', err),
    });
  }

  loadReceipt(id: string): void {
    this.productionService.getReceipt(id).subscribe({
      next: (receipt) => {
        this.formData = {
          productionOrderId: receipt.productionOrderId,
          warehouseId: receipt.warehouseId,
          receiptDate: new Date(receipt.receiptDate).toISOString().split('T')[0],
        };
        this.items.set(receipt.items.map(item => ({
          ...item,
          productName: '',
          colorName: item.colorVariantId || '',
        })));
        this.onOrderChange();
      },
      error: (err) => {
        console.error('加载入库单详情失败', err);
      },
    });
  }

  onOrderChange(): void {
    const order = this.productionOrders().find(o => o.id === this.formData.productionOrderId);
    if (order) {
      this.selectedOrder.set(order);
    } else {
      this.selectedOrder.set(null);
    }
  }

  addItem(): void {
    const order = this.selectedOrder();
    const newItem: ReceiptItemForm = {
      id: crypto.randomUUID(),
      productId: order?.productId || '',
      productName: order?.productName || '',
      colorVariantId: order?.colorVariantId,
      colorName: order?.colorName || '',
      receiptQuantity: 0,
      dyeLotNo: '',
      pieceNo: '',
      unit: '米',
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

    const order = this.selectedOrder();

    const receiptData: Partial<ProductionReceipt> = {
      productionOrderId: this.formData.productionOrderId,
      receiptDate: new Date(this.formData.receiptDate),
      warehouseId: this.formData.warehouseId,
      items: this.items().map(item => ({
        id: item.id,
        productId: item.productId || order?.productId || '',
        colorVariantId: item.colorVariantId || order?.colorVariantId,
        receiptQuantity: item.receiptQuantity,
        dyeLotNo: item.dyeLotNo || undefined,
        pieceNo: item.pieceNo || undefined,
        unit: item.unit || '米',
      })),
    };

    if (order) {
      receiptData.productionOrderNo = order.orderNo;
    }

    const warehouse = this.warehouses().find(w => w.id === this.formData.warehouseId);
    if (warehouse) {
      receiptData.warehouseName = warehouse.name;
    }

    // 判断状态
    const totalQuantity = this.items().reduce((sum, item) => sum + item.receiptQuantity, 0);
    receiptData.status = totalQuantity > 0 ? ProductionReceiptStatus.已入库 : ProductionReceiptStatus.待入库;

    const request = this.isEdit() && this.receiptId()
      ? this.productionService.updateReceipt(this.receiptId()!, receiptData)
      : this.productionService.createReceipt(receiptData);

    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/production/receipts']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('保存入库单失败', err);
        alert('保存失败，请重试');
      },
    });
  }

  validateForm(): boolean {
    if (!this.formData.productionOrderId) {
      alert('请选择生产工单');
      return false;
    }
    if (!this.formData.warehouseId) {
      alert('请选择仓库');
      return false;
    }
    if (!this.formData.receiptDate) {
      alert('请选择入库日期');
      return false;
    }
    if (this.items().length === 0) {
      alert('请添加至少一条入库明细');
      return false;
    }
    const totalQuantity = this.items().reduce((sum, item) => sum + item.receiptQuantity, 0);
    if (totalQuantity <= 0) {
      alert('入库数量必须大于0');
      return false;
    }
    return true;
  }

  goBack(): void {
    this.router.navigate(['/production/receipts']);
  }
}
