import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { PatternService } from '../services/pattern.service';
import { 花型, 花型版权 } from '../models/pattern.model';
import { 花型风格, 花型用途, 花型状态, 版权状态, 续期状态 } from '../enums/pattern.enum';

@Component({
  selector: 'app-pattern-form',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="isEdit() ? '编辑花型' : '新增花型'" [subtitle]="isEdit() ? '修改花型信息' : '创建新花型'">
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
            <label class="erp-label">花型编码 <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.code" name="code" required
              [disabled]="isEdit()"
              class="erp-input w-full" 
              [class.opacity-50]="isEdit()"
              placeholder="请输入花型编码" />
          </div>

          <div>
            <label class="erp-label">花型名称 <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.name" name="name" required
              class="erp-input w-full" placeholder="请输入花型名称" />
          </div>

          <div>
            <label class="erp-label">风格 <span class="text-red-500">*</span></label>
            <select [(ngModel)]="formData.style" name="style" required
              class="erp-input w-full">
              <option value="">请选择风格</option>
              <option [value]="'SIMPLE'">{{ styleLabel['SIMPLE'] }}</option>
              <option [value]="'VINTAGE'">{{ styleLabel['VINTAGE'] }}</option>
              <option [value]="'ROMANTIC'">{{ styleLabel['ROMANTIC'] }}</option>
              <option [value]="'FASHION'">{{ styleLabel['FASHION'] }}</option>
              <option [value]="'ETHNIC'">{{ styleLabel['ETHNIC'] }}</option>
              <option [value]="'MODERN'">{{ styleLabel['MODERN'] }}</option>
            </select>
          </div>

          <div>
            <label class="erp-label">用途 <span class="text-red-500">*</span></label>
            <select [(ngModel)]="formData.usage" name="usage" required
              class="erp-input w-full">
              <option value="">请选择用途</option>
              <option [value]="'APPAREL'">{{ usageLabel['APPAREL'] }}</option>
              <option [value]="'HOME_TEXTILE'">{{ usageLabel['HOME_TEXTILE'] }}</option>
              <option [value]="'DECORATION'">{{ usageLabel['DECORATION'] }}</option>
              <option [value]="'OTHER'">{{ usageLabel['OTHER'] }}</option>
            </select>
          </div>

          <div>
            <label class="erp-label">分类</label>
            <input type="text" [(ngModel)]="formData.category" name="category"
              class="erp-input w-full" placeholder="请输入分类" />
          </div>

          <div>
            <label class="erp-label">状态</label>
            <select [(ngModel)]="formData.status" name="status"
              class="erp-input w-full">
              <option [value]="'ENABLED'">{{ statusLabel['ENABLED'] }}</option>
              <option [value]="'DISABLED'">{{ statusLabel['DISABLED'] }}</option>
            </select>
          </div>
        </div>

        <!-- 花型图片 -->
        <div>
          <label class="erp-label">花型图片</label>
          <div class="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            @for (url of formData.imageUrls || []; track $index; let i = $index) {
              <div class="relative group">
                <img [src]="url" alt="花型图片" class="w-full h-32 object-cover rounded-lg border" />
                <button type="button" (click)="removeImage(i)"
                  class="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  ×
                </button>
              </div>
            }
            <label class="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="mt-2 text-sm text-gray-500">上传图片</span>
              <input type="file" accept="image/*" multiple (change)="onImageUpload($event)" class="hidden" />
            </label>
          </div>
        </div>

        <!-- 版权信息 -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium mb-4">版权信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="erp-label">版权号</label>
              <input type="text" [(ngModel)]="copyrightForm.copyrightNo" name="copyrightNo"
                class="erp-input w-full" placeholder="请输入版权号" />
            </div>

            <div>
              <label class="erp-label">授权范围</label>
              <input type="text" [(ngModel)]="copyrightForm.authorizedScope" name="authorizedScope"
                class="erp-input w-full" placeholder="请输入授权范围" />
            </div>

            <div>
              <label class="erp-label">开始日期</label>
              <input type="date" [(ngModel)]="copyrightForm.startDate" name="startDate"
                class="erp-input w-full" />
            </div>

            <div>
              <label class="erp-label">结束日期</label>
              <input type="date" [(ngModel)]="copyrightForm.endDate" name="endDate"
                class="erp-input w-full" />
            </div>

            <div>
              <label class="erp-label">版权状态</label>
              <select [(ngModel)]="copyrightForm.status" name="copyrightStatus"
                class="erp-input w-full">
                <option [value]="copyrightStatus.VALID">{{ copyrightStatusLabel['VALID'] }}</option>
                <option [value]="copyrightStatus.EXPIRED">{{ copyrightStatusLabel['EXPIRED'] }}</option>
                <option [value]="copyrightStatus.PENDING">{{ copyrightStatusLabel['PENDING'] }}</option>
              </select>
            </div>

            <div>
              <label class="erp-label">续期状态</label>
              <select [(ngModel)]="copyrightForm.renewalStatus" name="renewalStatus"
                class="erp-input w-full">
                <option [value]="'NORMAL'">{{ renewalStatusLabel['NORMAL'] }}</option>
                <option [value]="'PENDING_RENEWAL'">{{ renewalStatusLabel['PENDING_RENEWAL'] }}</option>
                <option [value]="'RENEWED'">{{ renewalStatusLabel['RENEWED'] }}</option>
              </select>
            </div>
          </div>
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
export class PatternFormComponent implements OnInit {
  private readonly patternService = inject(PatternService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly patternStyle = 花型风格;
  readonly patternUsage = 花型用途;
  readonly patternStatus = 花型状态;
  readonly copyrightStatus = 版权状态;
  readonly renewalStatus = 续期状态;

  readonly styleLabel: Record<string, string> = {
    'SIMPLE': '简约',
    'VINTAGE': '复古',
    'ROMANTIC': '浪漫',
    'FASHION': '时尚',
    'ETHNIC': '民族',
    'MODERN': '现代'
  };

  readonly usageLabel: Record<string, string> = {
    'APPAREL': '服装',
    'HOME_TEXTILE': '家纺',
    'DECORATION': '装饰',
    'OTHER': '其他'
  };

  readonly statusLabel: Record<string, string> = {
    'ENABLED': '启用',
    'DISABLED': '停用'
  };

  readonly copyrightStatusLabel: Record<string, string> = {
    'VALID': '有效',
    'EXPIRED': '过期',
    'PENDING': '申请中'
  };

  readonly renewalStatusLabel: Record<string, string> = {
    'NORMAL': '正常',
    'PENDING_RENEWAL': '待续期',
    'RENEWED': '已续期'
  };

  isEdit = signal(false);
  isSaving = signal(false);
  patternId = signal<string | null>(null);

  formData: Partial<花型> = {
    code: '',
    name: '',
    style: '' as unknown as 花型风格,
    usage: '' as unknown as 花型用途,
    category: '',
    imageUrls: [],
    status: 'ENABLED' as 花型状态,
    usageCount: 0
  };

  copyrightForm: Partial<花型版权> = {
    copyrightNo: '',
    authorizedScope: '',
    startDate: undefined as unknown as Date,
    endDate: undefined as unknown as Date,
    status: 'VALID' as 版权状态,
    renewalStatus: 'NORMAL' as 续期状态
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.patternId.set(id);
      this.loadPattern(id);
    }
  }

  loadPattern(id: string) {
    this.patternService.获取花型ById(id).subscribe({
      next: (pattern) => {
        this.formData = { ...pattern };
        if (pattern.copyright) {
          this.copyrightForm = { ...pattern.copyright };
        }
      }
    });
  }

  onImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      // 模拟图片上传，实际应该调用上传API
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          if (!this.formData.imageUrls) {
            this.formData.imageUrls = [];
          }
          this.formData.imageUrls.push(url);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number) {
    this.formData.imageUrls?.splice(index, 1);
  }

  onSubmit() {
    if (!this.formData.code || !this.formData.name || !this.formData.style || !this.formData.usage) {
      return;
    }

    this.isSaving.set(true);

    // 构建版权信息
    if (this.copyrightForm.copyrightNo) {
      this.formData.copyright = {
        ...this.copyrightForm,
        patternId: this.patternId() || '',
        startDate: new Date(this.copyrightForm.startDate as unknown as string),
        endDate: new Date(this.copyrightForm.endDate as unknown as string)
      } as 花型版权;
    }

    const patternData = this.formData as Omit<花型, 'id'>;

    if (this.isEdit() && this.patternId()) {
      this.patternService.更新花型(this.patternId()!, patternData).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.goBack();
        },
        error: () => {
          this.isSaving.set(false);
        }
      });
    } else {
      this.patternService.创建花型(patternData).subscribe({
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
