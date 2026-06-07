import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FinanceService } from '../../services/finance.service';

interface CostVarianceFormData {
  id?: string;
  analysisNo?: string;
  workOrderId?: string;
  workOrderNo?: string;
  orderId?: string;
  orderNo?: string;
  productId?: string;
  productName?: string;
  productCode?: string;
  standardCost: number;
  actualCost: number;
  varianceReason?: string;
  analysisDate: string;
  analyst: string;
  remark?: string;
}

@Component({
  selector: 'app-cost-variance-form',
  standalone: true,
  imports: [FormsModule, DecimalPipe, RouterLink],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">
          {{ isEdit() ? '编辑成本差异分析' : '新建成本差异分析' }}
        </h1>
        <button (click)="goBack()" class="btn-secondary">
          返回
        </button>
      </div>

      <div class="card">
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">订单编号</label>
              <input
                type="text"
                [(ngModel)]="formData.orderNo"
                class="input-field w-full"
                placeholder="请输入订单编号"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">产品名称</label>
              <input
                type="text"
                [(ngModel)]="formData.productName"
                class="input-field w-full"
                placeholder="请输入产品名称"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">标准成本 *</label>
              <input
                type="number"
                [(ngModel)]="formData.standardCost"
                step="0.01"
                class="input-field w-full"
                placeholder="0.00"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">实际成本 *</label>
              <input
                type="number"
                [(ngModel)]="formData.actualCost"
                step="0.01"
                class="input-field w-full"
                placeholder="0.00"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">分析日期 *</label>
              <input
                type="date"
                [(ngModel)]="formData.analysisDate"
                class="input-field w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">分析人 *</label>
              <input
                type="text"
                [(ngModel)]="formData.analyst"
                class="input-field w-full"
                placeholder="请输入分析人"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">差异原因</label>
              <textarea
                [(ngModel)]="formData.varianceReason"
                rows="3"
                class="input-field w-full"
                placeholder="请输入差异原因分析"
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

          <!-- 差异预览 -->
          @if (formData.standardCost && formData.actualCost) {
            <div class="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 class="text-sm font-medium text-gray-700 mb-2">差异计算预览</h3>
              <div class="grid grid-cols-3 gap-4">
                <div class="text-center">
                  <p class="text-xs text-gray-500">差异金额</p>
                  <p class="text-lg font-bold" [class.text-green-600]="varianceAmount() >= 0" [class.text-red-600]="varianceAmount() < 0">
                    {{ varianceAmount() | number:'1.2-2' }}
                  </p>
                </div>
                <div class="text-center">
                  <p class="text-xs text-gray-500">差异率</p>
                  <p class="text-lg font-bold" [class.text-green-600]="varianceRate() >= 0" [class.text-red-600]="varianceRate() < 0">
                    {{ varianceRate() | number:'1.2-2' }}%
                  </p>
                </div>
                <div class="text-center">
                  <p class="text-xs text-gray-500">差异类型</p>
                  <p class="text-lg font-bold" [class.text-green-600]="varianceAmount() >= 0" [class.text-red-600]="varianceAmount() < 0">
                    {{ varianceAmount() >= 0 ? '成本节约' : '成本超支' }}
                  </p>
                </div>
              </div>
            </div>
          }

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
export class CostVarianceFormComponent implements OnInit {
  private financeService = inject(FinanceService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = signal(false);
  formData: CostVarianceFormData = {
    standardCost: 0,
    actualCost: 0,
    analysisDate: new Date().toISOString().split('T')[0],
    analyst: '',
  };

  private detailId: string | null = null;

  ngOnInit(): void {
    this.detailId = this.route.snapshot.queryParamMap.get('id');
    if (this.detailId) {
      this.isEdit.set(true);
      this.loadDetail(this.detailId);
    }
  }

  loadDetail(id: string): void {
    this.financeService.getCostVarianceById(id).subscribe({
      next: (data: any) => {
        this.formData = {
          ...data,
          analysisDate: data.analysisDate?.split('T')[0] || ''
        };
      },
      error: (err) => console.error('加载详情失败', err)
    });
  }

  varianceAmount(): number {
    return (this.formData.actualCost || 0) - (this.formData.standardCost || 0);
  }

  varianceRate(): number {
    const standard = this.formData.standardCost || 0;
    if (standard === 0) return 0;
    return (this.varianceAmount() / standard) * 100;
  }

  save(): void {
    if (!this.formData.standardCost || !this.formData.actualCost || !this.formData.analyst) {
      alert('请填写必填项');
      return;
    }

    const observable = this.isEdit()
      ? this.financeService.updateCostVariance(this.detailId!, this.formData)
      : this.financeService.createCostVariance(this.formData);

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
    this.router.navigate(['/finance/cost-variance']);
  }
}
