import { Component, inject, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SaleService } from '../../services/sale.service';
import { SaleReturn, SaleReturnItem, DeliveryNote, DeliveryNoteItem } from '../../models/sale.model';

@Component({
  selector: 'app-return-edit',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">创建退货单</h1>
        <button (click)="goBack()" class="btn-secondary">返回</button>
      </div>

      <form [formGroup]="returnForm" (ngSubmit)="onSubmit()">
        <!-- 基本信息 -->
        <div class="card mb-4">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">原发货单 <span class="text-red-500">*</span></label>
              <select
                formControlName="deliveryNoteId"
                (change)="onDeliveryNoteChange()"
                class="input-field w-full"
              >
                <option value="">请选择发货单</option>
                @for (delivery of deliveryNotes(); track delivery.id) {
                  <option [value]="delivery.id">
                    {{ delivery.deliveryNo }} - {{ delivery.orderNo }}
                  </option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">退货日期 <span class="text-red-500">*</span></label>
              <input
                type="date"
                formControlName="returnDate"
                class="input-field w-full"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">退货原因 <span class="text-red-500">*</span></label>
              <textarea
                formControlName="reason"
                rows="3"
                placeholder="请输入退货原因"
                class="input-field w-full"
              ></textarea>
            </div>
            <div class="md:col-span-2">
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

        <!-- 退货明细 -->
        <div class="card mb-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-800">退货明细</h2>
            <button
              type="button"
              (click)="addItem()"
              class="btn-primary text-sm"
              [disabled]="!selectedDeliveryNote()"
            >
              添加退货项
            </button>
          </div>

          @if (!selectedDeliveryNote()) {
            <div class="text-center py-8 text-gray-500">
              请先选择原发货单
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-left text-sm font-medium text-gray-600">颜色编号</th>
                    <th class="px-3 py-2 text-left text-sm font-medium text-gray-600">颜色名称</th>
                    <th class="px-3 py-2 text-left text-sm font-medium text-gray-600">批次（缸号/匹号）</th>
                    <th class="px-3 py-2 text-left text-sm font-medium text-gray-600">原发货数量</th>
                    <th class="px-3 py-2 text-left text-sm font-medium text-gray-600">退货数量</th>
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
                          @for (variant of deliveryColorVariants(); track variant) {
                            <option [value]="variant.colorVariantId">
                              {{ variant.colorCode }} - {{ variant.colorName }}
                            </option>
                          }
                        </select>
                      </td>
                      <td class="px-3 py-2 text-sm text-gray-600">
                        {{ item.get('colorName')?.value }}
                      </td>
                      <td class="px-3 py-2 text-sm text-gray-600">
                        {{ item.get('dyeLotNo')?.value }} / {{ item.get('pieceNo')?.value }}
                      </td>
                      <td class="px-3 py-2 text-sm text-gray-600">
                        {{ getOriginalQuantity(i) }}
                      </td>
                      <td class="px-3 py-2">
                        <input
                          type="number"
                          formControlName="returnQuantity"
                          [max]="getOriginalQuantity(i)"
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
                请添加退货明细
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
            [disabled]="returnForm.invalid || items.length === 0"
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
export class ReturnEditComponent {
  private readonly saleService = inject(SaleService);
  private readonly router = inject(Router);

  deliveryNotes = signal<DeliveryNote[]>([]);
  selectedDeliveryNote = signal<DeliveryNote | null>(null);
  deliveryColorVariants = signal<(DeliveryNoteItem & { originalQuantity: number })[]>([]);

  returnForm = new FormGroup({
    deliveryNoteId: new FormControl('', Validators.required),
    deliveryNoteNo: new FormControl(''),
    orderId: new FormControl(''),
    orderNo: new FormControl(''),
    returnDate: new FormControl(this.formatDate(new Date()), Validators.required),
    reason: new FormControl('', Validators.required),
    notes: new FormControl(''),
    items: new FormArray([]),
  });

  get items(): FormArray {
    return this.returnForm.get('items') as FormArray;
  }

  constructor() {
    effect(() => {
      this.loadDeliveryNotes();
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  loadDeliveryNotes(): void {
    this.saleService.getDeliveryNotes({ page: 1, pageSize: 100, status: 'shipped' } as any).subscribe({
      next: (result) => {
        this.deliveryNotes.set(result.items);
      },
    });
  }

  onDeliveryNoteChange(): void {
    const deliveryNoteId = this.returnForm.get('deliveryNoteId')?.value;
    if (deliveryNoteId) {
      const delivery = this.deliveryNotes().find((d) => d.id === deliveryNoteId);
      if (delivery) {
        this.selectedDeliveryNote.set(delivery);
        this.returnForm.patchValue({
          deliveryNoteNo: delivery.deliveryNo,
          orderId: delivery.orderId,
          orderNo: delivery.orderNo,
        });

        // 提取颜色变体信息
        const variants = delivery.items.map((item) => ({
          ...item,
          originalQuantity: item.deliveryQuantity,
        }));
        this.deliveryColorVariants.set(variants);
      }
    } else {
      this.selectedDeliveryNote.set(null);
      this.deliveryColorVariants.set([]);
    }
  }

  onColorVariantChange(index: number): void {
    const colorVariantId = this.items.at(index).get('colorVariantId')?.value;
    if (colorVariantId) {
      const variant = this.deliveryColorVariants().find(
        (v) => v.colorVariantId === colorVariantId
      );
      if (variant) {
        this.items.at(index).patchValue({
          colorCode: variant.colorCode,
          colorName: variant.colorName,
          dyeLotNo: variant.dyeLotNo,
          pieceNo: variant.pieceNo,
        });
      }
    }
  }

  getOriginalQuantity(index: number): number {
    const colorVariantId = this.items.at(index).get('colorVariantId')?.value;
    if (colorVariantId) {
      const variant = this.deliveryColorVariants().find(
        (v) => v.colorVariantId === colorVariantId
      );
      return variant?.originalQuantity || 0;
    }
    return 0;
  }

  addItem(): void {
    const itemGroup = new FormGroup({
      colorVariantId: new FormControl('', Validators.required),
      colorCode: new FormControl(''),
      colorName: new FormControl(''),
      dyeLotNo: new FormControl(''),
      pieceNo: new FormControl(''),
      returnQuantity: new FormControl(1, [Validators.required, Validators.min(1)]),
    });
    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  onSubmit(): void {
    if (this.returnForm.invalid) {
      return;
    }

    const formValue = this.returnForm.value;

    const returnOrder: Partial<SaleReturn> = {
      deliveryNoteId: formValue.deliveryNoteId!,
      deliveryNoteNo: formValue.deliveryNoteNo!,
      orderId: formValue.orderId!,
      orderNo: formValue.orderNo!,
      returnDate: new Date(formValue.returnDate!),
      reason: formValue.reason!,
      notes: formValue.notes || '',
      items: this.items.controls.map((item) => ({
        id: '',
        colorVariantId: item.get('colorVariantId')?.value || '',
        colorCode: item.get('colorCode')?.value || '',
        colorName: item.get('colorName')?.value || '',
        returnQuantity: item.get('returnQuantity')?.value || 0,
      })),
    };

    this.saleService.createReturn(returnOrder).subscribe({
      next: () => {
        this.router.navigate(['/sales/returns']);
      },
      error: (err) => {
        console.error('创建退货单失败', err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/sales/returns']);
  }
}
