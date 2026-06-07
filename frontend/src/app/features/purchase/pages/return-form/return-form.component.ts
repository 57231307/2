import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PurchaseService } from '../../services/purchase.service';
import {
  GoodsReceipt,
  GoodsReceiptItem,
  PurchaseReturn,
  PurchaseReturnItem,
  PurchaseReturnStatus,
} from '../../models/purchase.model';

@Component({
  selector: 'app-return-form',
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">新建退货单</h1>
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
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">关联入库单 <span class="text-red-500">*</span></label>
              <select
                formControlName="receiptId"
                (change)="onReceiptChange()"
                class="input-field w-full"
              >
                <option value="">请选择入库单</option>
                @for (receipt of receipts(); track receipt.id) {
                  <option [value]="receipt.id">{{ receipt.receiptNo }} - {{ receipt.warehouseName }}</option>
                }
              </select>
              @if (form.get('receiptId')?.invalid && form.get('receiptId')?.touched) {
                <span class="text-red-500 text-sm">请选择入库单</span>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">退货日期 <span class="text-red-500">*</span></label>
              <input
                type="date"
                formControlName="returnDate"
                class="input-field w-full"
              />
              @if (form.get('returnDate')?.invalid && form.get('returnDate')?.touched) {
                <span class="text-red-500 text-sm">请选择退货日期</span>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">退货原因 <span class="text-red-500">*</span></label>
              <select
                formControlName="reason"
                class="input-field w-full"
              >
                <option value="">请选择退货原因</option>
                <option value="质量问题">质量问题</option>
                <option value="数量不符">数量不符</option>
                <option value="颜色/规格不符">颜色/规格不符</option>
                <option value="延迟交货">延迟交货</option>
                <option value="其他">其他</option>
              </select>
              @if (form.get('reason')?.invalid && form.get('reason')?.touched) {
                <span class="text-red-500 text-sm">请选择退货原因</span>
              }
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <input
              type="text"
              formControlName="notes"
              placeholder="可选"
              class="input-field w-full"
            />
          </div>
        </div>

        <!-- 退货明细 -->
        <div class="card mb-4">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">退货明细</h2>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600 w-12">#</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">产品</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">颜色</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">缸号</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">匹号</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">入库数量</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">退货数量</th>
                  <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">单位</th>
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
                    <td class="px-4 py-3 text-sm text-gray-600">{{ item.dyeLotNo || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ item.pieceNo || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 text-right">{{ item.receiptQuantity | number: '1.2-2' }}</td>
                    <td class="px-4 py-3">
                      <input
                        type="number"
                        [value]="item.returnQuantity"
                        (input)="onQuantityChange(i, $event)"
                        min="0"
                        [max]="item.receiptQuantity"
                        step="0.01"
                        class="input-field w-full text-sm text-right"
                      />
                    </td>
                    <td class="px-4 py-3 text-center text-sm text-gray-600">{{ item.unit }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                      请先选择关联的入库单
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
export class ReturnFormComponent implements OnInit {
  private readonly purchaseService = inject(PurchaseService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  submitting = signal(false);

  receipts = signal<GoodsReceipt[]>([]);
  selectedReceipt = signal<GoodsReceipt | null>(null);
  items = signal<PurchaseReturnItem[]>([]);

  form = new FormGroup({
    receiptId: new FormControl(''),
    returnDate: new FormControl(''),
    reason: new FormControl(''),
    notes: new FormControl(''),
  });

  ngOnInit(): void {
    this.loadReceipts();
    this.setDefaultDate();
  }

  setDefaultDate(): void {
    const today = new Date().toISOString().split('T')[0];
    this.form.patchValue({ returnDate: today });
  }

  loadReceipts(): void {
    this.purchaseService.getReceipts({ page: 1, pageSize: 100 }).subscribe({
      next: (result) => {
        const validReceipts = result.items.filter(
          r => r.status === 'received' || r.status === 'partial'
        );
        this.receipts.set(validReceipts);
      },
      error: (err) => {
        console.error('加载入库单列表失败', err);
      },
    });
  }

  onReceiptChange(): void {
    const receiptId = this.form.get('receiptId')?.value;
    if (receiptId) {
      this.loadReceiptItems(receiptId);
    } else {
      this.items.set([]);
      this.selectedReceipt.set(null);
    }
  }

  loadReceiptItems(receiptId: string): void {
    this.purchaseService.getReceipt(receiptId).subscribe({
      next: (receipt) => {
        this.selectedReceipt.set(receipt);
        const items: PurchaseReturnItem[] = receipt.items.map(item => ({
          id: '',
          orderItemId: item.orderItemId,
          productId: item.productId,
          productName: item.productName,
          colorVariantId: item.colorVariantId,
          colorCode: item.colorCode,
          colorName: item.colorName,
          batchId: item.batchId,
          dyeLotNo: item.dyeLotNo,
          pieceNo: item.pieceNo,
          receiptQuantity: item.receiptQuantity,
          returnQuantity: 0,
          unit: item.unit,
        }));
        this.items.set(items);
      },
      error: (err) => {
        console.error('加载入库单详情失败', err);
      },
    });
  }

  onQuantityChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const quantity = parseFloat(input.value) || 0;

    this.items.update(items => {
      const updated = [...items];
      updated[index] = { ...updated[index], returnQuantity: quantity };
      return updated;
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.items().length === 0) {
      return;
    }

    const validItems = this.items().filter(item => item.returnQuantity > 0);
    if (validItems.length === 0) {
      alert('请至少填写一项退货数量');
      return;
    }

    this.submitting.set(true);

    const formValue = this.form.value;
    const receipt = this.selectedReceipt();

    const purchaseReturn: Partial<PurchaseReturn> = {
      receiptId: formValue.receiptId!,
      receiptNo: receipt?.receiptNo || '',
      orderId: receipt?.orderId || '',
      orderNo: receipt?.orderNo || '',
      returnDate: new Date(formValue.returnDate!),
      reason: formValue.reason!,
      notes: formValue.notes || '',
      items: validItems,
      status: PurchaseReturnStatus.待处理,
    };

    this.purchaseService.createReturn(purchaseReturn).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/purchase/returns']);
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('保存退货单失败', err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/purchase/returns']);
  }
}
