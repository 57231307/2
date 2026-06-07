import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SupplierService } from '../services/supplier.service';
import { 供应商 } from '../models/supplier.model';
import { 供应商类型, 供应商状态 } from '../enums/supplier.enum';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="isEdit() ? '编辑供应商' : '新增供应商'" [subtitle]="isEdit() ? '修改供应商信息' : '创建新供应商'">
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
            <label class="erp-label">供应商编码 <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.code" name="code" required
              [disabled]="isEdit()"
              class="erp-input w-full" 
              [class.opacity-50]="isEdit()"
              placeholder="请输入供应商编码" />
          </div>

          <div>
            <label class="erp-label">供应商名称 <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.name" name="name" required
              class="erp-input w-full" placeholder="请输入供应商名称" />
          </div>

          <div>
            <label class="erp-label">供应商类型 <span class="text-red-500">*</span></label>
            <select [(ngModel)]="formData.type" name="type" required
              class="erp-input w-full">
              <option value="">请选择供应商类型</option>
              <option [value]="'YARN'">{{ supplierTypeLabel['YARN'] }}</option>
              <option [value]="'DYE_CHEMICAL'">{{ supplierTypeLabel['DYE_CHEMICAL'] }}</option>
              <option [value]="'FABRIC_PROCESSING'">{{ supplierTypeLabel['FABRIC_PROCESSING'] }}</option>
            </select>
          </div>

          <div>
            <label class="erp-label">状态</label>
            <select [(ngModel)]="formData.status" name="status"
              class="erp-input w-full">
              <option [value]="'ENABLED'">{{ supplierStatusLabel['ENABLED'] }}</option>
              <option [value]="'DISABLED'">{{ supplierStatusLabel['DISABLED'] }}</option>
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
export class SupplierFormComponent implements OnInit {
  private readonly supplierService = inject(SupplierService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly supplierType = 供应商类型;
  readonly supplierStatus = 供应商状态;

  readonly supplierTypeLabel: Record<string, string> = {
    'YARN': '纱线',
    'DYE_CHEMICAL': '染料化工',
    'FABRIC_PROCESSING': '面料加工'
  };

  readonly supplierStatusLabel: Record<string, string> = {
    'ENABLED': '启用',
    'DISABLED': '停用'
  };

  isEdit = signal(false);
  isSaving = signal(false);
  supplierId = signal<string | null>(null);

  formData: Partial<供应商> = {
    code: '',
    name: '',
    type: '' as unknown as 供应商类型,
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    status: 供应商状态.ENABLED,
    notes: ''
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.supplierId.set(id);
      this.loadSupplier(id);
    }
  }

  loadSupplier(id: string) {
    this.supplierService.获取供应商ById(id).subscribe({
      next: (supplier) => {
        this.formData = { ...supplier };
      }
    });
  }

  onSubmit() {
    if (!this.formData.code || !this.formData.name || !this.formData.type) {
      return;
    }

    this.isSaving.set(true);

    const supplierData = this.formData as Omit<供应商, 'id'>;

    if (this.isEdit() && this.supplierId()) {
      this.supplierService.更新供应商(this.supplierId()!, supplierData).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.goBack();
        },
        error: () => {
          this.isSaving.set(false);
        }
      });
    } else {
      this.supplierService.创建供应商(supplierData).subscribe({
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
