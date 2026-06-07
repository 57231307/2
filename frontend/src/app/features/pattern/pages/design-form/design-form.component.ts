import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PatternService } from '../../services/pattern.service';
import { 花型设计, 花型设计状态, 花型, 花型设计查询参数 } from '../../models/pattern.model';

@Component({
  selector: 'app-design-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">
          {{ isEdit ? '编辑花型设计' : '新花型设计' }}
        </h1>
        <button
          (click)="goBack()"
          class="btn-secondary"
        >
          返回
        </button>
      </div>

      <div class="card">
        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- 基本信息 -->
          <div class="border-b pb-4">
            <h3 class="text-lg font-medium text-gray-800 mb-4">基本信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  关联花型
                </label>
                <select
                  [(ngModel)]="formData.patternId"
                  name="patternId"
                  (ngModelChange)="onPatternSelect()"
                  class="input-field w-full"
                  [disabled]="isEdit"
                >
                  <option value="">请选择花型（可选）</option>
                  @for (pattern of patterns(); track pattern.id) {
                    <option [value]="pattern.id">{{ pattern.code }} - {{ pattern.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  设计名称 <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.designName"
                  name="designName"
                  required
                  placeholder="请输入设计名称"
                  class="input-field w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  设计版本
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.designVersion"
                  name="designVersion"
                  placeholder="如：1.0"
                  class="input-field w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  设计日期 <span class="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  [(ngModel)]="designDate"
                  name="designDate"
                  required
                  class="input-field w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  设计人 <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.designer"
                  name="designer"
                  required
                  placeholder="请输入设计人姓名"
                  class="input-field w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  设计编号
                </label>
                <input
                  type="text"
                  [value]="designNo"
                  disabled
                  class="input-field w-full bg-gray-100"
                  placeholder="保存后自动生成"
                />
              </div>
            </div>
          </div>

          <!-- 设计图片 -->
          <div class="border-b pb-4">
            <h3 class="text-lg font-medium text-gray-800 mb-4">设计图片</h3>
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <input
                  type="text"
                  [(ngModel)]="newImageUrl"
                  name="newImageUrl"
                  placeholder="请输入图片URL"
                  class="input-field flex-1"
                />
                <button
                  type="button"
                  (click)="addImage()"
                  class="btn-secondary"
                >
                  添加图片
                </button>
              </div>
              @if (formData.designImages && formData.designImages.length > 0) {
                <div class="grid grid-cols-4 gap-4">
                  @for (img of formData.designImages; track $index; let i = $index) {
                    <div class="relative group">
                      <img [src]="img" alt="设计图片" class="w-full h-32 object-cover rounded-lg border" />
                      <button
                        type="button"
                        (click)="removeImage(i)"
                        class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  暂无设计图片
                </div>
              }
            </div>
          </div>

          <!-- 设计说明 -->
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-4">设计说明</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">设计描述</label>
                <textarea
                  [(ngModel)]="formData.description"
                  name="description"
                  rows="4"
                  class="input-field w-full"
                  placeholder="请输入设计描述"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  [(ngModel)]="formData.remark"
                  name="remark"
                  rows="2"
                  class="input-field w-full"
                  placeholder="请输入备注信息"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              (click)="goBack()"
              class="btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              [disabled]="isSubmitting()"
              class="btn-primary disabled:opacity-50"
            >
              {{ isSubmitting() ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class DesignFormComponent implements OnInit {
  private readonly patternService = inject(PatternService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isEdit = false;
  designId: string | null = null;
  designNo: string = '';
  designDate: string = '';
  newImageUrl: string = '';

  isSubmitting = signal(false);
  patterns = signal<花型[]>([]);

  formData: {
    patternId: string;
    designName: string;
    designVersion: string;
    designer: string;
    description: string;
    designImages: string[];
    remark: string;
  } = {
    patternId: '',
    designName: '',
    designVersion: '1.0',
    designer: '',
    description: '',
    designImages: [],
    remark: '',
  };

  ngOnInit(): void {
    this.loadPatterns();
    this.designDate = new Date().toISOString().split('T')[0];

    this.designId = this.route.snapshot.paramMap.get('id');
    if (this.designId) {
      this.isEdit = true;
      this.loadDesign(this.designId);
    }
  }

  loadPatterns(): void {
    this.patternService.获取花型列表({ page: 1, pageSize: 100 }).subscribe({
      next: (result) => {
        this.patterns.set(result.items);
      },
      error: (err) => {
        console.error('加载花型列表失败', err);
      },
    });
  }

  loadDesign(id: string): void {
    this.patternService.获取花型设计ById(id).subscribe({
      next: (design) => {
        this.formData.patternId = design.patternId || '';
        this.formData.designName = design.designName;
        this.formData.designVersion = design.designVersion;
        this.formData.designer = design.designer;
        this.formData.description = design.description || '';
        this.formData.designImages = design.designImages || [];
        this.formData.remark = design.remark || '';
        this.designNo = design.designNo;
        this.designDate = design.designDate
          ? new Date(design.designDate).toISOString().split('T')[0]
          : '';
      },
      error: (err) => {
        console.error('加载设计详情失败', err);
      },
    });
  }

  onPatternSelect(): void {
    // 花型选择变化时的处理
  }

  addImage(): void {
    if (this.newImageUrl && this.newImageUrl.trim()) {
      if (!this.formData.designImages) {
        this.formData.designImages = [];
      }
      this.formData.designImages.push(this.newImageUrl.trim());
      this.newImageUrl = '';
    }
  }

  removeImage(index: number): void {
    this.formData.designImages.splice(index, 1);
  }

  onSubmit(): void {
    if (!this.formData.designName || !this.formData.designer) {
      alert('请填写必填项');
      return;
    }

    this.isSubmitting.set(true);

    // 构建提交数据，将designDate从字符串转换为Date对象
    const submitData: Partial<花型设计> = {
      patternId: this.formData.patternId || undefined,
      designName: this.formData.designName,
      designVersion: this.formData.designVersion,
      designer: this.formData.designer,
      description: this.formData.description || undefined,
      designImages: this.formData.designImages,
      remark: this.formData.remark || undefined,
      designDate: new Date(this.designDate),
    };

    const request = this.isEdit && this.designId
      ? this.patternService.更新花型设计(this.designId, submitData)
      : this.patternService.创建花型设计(submitData);

    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/pattern/designs']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('保存设计失败', err);
        alert('保存失败，请重试');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/pattern/designs']);
  }
}
