import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { SystemService } from '../../services/system.service';

@Component({
  selector: 'app-position-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">
          {{ isEdit() ? '编辑岗位' : '新建岗位' }}
        </h1>
        <button (click)="goBack()" class="btn-secondary">
          返回
        </button>
      </div>

      <div class="card">
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">岗位编号 *</label>
              <input
                type="text"
                [(ngModel)]="formData.positionCode"
                [disabled]="isEdit()"
                class="input-field w-full"
                placeholder="请输入岗位编号"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">岗位名称 *</label>
              <input
                type="text"
                [(ngModel)]="formData.positionName"
                class="input-field w-full"
                placeholder="请输入岗位名称"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">所属部门</label>
              <select [(ngModel)]="formData.departmentId" class="input-field w-full">
                <option [ngValue]="null">无</option>
                @for (dept of departments(); track dept.id) {
                  <option [ngValue]="dept.id">{{ dept.departmentName }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">排序号</label>
              <input
                type="number"
                [(ngModel)]="formData.sortOrder"
                class="input-field w-full"
                placeholder="数值越小越靠前"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">岗位职责</label>
              <textarea
                [(ngModel)]="formData.jobResponsibilities"
                rows="4"
                class="input-field w-full"
                placeholder="请输入岗位职责描述"
              ></textarea>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">任职要求</label>
              <textarea
                [(ngModel)]="formData.requirements"
                rows="4"
                class="input-field w-full"
                placeholder="请输入任职要求"
              ></textarea>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <textarea
                [(ngModel)]="formData.remark"
                rows="2"
                class="input-field w-full"
                placeholder="请输入备注"
              ></textarea>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button (click)="goBack()" class="btn-secondary">取消</button>
            <button (click)="save()" class="btn-primary">保存</button>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PositionFormComponent implements OnInit {
  private systemService = inject(SystemService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = signal(false);
  departments = signal<any[]>([]);
  formData: any = {
    positionCode: '',
    positionName: '',
    departmentId: null,
    jobResponsibilities: '',
    requirements: '',
    sortOrder: 0,
    remark: ''
  };

  private positionId: string | null = null;

  ngOnInit(): void {
    this.loadDepartments();
    this.positionId = this.route.snapshot.paramMap.get('id');
    if (this.positionId) {
      this.isEdit.set(true);
      this.loadDetail(this.positionId);
    }
  }

  loadDepartments(): void {
    this.systemService.getActiveDepartments().subscribe({
      next: (result: any) => {
        this.departments.set(result.data || result || []);
      },
      error: (err) => console.error('加载部门列表失败', err)
    });
  }

  loadDetail(id: string): void {
    this.systemService.getPosition(id).subscribe({
      next: (data: any) => {
        this.formData = { ...data };
      },
      error: (err) => console.error('加载详情失败', err)
    });
  }

  save(): void {
    if (!this.formData.positionCode || !this.formData.positionName) {
      alert('请填写必填项');
      return;
    }

    const observable = this.isEdit()
      ? this.systemService.updatePosition(this.positionId!, this.formData)
      : this.systemService.createPosition(this.formData);

    observable.subscribe({
      next: () => {
        alert('保存成功');
        this.goBack();
      },
      error: (err) => {
        console.error('保存失败', err);
        alert('保存失败，请重试');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/system/positions']);
  }
}
