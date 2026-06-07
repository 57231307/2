import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PurchaseService } from '../../services/purchase.service';
import {
  SupplierEvaluation,
  SupplierEvaluationLevel,
  EvaluationItemType,
  EvaluationItem,
} from '../../models/supplier-evaluation.model';
import { Supplier } from '../../models/purchase.model';

@Component({
  selector: 'app-supplier-evaluation-form',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">
          {{ isEdit ? '编辑供应商评估' : '新建供应商评估' }}
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
                  供应商 <span class="text-red-500">*</span>
                </label>
                <select
                  [(ngModel)]="formData.supplierId"
                  name="supplierId"
                  (ngModelChange)="onSupplierSelect()"
                  required
                  class="input-field w-full"
                  [disabled]="isEdit"
                >
                  <option value="">请选择供应商</option>
                  @for (supplier of suppliers(); track supplier.id) {
                    <option [value]="supplier.id">{{ supplier.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  评估日期 <span class="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  [(ngModel)]="evaluationDate"
                  name="evaluationDate"
                  required
                  class="input-field w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  评估人 <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.evaluator"
                  name="evaluator"
                  required
                  placeholder="请输入评估人姓名"
                  class="input-field w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  评估编号
                </label>
                <input
                  type="text"
                  [value]="evaluationNo"
                  disabled
                  class="input-field w-full bg-gray-100"
                  placeholder="保存后自动生成"
                />
              </div>
            </div>
          </div>

          <!-- 评分信息 -->
          <div class="border-b pb-4">
            <h3 class="text-lg font-medium text-gray-800 mb-4">评分信息（1-10分）</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  质量评分 <span class="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  [(ngModel)]="formData.qualityScore"
                  name="qualityScore"
                  min="1"
                  max="10"
                  step="0.1"
                  required
                  class="input-field w-full"
                  placeholder="1-10分"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  交期评分 <span class="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  [(ngModel)]="formData.deliveryScore"
                  name="deliveryScore"
                  min="1"
                  max="10"
                  step="0.1"
                  required
                  class="input-field w-full"
                  placeholder="1-10分"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  价格评分 <span class="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  [(ngModel)]="formData.priceScore"
                  name="priceScore"
                  min="1"
                  max="10"
                  step="0.1"
                  required
                  class="input-field w-full"
                  placeholder="1-10分"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  服务评分 <span class="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  [(ngModel)]="formData.serviceScore"
                  name="serviceScore"
                  min="1"
                  max="10"
                  step="0.1"
                  required
                  class="input-field w-full"
                  placeholder="1-10分"
                />
              </div>
            </div>

            <!-- 综合评分显示 -->
            <div class="mt-4 p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">综合评分：</span>
                <span class="text-2xl font-bold text-primary-600">{{ totalScore | number: '1.1-1' }}</span>
              </div>
              <div class="flex items-center justify-between mt-2">
                <span class="text-gray-600">评估等级：</span>
                <span [class]="getLevelClass(currentLevel)" class="px-3 py-1 rounded text-sm font-medium">
                  {{ currentLevel }}级
                </span>
              </div>
            </div>
          </div>

          <!-- 评估明细 -->
          <div class="border-b pb-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-800">评估明细（可选）</h3>
              <button
                type="button"
                (click)="addItem()"
                class="btn-secondary text-sm"
              >
                添加明细
              </button>
            </div>

            @if (formData.items && formData.items.length > 0) {
              <div class="space-y-3">
                @for (item of formData.items; track $index; let i = $index) {
                  <div class="p-4 bg-gray-50 rounded-lg">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label class="block text-xs text-gray-500 mb-1">项目名称</label>
                        <input
                          type="text"
                          [(ngModel)]="item.itemName"
                          [name]="'itemName' + i"
                          class="input-field w-full"
                          placeholder="如：原材料质量"
                        />
                      </div>
                      <div>
                        <label class="block text-xs text-gray-500 mb-1">项目类型</label>
                        <select
                          [(ngModel)]="item.itemType"
                          [name]="'itemType' + i"
                          class="input-field w-full"
                        >
                          <option [value]="itemTypeQuality">质量</option>
                          <option [value]="itemTypeDelivery">交期</option>
                          <option [value]="itemTypePrice">价格</option>
                          <option [value]="itemTypeService">服务</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-xs text-gray-500 mb-1">评分</label>
                        <input
                          type="number"
                          [(ngModel)]="item.score"
                          [name]="'itemScore' + i"
                          min="1"
                          max="10"
                          step="0.1"
                          class="input-field w-full"
                        />
                      </div>
                      <div class="flex items-end gap-2">
                        <div class="flex-1">
                          <label class="block text-xs text-gray-500 mb-1">说明</label>
                          <input
                            type="text"
                            [(ngModel)]="item.description"
                            [name]="'itemDesc' + i"
                            class="input-field w-full"
                            placeholder="简要说明"
                          />
                        </div>
                        <button
                          type="button"
                          (click)="removeItem(i)"
                          class="btn-secondary text-red-600 hover:bg-red-50"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                暂无评估明细，点击"添加明细"按钮添加
              </div>
            }
          </div>

          <!-- 评估结论 -->
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-4">评估结论</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">评估结论</label>
                <textarea
                  [(ngModel)]="formData.conclusion"
                  name="conclusion"
                  rows="3"
                  class="input-field w-full"
                  placeholder="请输入评估结论"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  [(ngModel)]="formData.notes"
                  name="notes"
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierEvaluationFormComponent implements OnInit {
  private readonly purchaseService = inject(PurchaseService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // 评估项目类型常量
  readonly itemTypeQuality = EvaluationItemType.质量;
  readonly itemTypeDelivery = EvaluationItemType.交期;
  readonly itemTypePrice = EvaluationItemType.价格;
  readonly itemTypeService = EvaluationItemType.服务;

  isEdit = false;
  evaluationId: string | null = null;
  evaluationNo: string = '';
  evaluationDate: string = '';

  isSubmitting = signal(false);
  suppliers = signal<Supplier[]>([]);

  formData: {
    supplierId: string;
    evaluator: string;
    qualityScore: number;
    deliveryScore: number;
    priceScore: number;
    serviceScore: number;
    conclusion: string;
    notes: string;
    items: EvaluationItem[];
  } = {
    supplierId: '',
    evaluator: '',
    qualityScore: 5,
    deliveryScore: 5,
    priceScore: 5,
    serviceScore: 5,
    conclusion: '',
    notes: '',
    items: [],
  };

  get totalScore(): number {
    return (
      (Number(this.formData.qualityScore) +
        Number(this.formData.deliveryScore) +
        Number(this.formData.priceScore) +
        Number(this.formData.serviceScore)) /
      4
    );
  }

  get currentLevel(): string {
    const score = this.totalScore;
    if (score >= 8) return 'A';
    if (score >= 6) return 'B';
    if (score >= 4) return 'C';
    return 'D';
  }

  ngOnInit(): void {
    this.loadSuppliers();
    this.evaluationDate = new Date().toISOString().split('T')[0];

    this.evaluationId = this.route.snapshot.paramMap.get('id');
    if (this.evaluationId) {
      this.isEdit = true;
      this.loadEvaluation(this.evaluationId);
    }
  }

  loadSuppliers(): void {
    this.purchaseService.getSuppliers().subscribe({
      next: (suppliers) => {
        this.suppliers.set(suppliers);
      },
      error: (err) => {
        console.error('加载供应商列表失败', err);
      },
    });
  }

  loadEvaluation(id: string): void {
    this.purchaseService.getSupplierEvaluation(id).subscribe({
      next: (evaluation) => {
        this.formData.supplierId = evaluation.supplierId;
        this.formData.evaluator = evaluation.evaluator;
        this.formData.qualityScore = evaluation.qualityScore;
        this.formData.deliveryScore = evaluation.deliveryScore;
        this.formData.priceScore = evaluation.priceScore;
        this.formData.serviceScore = evaluation.serviceScore;
        this.formData.conclusion = evaluation.conclusion || '';
        this.formData.notes = evaluation.notes || '';
        this.formData.items = evaluation.items || [];
        this.evaluationNo = evaluation.evaluationNo;
        this.evaluationDate = evaluation.evaluationDate
          ? new Date(evaluation.evaluationDate).toISOString().split('T')[0]
          : '';
      },
      error: (err) => {
        console.error('加载评估详情失败', err);
      },
    });
  }

  onSupplierSelect(): void {
    // 供应商选择变化时的处理
  }

  addItem(): void {
    if (!this.formData.items) {
      this.formData.items = [];
    }
    this.formData.items.push({
      itemName: '',
      itemType: EvaluationItemType.质量,
      score: 5,
      description: '',
    });
  }

  removeItem(index: number): void {
    this.formData.items.splice(index, 1);
  }

  getLevelClass(level: string): string {
    const classes: Record<string, string> = {
      'A': 'bg-green-100 text-green-700',
      'B': 'bg-blue-100 text-blue-700',
      'C': 'bg-yellow-100 text-yellow-700',
      'D': 'bg-red-100 text-red-700',
    };
    return classes[level] || 'bg-gray-100 text-gray-700';
  }

  onSubmit(): void {
    if (!this.formData.supplierId || !this.formData.evaluator) {
      alert('请填写必填项');
      return;
    }

    this.isSubmitting.set(true);

    // 构建提交数据，将evaluationDate从字符串转换为Date对象
    const submitData: Partial<SupplierEvaluation> = {
      supplierId: this.formData.supplierId,
      evaluator: this.formData.evaluator,
      qualityScore: this.formData.qualityScore,
      deliveryScore: this.formData.deliveryScore,
      priceScore: this.formData.priceScore,
      serviceScore: this.formData.serviceScore,
      conclusion: this.formData.conclusion || undefined,
      notes: this.formData.notes || undefined,
      items: this.formData.items,
      evaluationDate: new Date(this.evaluationDate),
    };

    const request = this.isEdit && this.evaluationId
      ? this.purchaseService.updateSupplierEvaluation(this.evaluationId, submitData)
      : this.purchaseService.createSupplierEvaluation(submitData);

    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/purchase/evaluations']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('保存评估失败', err);
        alert('保存失败，请重试');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/purchase/evaluations']);
  }
}
