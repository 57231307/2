import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PatternService } from '../../services/pattern.service';
import { 花型设计, 花型设计状态 } from '../../models/pattern.model';

@Component({
  selector: 'app-design-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">花型设计详情</h1>
        <div class="flex gap-3">
          <button
            (click)="goBack()"
            class="btn-secondary"
          >
            返回
          </button>
          @if (design()?.status === statusDraft) {
            <button
              (click)="editDesign()"
              class="btn-primary"
            >
              编辑
            </button>
            <button
              (click)="submitForReview()"
              class="btn-primary"
            >
              提交审核
            </button>
          }
          @if (design()?.status === statusPending) {
            <button
              (click)="approveDesign()"
              class="btn-primary"
            >
              审核通过
            </button>
            <button
              (click)="showRejectDialog.set(true)"
              class="btn-secondary text-red-600"
            >
              审核驳回
            </button>
          }
          @if (design()?.status === statusApproved) {
            <button
              (click)="archiveDesign()"
              class="btn-primary"
            >
              归档
            </button>
          }
        </div>
      </div>

      @if (design(); as d) {
        <div class="space-y-6">
          <!-- 基本信息 -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-800 mb-4">基本信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm text-gray-500">设计编号</label>
                <p class="mt-1 text-gray-800">{{ d.designNo }}</p>
              </div>
              <div>
                <label class="block text-sm text-gray-500">设计名称</label>
                <p class="mt-1 text-gray-800">{{ d.designName }}</p>
              </div>
              <div>
                <label class="block text-sm text-gray-500">设计版本</label>
                <p class="mt-1 text-gray-800">{{ d.designVersion }}</p>
              </div>
              <div>
                <label class="block text-sm text-gray-500">关联花型</label>
                <p class="mt-1 text-gray-800">
                  @if (d.patternName) {
                    {{ d.patternName }}
                    @if (d.patternCode) {
                      ({{ d.patternCode }})
                    }
                  } @else {
                    -
                  }
                </p>
              </div>
              <div>
                <label class="block text-sm text-gray-500">设计人</label>
                <p class="mt-1 text-gray-800">{{ d.designer }}</p>
              </div>
              <div>
                <label class="block text-sm text-gray-500">设计日期</label>
                <p class="mt-1 text-gray-800">{{ d.designDate | date: 'yyyy-MM-dd' }}</p>
              </div>
              <div>
                <label class="block text-sm text-gray-500">状态</label>
                <p class="mt-1">
                  <span [class]="getStatusClass(d.status)">
                    {{ getStatusText(d.status) }}
                  </span>
                </p>
              </div>
              @if (d.auditor) {
                <div>
                  <label class="block text-sm text-gray-500">审核人</label>
                  <p class="mt-1 text-gray-800">{{ d.auditor }}</p>
                </div>
              }
              @if (d.auditTime) {
                <div>
                  <label class="block text-sm text-gray-500">审核时间</label>
                  <p class="mt-1 text-gray-800">{{ d.auditTime | date: 'yyyy-MM-dd HH:mm' }}</p>
                </div>
              }
            </div>
          </div>

          <!-- 设计图片 -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-800 mb-4">设计图片</h3>
            @if (d.designImages && d.designImages.length > 0) {
              <div class="grid grid-cols-4 gap-4">
                @for (img of d.designImages; track $index) {
                  <img [src]="img" alt="设计图片" class="w-full h-48 object-cover rounded-lg border" />
                }
              </div>
            } @else {
              <div class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                暂无设计图片
              </div>
            }
          </div>

          <!-- 设计说明 -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-800 mb-4">设计说明</h3>
            <div class="space-y-4">
              @if (d.description) {
                <div>
                  <label class="block text-sm text-gray-500">设计描述</label>
                  <p class="mt-1 text-gray-800 whitespace-pre-wrap">{{ d.description }}</p>
                </div>
              }
              @if (d.auditRemark) {
                <div>
                  <label class="block text-sm text-gray-500">审核说明</label>
                  <p class="mt-1 text-gray-800 whitespace-pre-wrap">{{ d.auditRemark }}</p>
                </div>
              }
              @if (d.remark) {
                <div>
                  <label class="block text-sm text-gray-500">备注</label>
                  <p class="mt-1 text-gray-800 whitespace-pre-wrap">{{ d.remark }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-8 text-gray-500">
          加载中...
        </div>
      }

      <!-- 驳回对话框 -->
      @if (showRejectDialog()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 w-96">
            <h3 class="text-lg font-semibold mb-4">审核驳回</h3>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">驳回原因</label>
              <textarea
                [(ngModel)]="rejectReason"
                rows="3"
                class="input-field w-full"
                placeholder="请输入驳回原因"
              ></textarea>
            </div>
            <div class="flex justify-end gap-3">
              <button
                (click)="showRejectDialog.set(false)"
                class="btn-secondary"
              >
                取消
              </button>
              <button
                (click)="confirmReject()"
                class="btn-primary text-red-600"
              >
                确认驳回
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DesignDetailComponent implements OnInit {
  private readonly patternService = inject(PatternService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly statusDraft = 花型设计状态.草稿;
  readonly statusPending = 花型设计状态.待审核;
  readonly statusApproved = 花型设计状态.已审核;
  readonly statusArchived = 花型设计状态.已归档;

  design = signal<花型设计 | null>(null);
  showRejectDialog = signal(false);
  rejectReason: string = '';

  private designId: string | null = null;

  ngOnInit(): void {
    this.designId = this.route.snapshot.paramMap.get('id');
    if (this.designId) {
      this.loadDesign(this.designId);
    }
  }

  loadDesign(id: string): void {
    this.patternService.获取花型设计ById(id).subscribe({
      next: (design) => {
        this.design.set(design);
      },
      error: (err) => {
        console.error('加载设计详情失败', err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/pattern/designs']);
  }

  editDesign(): void {
    if (this.designId) {
      this.router.navigate(['/pattern/designs', this.designId, 'edit']);
    }
  }

  submitForReview(): void {
    if (this.designId && confirm('确定要提交审核吗？')) {
      this.patternService.提交花型设计审核(this.designId).subscribe({
        next: (design) => {
          this.design.set(design);
        },
        error: (err) => {
          console.error('提交审核失败', err);
          alert('提交审核失败，请重试');
        },
      });
    }
  }

  approveDesign(): void {
    if (this.designId && confirm('确定要审核通过吗？')) {
      this.patternService.审核通过花型设计(this.designId).subscribe({
        next: (design) => {
          this.design.set(design);
        },
        error: (err) => {
          console.error('审核通过失败', err);
          alert('审核通过失败，请重试');
        },
      });
    }
  }

  confirmReject(): void {
    if (this.designId && this.rejectReason.trim()) {
      this.patternService.审核驳回花型设计(this.designId, this.rejectReason).subscribe({
        next: (design) => {
          this.design.set(design);
          this.showRejectDialog.set(false);
          this.rejectReason = '';
        },
        error: (err) => {
          console.error('审核驳回失败', err);
          alert('审核驳回失败，请重试');
        },
      });
    }
  }

  archiveDesign(): void {
    if (this.designId && confirm('确定要归档吗？')) {
      this.patternService.归档花型设计(this.designId).subscribe({
        next: (design) => {
          this.design.set(design);
        },
        error: (err) => {
          console.error('归档失败', err);
          alert('归档失败，请重试');
        },
      });
    }
  }

  getStatusClass(status: 花型设计状态): string {
    const classes: Record<string, string> = {
      [花型设计状态.草稿]: 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-600',
      [花型设计状态.待审核]: 'px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700',
      [花型设计状态.已审核]: 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
      [花型设计状态.已归档]: 'px-2 py-1 text-xs rounded bg-blue-100 text-blue-700',
    };
    return classes[status] || '';
  }

  getStatusText(status: 花型设计状态): string {
    return status;
  }
}
