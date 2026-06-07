import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ColorFormulaService } from '../../services/color-formula.service';
import { 配色结果, 创建配色结果参数 } from '../../models/color-matching-result.model';
import { 颜色配方 } from '../../models/color-formula.model';
import { 客户 } from '../../../customer/models/customer.model';

@Component({
  selector: 'app-matching-result-form',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? '编辑记录' : '新建配色结果' }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ isEdit ? '修改配色结果信息' : '录入配色结果' }}</p>
        </div>
        <button (click)="goBack()" class="btn-secondary">
          返回列表
        </button>
      </div>

      <div class="card max-w-2xl">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">配色配方 <span class="text-red-500">*</span></label>
            <select
              [(ngModel)]="formData.formulaId"
              [disabled]="isEdit"
              class="input-field w-full">
              <option value="">请选择配色配方</option>
              @for (formula of formulas(); track formula.id) {
                <option [value]="formula.id">{{ formula.code }} - {{ formula.name }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">客户 <span class="text-red-500">*</span></label>
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
            <label class="block text-sm font-medium text-gray-700 mb-1">配色日期 <span class="text-red-500">*</span></label>
            <input
              type="date"
              [(ngModel)]="formData.matchingDate"
              [disabled]="isEdit"
              class="input-field w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">配色人 <span class="text-red-500">*</span></label>
            <input
              type="text"
              [(ngModel)]="formData.matchingPerson"
              [disabled]="isEdit"
              class="input-field w-full"
              placeholder="请输入配色人姓名"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">目标颜色</label>
              <input
                type="text"
                [(ngModel)]="formData.targetColor"
                [disabled]="isEdit"
                class="input-field w-full"
                placeholder="色号/颜色代码"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">实际颜色</label>
              <input
                type="text"
                [(ngModel)]="formData.actualColor"
                [disabled]="isEdit"
                class="input-field w-full"
                placeholder="色号/颜色代码"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">色差值ΔE</label>
            <input
              type="number"
              [(ngModel)]="formData.colorDifference"
              [disabled]="isEdit"
              (ngModelChange)="updateQualified()"
              class="input-field w-full"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            <p class="text-xs text-gray-500 mt-1">ΔE ≤ 1.0 为合格，系统将自动判断</p>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              id="isQualified"
              [(ngModel)]="formData.isQualified"
              [disabled]="isEdit"
              class="w-4 h-4 rounded border-gray-300"
            />
            <label for="isQualified" class="text-sm font-medium text-gray-700">是否合格</label>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">配方调整记录</label>
            <textarea
              [(ngModel)]="formData.adjustmentRecord"
              [disabled]="isEdit"
              rows="3"
              class="input-field w-full"
              placeholder="请输入配方调整记录"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea
              [(ngModel)]="formData.remark"
              [disabled]="isEdit"
              rows="2"
              class="input-field w-full"
              placeholder="备注信息"
            ></textarea>
          </div>

          <div class="flex justify-end gap-2 pt-4">
            @if (!isEdit) {
              <button (click)="save()" class="btn-primary">
                保存
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class MatchingResultFormComponent implements OnInit {
  private readonly colorFormulaService = inject(ColorFormulaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isEdit = false;
  resultId: string | null = null;

  formulas = signal<颜色配方[]>([]);
  customers = signal<客户[]>([]);

  formData: 创建配色结果参数 = {
    formulaId: '',
    customerId: '',
    matchingDate: new Date().toISOString().split('T')[0],
    matchingPerson: '',
    targetColor: '',
    actualColor: '',
    colorDifference: 0,
    isQualified: true,
    adjustmentRecord: '',
    remark: '',
  };

  ngOnInit() {
    this.loadFormulas();
    this.loadCustomers();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.resultId = id;
      this.isEdit = true;
      this.loadResult(id);
    }
  }

  loadFormulas() {
    this.colorFormulaService.获取配方列表({ page: 1, pageSize: 100 }).subscribe({
      next: (result) => {
        this.formulas.set(result.items);
      }
    });
  }

  loadCustomers() {
    // 实际应该调用客户API
  }

  loadResult(id: string) {
    this.colorFormulaService.获取配色结果ById(id).subscribe({
      next: (result) => {
        this.formData = {
          formulaId: result.formulaId,
          customerId: result.customerId,
          matchingDate: new Date(result.matchingDate).toISOString().split('T')[0],
          matchingPerson: result.matchingPerson,
          targetColor: result.targetColor,
          actualColor: result.actualColor,
          colorDifference: result.colorDifference,
          isQualified: result.isQualified,
          adjustmentRecord: result.adjustmentRecord || '',
          remark: result.remark || '',
        };
      },
      error: (err) => {
        console.error('加载配色结果失败', err);
      }
    });
  }

  updateQualified() {
    // 当色差值变化时，自动更新是否合格
    this.formData.isQualified = this.formData.colorDifference <= 1.0;
  }

  save() {
    if (!this.formData.formulaId || !this.formData.customerId || !this.formData.matchingDate || !this.formData.matchingPerson) {
      alert('请填写必填项');
      return;
    }

    this.colorFormulaService.创建配色结果(this.formData).subscribe({
      next: () => {
        this.goBack();
      },
      error: (err) => {
        console.error('创建配色结果失败', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/color-formula/matching-results']);
  }
}
