import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { CustomerService } from '../services/customer.service';
import { 客户 } from '../models/customer.model';
import { 客户类型, 客户状态 } from '../enums/customer.enum';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="isEdit() ? '编辑客户' : '新增客户'" [subtitle]="isEdit() ? '修改客户信息' : '创建新客户'">
      <div class="flex gap-2">
        <button (click)="goBack()" class="erp-btn erp-btn-secondary">
          返回
        </button>
      </div>
    </app-page-header>

    <div class="erp-card p-6">
      <form (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="erp-label">客户编码 <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.code" name="code" required
              [disabled]="isEdit()"
              class="erp-input w-full" 
              [class.opacity-50]="isEdit()"
              placeholder="请输入客户编码" />
          </div>

          <div>
            <label class="erp-label">客户名称 <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.name" name="name" required
              class="erp-input w-full" placeholder="请输入客户名称" />
          </div>

          <div>
            <label class="erp-label">客户类型 <span class="text-red-500">*</span></label>
            <select [(ngModel)]="formData.type" name="type" required
              class="erp-input w-full">
              <option value="">请选择客户类型</option>
              <option [value]="'BRAND'">{{ customerTypeLabel['BRAND'] }}</option>
              <option [value]="'TRADER'">{{ customerTypeLabel['TRADER'] }}</option>
              <option [value]="'RETAIL'">{{ customerTypeLabel['RETAIL'] }}</option>
            </select>
          </div>

          <div>
            <label class="erp-label">状态</label>
            <select [(ngModel)]="formData.status" name="status"
              class="erp-input w-full">
              <option [value]="'ENABLED'">{{ customerStatusLabel['ENABLED'] }}</option>
              <option [value]="'DISABLED'">{{ customerStatusLabel['DISABLED'] }}</option>
            </select>
          </div>

          <div>
            <label class="erp-label">联系人</label>
            <input type="text" [(ngModel)]="formData.contactPerson" name="contactPerson"
              class="erp-input w-full" placeholder="请输入联系人姓名" />
          </div>

          <div>
            <label class="erp-label">联系电话</label>
            <input type="text" [(ngModel)]="formData.phone" name="phone"
              class="erp-input w-full" placeholder="请输入联系电话" />
          </div>

          <div>
            <label class="erp-label">电子邮箱</label>
            <input type="email" [(ngModel)]="formData.email" name="email"
              class="erp-input w-full" placeholder="请输入电子邮箱" />
          </div>

          <div>
            <label class="erp-label">信用额度</label>
            <input type="number" [(ngModel)]="formData.creditLimit" name="creditLimit"
              class="erp-input w-full" placeholder="请输入信用额度" />
          </div>
        </div>

        <div>
          <label class="erp-label">地址</label>
          <input type="text" [(ngModel)]="formData.address" name="address"
            class="erp-input w-full" placeholder="请输入详细地址" />
        </div>

        <div>
          <label class="erp-label">备注</label>
          <textarea [(ngModel)]="formData.notes" name="notes" rows="3"
            class="erp-input w-full" placeholder="请输入备注信息"></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t">
          <button type="button" (click)="goBack()" class="erp-btn erp-btn-secondary">
            取消
          </button>
          <button type="submit" [disabled]="isSaving()"
            class="erp-btn erp-btn-primary">
            @if (isSaving()) {
              <span class="flex items-center gap-2">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                保存中...
              </span>
            } @else {
              保存
            }
          </button>
        </div>
      </form>
    </div>
  `
})
export class CustomerFormComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly customerType = 客户类型;
  readonly customerStatus = 客户状态;

  readonly customerTypeLabel: Record<string, string> = {
    'BRAND': '品牌商',
    'TRADER': '贸易商',
    'RETAIL': '散客'
  };

  readonly customerStatusLabel: Record<string, string> = {
    'ENABLED': '启用',
    'DISABLED': '停用'
  };

  isEdit = signal(false);
  isSaving = signal(false);
  customerId = signal<string | null>(null);

  formData: Partial<客户> = {
    code: '',
    name: '',
    type: '' as unknown as 客户类型,
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    status: 'ENABLED' as 客户状态,
    creditLimit: undefined,
    notes: ''
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.customerId.set(id);
      this.loadCustomer(id);
    }
  }

  loadCustomer(id: string) {
    this.customerService.获取客户ById(id).subscribe({
      next: (customer) => {
        this.formData = { ...customer };
      }
    });
  }

  onSubmit() {
    if (!this.formData.code || !this.formData.name || !this.formData.type) {
      return;
    }

    this.isSaving.set(true);

    const customerData = this.formData as Omit<客户, 'id'>;

    if (this.isEdit() && this.customerId()) {
      this.customerService.更新客户(this.customerId()!, customerData).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.goBack();
        },
        error: () => {
          this.isSaving.set(false);
        }
      });
    } else {
      this.customerService.创建客户(customerData).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.goBack();
        },
        error: () => {
          this.isSaving.set(false);
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
