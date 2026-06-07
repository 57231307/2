import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerContactService } from '../../services/customer-contact.service';
import { CustomerService } from '../../services/customer.service';
import { 客户联系人 } from '../../models/customer-contact.model';
import { 客户 } from '../../models/customer.model';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? '编辑联系人' : '新建联系人' }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ isEdit ? '修改联系人信息' : '创建新的客户联系人' }}</p>
        </div>
        <button (click)="goBack()" class="btn-secondary">
          返回列表
        </button>
      </div>

      <div class="card max-w-2xl">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">所属客户 <span class="text-red-500">*</span></label>
            <select
              [(ngModel)]="formData.customerId"
              [disabled]="isEdit"
              class="input-field w-full">
              <option value="">请选择客户</option>
              @for (customer of customers(); track customer.id) {
                <option [value]="customer.id">{{ customer.name }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">联系人姓名 <span class="text-red-500">*</span></label>
            <input
              type="text"
              [(ngModel)]="formData.contactName"
              class="input-field w-full"
              placeholder="请输入联系人姓名"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">职务</label>
            <input
              type="text"
              [(ngModel)]="formData.position"
              class="input-field w-full"
              placeholder="如：采购经理"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">电话</label>
            <input
              type="text"
              [(ngModel)]="formData.phone"
              class="input-field w-full"
              placeholder="请输入电话号码"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input
              type="email"
              [(ngModel)]="formData.email"
              class="input-field w-full"
              placeholder="请输入邮箱地址"
            />
          </div>

          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              [(ngModel)]="formData.isDefault"
              class="w-4 h-4 rounded border-gray-300"
            />
            <label for="isDefault" class="text-sm font-medium text-gray-700">设为默认联系人</label>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea
              [(ngModel)]="formData.remark"
              rows="3"
              class="input-field w-full"
              placeholder="备注信息"
            ></textarea>
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <button (click)="goBack()" class="btn-secondary">
              取消
            </button>
            <button (click)="save()" class="btn-primary">
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ContactFormComponent implements OnInit {
  private readonly contactService = inject(CustomerContactService);
  private readonly customerService = inject(CustomerService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isEdit = false;
  contactId: string | null = null;
  customers = signal<客户[]>([]);

  formData: Partial<客户联系人> = {
    customerId: '',
    contactName: '',
    position: '',
    phone: '',
    email: '',
    isDefault: false,
    remark: ''
  };

  ngOnInit() {
    this.loadCustomers();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.contactId = id;
      this.isEdit = true;
      this.loadContact(id);
    }
  }

  loadCustomers() {
    this.customerService.获取客户列表({ page: 1, pageSize: 100 }).subscribe({
      next: (result) => {
        this.customers.set(result.items);
      }
    });
  }

  loadContact(id: string) {
    this.contactService.获取联系人ById(id).subscribe({
      next: (contact) => {
        this.formData = {
          customerId: contact.customerId,
          contactName: contact.contactName,
          position: contact.position || '',
          phone: contact.phone || '',
          email: contact.email || '',
          isDefault: contact.isDefault,
          remark: contact.remark || ''
        };
      },
      error: (err) => {
        console.error('加载联系人失败', err);
      }
    });
  }

  save() {
    if (!this.formData.customerId || !this.formData.contactName) {
      alert('请填写必填项');
      return;
    }

    if (this.isEdit && this.contactId) {
      this.contactService.更新联系人(this.contactId, this.formData).subscribe({
        next: () => {
          this.goBack();
        },
        error: (err) => {
          console.error('更新联系人失败', err);
        }
      });
    } else {
      this.contactService.创建联系人(this.formData).subscribe({
        next: () => {
          this.goBack();
        },
        error: (err) => {
          console.error('创建联系人失败', err);
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/customer/contacts']);
  }
}
