import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductionService } from '../../services/production.service';
import { 工序汇报, 创建工序汇报参数 } from '../../models/process-report.model';
import { WorkOrderDispatch, DispatchStatus } from '../../models/process-route.model';

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? '编辑汇报' : '新建工序汇报' }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ isEdit ? '修改汇报信息' : '录入生产工序汇报' }}</p>
        </div>
        <button (click)="goBack()" class="btn-secondary">
          返回列表
        </button>
      </div>

      <div class="card max-w-2xl">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">派工单 <span class="text-red-500">*</span></label>
            <select
              [(ngModel)]="formData.dispatchId"
              [disabled]="isEdit"
              (ngModelChange)="onDispatchChange()"
              class="input-field w-full">
              <option value="">请选择派工单</option>
              @for (dispatch of dispatches(); track dispatch.id) {
                <option [value]="dispatch.id">{{ dispatch.dispatchNo }} - {{ dispatch.productionOrderNo }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">工序 <span class="text-red-500">*</span></label>
            <select
              [(ngModel)]="formData.stepId"
              [disabled]="isEdit"
              class="input-field w-full">
              <option value="">请选择工序</option>
              @for (step of steps(); track step.id) {
                <option [value]="step.id">{{ step.stepNo }} - {{ step.stepName }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">汇报日期 <span class="text-red-500">*</span></label>
            <input
              type="date"
              [(ngModel)]="formData.reportDate"
              [disabled]="isEdit"
              class="input-field w-full"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">良品数量 <span class="text-red-500">*</span></label>
              <input
                type="number"
                [(ngModel)]="formData.qualifiedQuantity"
                [disabled]="isEdit"
                class="input-field w-full"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">不良品数量</label>
              <input
                type="number"
                [(ngModel)]="formData.defectiveQuantity"
                [disabled]="isEdit"
                class="input-field w-full"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">不良原因</label>
            <textarea
              [(ngModel)]="formData.defectReason"
              [disabled]="isEdit"
              rows="2"
              class="input-field w-full"
              placeholder="请输入不良原因"
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
export class ReportFormComponent implements OnInit {
  private readonly productionService = inject(ProductionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isEdit = false;
  reportId: string | null = null;

  dispatches = signal<WorkOrderDispatch[]>([]);
  steps = signal<any[]>([]);

  formData: 创建工序汇报参数 = {
    dispatchId: '',
    stepId: '',
    reportDate: new Date().toISOString().split('T')[0],
    qualifiedQuantity: 0,
    defectiveQuantity: 0,
    defectReason: '',
    remark: '',
  };

  ngOnInit() {
    this.loadDispatches();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reportId = id;
      this.isEdit = true;
      this.loadReport(id);
    }
  }

  loadDispatches() {
    this.productionService.getDispatchesForReport({ page: 1, status: DispatchStatus.已派工, pageSize: 100 }).subscribe({
      next: (result) => {
        this.dispatches.set(result.items);
      }
    });
  }

  onDispatchChange() {
    // 当派工单变化时，可以根据需要加载关联的工序
  }

  loadReport(id: string) {
    this.productionService.getProcessReport(id).subscribe({
      next: (report) => {
        this.formData = {
          dispatchId: report.dispatchId,
          stepId: report.stepId,
          reportDate: new Date(report.reportDate).toISOString().split('T')[0],
          qualifiedQuantity: report.qualifiedQuantity,
          defectiveQuantity: report.defectiveQuantity,
          defectReason: report.defectReason || '',
          remark: report.remark || '',
        };
        // 如果有派工单信息，加载工序列表
        if (report.dispatch) {
          this.loadStepsForDispatch(report.dispatchId);
        }
      },
      error: (err) => {
        console.error('加载汇报失败', err);
      }
    });
  }

  loadStepsForDispatch(dispatchId: string) {
    // 实际应该根据派工单加载对应的工序列表
    // 这里简化处理，假设工序列表已经加载
  }

  save() {
    if (!this.formData.dispatchId || !this.formData.stepId || !this.formData.reportDate) {
      alert('请填写必填项');
      return;
    }

    if (this.formData.qualifiedQuantity <= 0 && this.formData.defectiveQuantity <= 0) {
      alert('良品数量和不良品数量至少需要录入一个');
      return;
    }

    this.productionService.createProcessReport(this.formData).subscribe({
      next: () => {
        this.goBack();
      },
      error: (err) => {
        console.error('创建汇报失败', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/production/report-list']);
  }
}
