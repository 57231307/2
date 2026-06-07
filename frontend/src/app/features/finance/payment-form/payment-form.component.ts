import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { FinanceService } from '../services/finance.service';
import { PaymentType } from '../models/finance.model';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">
          {{ isReceivable() ? '收款' : '付款' }}
        </h1>
        <button routerLink="/finance/payments" class="btn-secondary">
          返回列表
        </button>
      </div>

      <div class="card p-6">
        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                单据编号 <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="formData.paymentNo"
                name="paymentNo"
                required
                class="input-field w-full"
                placeholder="系统自动生成"
                disabled
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ isReceivable() ? '客户' : '供应商' }} <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="formData.counterpartyName"
                name="counterpartyName"
                required
                class="input-field w-full"
                [placeholder]="isReceivable() ? '请输入客户名称' : '请输入供应商名称'"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                金额 <span class="text-red-500">*</span>
              </label>
              <input
                type="number"
                [(ngModel)]="formData.amount"
                name="amount"
                required
                min="0"
                step="0.01"
                class="input-field w-full"
                placeholder="请输入金额"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                结算账户 <span class="text-red-500">*</span>
              </label>
              <select
                [(ngModel)]="formData.accountId"
                name="accountId"
                required
                class="input-field w-full"
              >
                <option value="">请选择结算账户</option>
                <option value="cash">现金账户</option>
                <option value="bank">银行账户</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                收付款日期 <span class="text-red-500">*</span>
              </label>
              <input
                type="date"
                [(ngModel)]="formData.paymentDate"
                name="paymentDate"
                required
                class="input-field w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">关联单据类型</label>
              <select
                [(ngModel)]="formData.relatedDocumentType"
                name="relatedDocumentType"
                class="input-field w-full"
              >
                <option value="">无</option>
                @if (isReceivable()) {
                  <option value="SALE_ORDER">销售订单</option>
                  <option value="DELIVERY">送货单</option>
                } @else {
                  <option value="PURCHASE_ORDER">采购订单</option>
                  <option value="GOODS_RECEIPT">收货单</option>
                }
              </select>
            </div>
          </div>

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

          <div class="flex justify-end gap-4 pt-6 border-t">
            <button type="button" routerLink="/finance/payments" class="btn-secondary">
              取消
            </button>
            <button type="submit" class="btn-primary" [disabled]="submitting()">
              {{ submitting() ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentFormComponent implements OnInit {
  private financeService = inject(FinanceService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly PaymentType = PaymentType;
  readonly typeReceivable = 'RECEIVE';

  submitting = signal(false);
  isReceivable = signal(true);

  formData: {
    paymentNo: string;
    type: string;
    amount: number;
    paymentDate: string;
    accountId: string;
    counterpartyId: string;
    counterpartyName: string;
    relatedDocumentType?: string;
    relatedDocumentId?: string;
    notes?: string;
  } = {
    paymentNo: '',
    type: 'RECEIVE',
    amount: 0,
    paymentDate: '',
    accountId: '',
    counterpartyId: '',
    counterpartyName: '',
    relatedDocumentType: '',
    notes: ''
  };

  ngOnInit(): void {
    const type = this.route.snapshot.queryParamMap.get('type');
    if (type) {
      this.formData.type = type;
      this.isReceivable.set(type === 'RECEIVE');
    }
    const today = new Date();
    this.formData.paymentDate = today.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.formData.amount <= 0) {
      alert('请输入有效的金额');
      return;
    }

    this.submitting.set(true);

    this.financeService.createPayment({
      type: this.formData.type as PaymentType,
      amount: this.formData.amount,
      paymentDate: new Date(this.formData.paymentDate),
      accountId: this.formData.accountId,
      counterpartyId: this.formData.counterpartyId,
      relatedDocumentType: this.formData.relatedDocumentType || undefined,
      relatedDocumentId: this.formData.relatedDocumentId,
      notes: this.formData.notes || undefined
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/finance/payments']);
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('保存收付款记录失败', err);
      }
    });
  }
}