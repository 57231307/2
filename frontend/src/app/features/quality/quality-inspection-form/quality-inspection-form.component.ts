import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { QualityService } from '../services/quality.service';
import { QualityStandard, QualityInspectionItem, InspectionResult, CreateQualityInspectionRequest } from '../models/quality.model';

@Component({
  selector: 'app-quality-inspection-form',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">
          {{ isEdit() ? '编辑质检报告' : '新建质检报告' }}
        </h1>
        <button routerLink="/quality/inspections" class="btn-secondary">
          返回列表
        </button>
      </div>

      <div class="card p-6">
        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- 基本信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                批次编号 <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="formData.batchCode"
                name="batchCode"
                required
                [disabled]="isEdit()"
                class="input-field w-full"
                [class.opacity-50]="isEdit()"
                placeholder="请输入批次编号"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                缸号 <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="formData.dyeLotNo"
                name="dyeLotNo"
                required
                class="input-field w-full"
                placeholder="请输入缸号"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                匹号 <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="formData.pieceNo"
                name="pieceNo"
                required
                class="input-field w-full"
                placeholder="请输入匹号"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                质检标准 <span class="text-red-500">*</span>
              </label>
              <select
                [(ngModel)]="formData.standardId"
                name="standardId"
                required
                (ngModelChange)="onStandardChange()"
                class="input-field w-full"
              >
                <option value="">请选择质检标准</option>
                @for (standard of standards(); track standard.id) {
                  <option [value]="standard.id">{{ standard.name }} ({{ standard.code }})</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                检验日期 <span class="text-red-500">*</span>
              </label>
              <input
                type="date"
                [(ngModel)]="formData.inspectionDate"
                name="inspectionDate"
                required
                class="input-field w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                检验员 <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="formData.inspector"
                name="inspector"
                required
                class="input-field w-full"
                placeholder="请输入检验员姓名"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                检验结果 <span class="text-red-500">*</span>
              </label>
              <select
                [(ngModel)]="selectedResult"
                (ngModelChange)="onResultChange()"
                class="input-field w-full"
              >
                <option [ngValue]="0">{{ resultLabels[0] }}</option>
                <option [ngValue]="1">{{ resultLabels[1] }}</option>
                <option [ngValue]="2">{{ resultLabels[2] }}</option>
              </select>
            </div>
          </div>

          <!-- 检验项目明细 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              检验项目明细
            </label>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600 w-8">#</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">项目名称</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">检测方法</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">合格范围</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">单位</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">实际值</th>
                    <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">是否合格</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  @for (item of items(); track $index; let i = $index) {
                    <tr>
                      <td class="px-4 py-3 text-sm text-gray-600">{{ i + 1 }}</td>
                      <td class="px-4 py-3 text-sm text-gray-800">{{ item.itemName }}</td>
                      <td class="px-4 py-3 text-sm text-gray-600">{{ item.checkMethod }}</td>
                      <td class="px-4 py-3 text-sm text-gray-600">{{ item.qualifiedRange }}</td>
                      <td class="px-4 py-3 text-sm text-gray-600">{{ item.unit || '-' }}</td>
                      <td class="px-4 py-3">
                        <input
                          type="text"
                          [(ngModel)]="item.actualValue"
                          [name]="'actualValue-' + i"
                          class="input-field w-full"
                          placeholder="实际值"
                        />
                      </td>
                      <td class="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          [(ngModel)]="item.isQualified"
                          [name]="'isQualified-' + i"
                          class="w-4 h-4 text-primary-600 rounded"
                        />
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                        {{ standards().length === 0 ? '请先选择质检标准' : '该标准暂无检验项目' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- 备注 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea
              [(ngModel)]="formData.notes"
              name="notes"
              rows="3"
              class="input-field w-full"
              placeholder="请输入备注信息"
            ></textarea>
          </div>

          <!-- 提交按钮 -->
          <div class="flex justify-end gap-4 pt-6 border-t">
            <button type="button" routerLink="/quality/inspections" class="btn-secondary">
              取消
            </button>
            <button type="submit" class="btn-primary" [disabled]="submitting()">
              {{ submitting() ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QualityInspectionFormComponent implements OnInit {
  private qualityService = inject(QualityService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly resultLabels = ['合格', '不合格', '让步接收'];
  readonly resultValues = ['合格', '不合格', '让步接收'];

  isEdit = signal(false);
  submitting = signal(false);
  standards = signal<QualityStandard[]>([]);
  items = signal<QualityInspectionItem[]>([]);
  inspectionId = signal<string | null>(null);
  selectedStandard = signal<QualityStandard | null>(null);
  selectedResult = 0;

  formData: {
    batchCode: string;
    dyeLotNo: string;
    pieceNo: string;
    standardId: string;
    inspectionDate: string;
    inspector: string;
    result: string;
    notes: string;
  } = {
    batchCode: '',
    dyeLotNo: '',
    pieceNo: '',
    standardId: '',
    inspectionDate: '',
    inspector: '',
    result: '合格',
    notes: ''
  };

  ngOnInit(): void {
    this.loadStandards();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.inspectionId.set(id);
      this.loadInspection(id);
    } else {
      const today = new Date();
      this.formData.inspectionDate = today.toISOString().split('T')[0];
    }
  }

  loadStandards(): void {
    this.qualityService.getQualityStandards({ page: 1, pageSize: 100, status: '启用' } as any).subscribe({
      next: (result) => {
        this.standards.set(result.items);
      },
      error: (err) => console.error('加载质检标准失败', err)
    });
  }

  loadInspection(id: string): void {
    this.qualityService.getQualityInspection(id).subscribe({
      next: (inspection) => {
        this.formData = {
          batchCode: inspection.batchCode,
          dyeLotNo: inspection.dyeLotNo,
          pieceNo: inspection.pieceNo,
          standardId: inspection.standardId,
          inspectionDate: new Date(inspection.inspectionDate).toISOString().split('T')[0],
          inspector: inspection.inspector,
          result: inspection.result,
          notes: inspection.notes || ''
        };
        this.selectedResult = this.resultValues.indexOf(inspection.result);
        this.items.set(inspection.items);
      },
      error: (err) => {
        console.error('加载质检报告失败', err);
        this.router.navigate(['/quality/inspections']);
      }
    });
  }

  onStandardChange(): void {
    const standard = this.standards().find(s => s.id === this.formData.standardId);
    if (standard) {
      this.selectedStandard.set(standard);
      this.items.set(standard.items.map(item => ({
        id: '',
        itemName: item.itemName,
        checkMethod: item.checkMethod,
        qualifiedRange: item.qualifiedRange,
        unit: item.unit,
        actualValue: '',
        isQualified: true
      })));
    } else {
      this.selectedStandard.set(null);
      this.items.set([]);
    }
  }

  onResultChange(): void {
    this.formData.result = this.resultValues[this.selectedResult];
  }

  onSubmit(): void {
    if (!this.formData.standardId) {
      alert('请选择质检标准');
      return;
    }

    this.submitting.set(true);

    const request: CreateQualityInspectionRequest = {
      batchId: '',
      standardId: this.formData.standardId,
      inspectionDate: new Date(this.formData.inspectionDate),
      inspector: this.formData.inspector,
      result: this.formData.result as InspectionResult,
      items: this.items().map(item => ({
        itemName: item.itemName,
        checkMethod: item.checkMethod,
        actualValue: item.actualValue,
        qualifiedRange: item.qualifiedRange,
        unit: item.unit,
        isQualified: item.isQualified
      })),
      notes: this.formData.notes || undefined
    };

    const observable = this.isEdit()
      ? this.qualityService.updateQualityInspection(this.inspectionId()!, request)
      : this.qualityService.createQualityInspection(request);

    observable.subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/quality/inspections']);
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('保存质检报告失败', err);
      }
    });
  }
}