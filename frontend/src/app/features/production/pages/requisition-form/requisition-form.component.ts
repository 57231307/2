import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ProductionService } from '../../services/production.service';
import {
  MaterialRequisition,
  MaterialRequisitionItem,
  RequisitionStatus,
  ProductionOrder,
  ProductionOrderStatus,
  Product,
  Warehouse,
} from '../../models/production.model';

@Component({
  selector: 'app-requisition-form',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ isEdit() ? '编辑领料单' : '新建领料单' }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ isEdit() ? '编辑领料单信息' : '创建新的领料单' }}</p>
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
                    <option [value]="order.id">{{ order.orderNo }} - {{ order.productName }}</option>
                  }
                </select>
              </div>

              <!-- 仓库选择 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  领料仓库 <span class="text-red-500">*</span>
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

              <!-- 领料日期 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  领料日期 <span class="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  [(ngModel)]="formData.requisitionDate"
                  name="requisitionDate"
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
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded">
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
              </div>
            </div>
          }

          <!-- 原料列表 -->
          <div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-800">领料明细</h3>
              <button type="button" (click)="addItem()" class="btn-secondary text-sm">
                添加原料
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">原料</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">需求数量</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">已领数量</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">本次领料</th>
                    <th class="px-4 py-2 text-center text-sm font-medium text-gray-600">单位</th>
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
                          <option value="">请选择原料</option>
                          @for (product of rawMaterials(); track product.id) {
                            <option [value]="product.id">{{ product.name }} ({{ product.code }})</option>
                          }
                        </select>
                      </td>
                      <td class="px-4 py-2">
                        <input
                          type="number"
                          [(ngModel)]="item.requisitionQuantity"
                          [name]="'item-requisition-' + i"
                          min="0"
                          class="input-field w-full text-right"
                          placeholder="0"
                        />
                      </td>
                      <td class="px-4 py-2">
                        <input
                          type="number"
                          [(ngModel)]="item.issuedQuantity"
                          [name]="'item-issued-' + i"
                          min="0"
                          class="input-field w-full text-right"
                          placeholder="0"
                        />
                      </td>
                      <td class="px-4 py-2">
                        <input
                          type="number"
                          [(ngModel)]="item.currentQuantity"
                          [name]="'item-current-' + i"
                          min="0"
                          class="input-field w-full text-right"
                          placeholder="0"
                        />
                      </td>
                      <td class="px-4 py-2 text-center">
                        {{ item.unit || '-' }}
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
                        暂无原料数据，点击"添加原料"按钮添加
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
export class RequisitionFormComponent implements OnInit {
  private readonly productionService = inject(ProductionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly RequisitionStatus = RequisitionStatus;

  isEdit = signal(false);
  isSubmitting = signal(false);
  requisitionId = signal<string | null>(null);

  productionOrders = signal<ProductionOrder[]>([]);
  rawMaterials = signal<Product[]>([]);
  warehouses = signal<Warehouse[]>([]);
  selectedOrder = signal<ProductionOrder | null>(null);
  items = signal<(MaterialRequisitionItem & { currentQuantity?: number })[]>([]);

  formData: {
    productionOrderId: string;
    warehouseId: string;
    requisitionDate: string;
  } = {
    productionOrderId: '',
    warehouseId: '',
    requisitionDate: '',
  };

  ngOnInit(): void {
    this.loadProductionOrders();
    this.loadRawMaterials();
    this.loadWarehouses();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.requisitionId.set(id);
      this.isEdit.set(true);
      this.loadRequisition(id);
    } else {
      this.formData.requisitionDate = new Date().toISOString().split('T')[0];
    }
  }

  loadProductionOrders(): void {
    // 只加载已确认或生产中的工单
    const params = { page: 1, pageSize: 100 };
    this.productionService.getOrders(params).subscribe({
      next: (result) => {
        const filteredOrders = result.items.filter(
          (o) => o.status === ProductionOrderStatus.已确认 || 
                 o.status === ProductionOrderStatus.生产中 ||
                 o.status === ProductionOrderStatus.待入库
        );
        this.productionOrders.set(filteredOrders);
      },
      error: (err) => console.error('加载工单列表失败', err),
    });
  }

  loadRawMaterials(): void {
    this.productionService.getRawMaterials().subscribe({
      next: (materials) => this.rawMaterials.set(materials),
      error: (err) => console.error('加载原料列表失败', err),
    });
  }

  loadWarehouses(): void {
    this.productionService.getWarehouses().subscribe({
      next: (warehouses) => this.warehouses.set(warehouses),
      error: (err) => console.error('加载仓库列表失败', err),
    });
  }

  loadRequisition(id: string): void {
    this.productionService.getRequisition(id).subscribe({
      next: (requisition) => {
        this.formData = {
          productionOrderId: requisition.productionOrderId,
          warehouseId: requisition.warehouseId,
          requisitionDate: new Date(requisition.requisitionDate).toISOString().split('T')[0],
        };
        this.items.set(requisition.items.map(item => ({
          ...item,
          currentQuantity: item.requisitionQuantity - item.issuedQuantity,
        })));
      },
      error: (err) => {
        console.error('加载领料单详情失败', err);
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

  onItemProductChange(item: MaterialRequisitionItem & { currentQuantity?: number }): void {
    const product = this.rawMaterials().find(p => p.id === item.productId);
    if (product) {
      item.productName = product.name;
      item.unit = product.unit;
    }
  }

  addItem(): void {
    const newItem = {
      id: crypto.randomUUID(),
      productId: '',
      productName: '',
      requisitionQuantity: 0,
      issuedQuantity: 0,
      currentQuantity: 0,
      unit: '',
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

    const requisitionData: Partial<MaterialRequisition> = {
      productionOrderId: this.formData.productionOrderId,
      requisitionDate: new Date(this.formData.requisitionDate),
      warehouseId: this.formData.warehouseId,
      items: this.items().map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        requisitionQuantity: item.requisitionQuantity,
        issuedQuantity: item.issuedQuantity + (item.currentQuantity || 0),
        unit: item.unit,
      })),
    };

    if (order) {
      requisitionData.productionOrderNo = order.orderNo;
    }

    const warehouse = this.warehouses().find(w => w.id === this.formData.warehouseId);
    if (warehouse) {
      requisitionData.warehouseName = warehouse.name;
    }

    // 判断状态
    const hasUnfilled = this.items().some(item => (item.currentQuantity || 0) > 0);
    requisitionData.status = hasUnfilled ? RequisitionStatus.部分领料 : RequisitionStatus.已领料;

    const request = this.isEdit() && this.requisitionId()
      ? this.productionService.updateRequisition(this.requisitionId()!, requisitionData)
      : this.productionService.createRequisition(requisitionData);

    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/production/requisitions']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('保存领料单失败', err);
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
    if (!this.formData.requisitionDate) {
      alert('请选择领料日期');
      return false;
    }
    if (this.items().length === 0) {
      alert('请添加至少一种原料');
      return false;
    }
    return true;
  }

  goBack(): void {
    this.router.navigate(['/production/requisitions']);
  }
}
