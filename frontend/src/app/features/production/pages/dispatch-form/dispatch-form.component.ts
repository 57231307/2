import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ProductionService } from '../../services/production.service';
import {
  CreateDispatchParams,
  ProcessRoute,
  ProcessStep,
} from '../../models/process-route.model';
import { ProductionOrder } from '../../models/production.model';

@Component({
  selector: 'app-dispatch-form',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">新建派工单</h1>
          <p class="text-sm text-gray-500 mt-1">创建新的工序派工单</p>
        </div>
        <button (click)="goBack()" class="btn-secondary">
          返回列表
        </button>
      </div>

      <!-- 表单 -->
      <div class="card max-w-2xl">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">生产工单 <span class="text-red-500">*</span></label>
            <select
              [(ngModel)]="formData.productionOrderId"
              (ngModelChange)="onOrderChange()"
              class="input-field w-full"
            >
              <option value="">请选择生产工单</option>
              @for (order of productionOrders(); track order.id) {
                <option [value]="order.id">{{ order.orderNo }} - {{ order.productName }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">工序 <span class="text-red-500">*</span></label>
            <select
              [(ngModel)]="formData.stepId"
              class="input-field w-full"
            >
              <option value="">请选择工序</option>
              @for (step of processSteps(); track step.id) {
                <option [value]="step.id">{{ step.stepName }} ({{ step.standardHours }}小时)</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">派工数量 <span class="text-red-500">*</span></label>
            <input
              type="number"
              [(ngModel)]="formData.quantity"
              class="input-field w-full"
              placeholder="请输入派工数量"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">派工日期 <span class="text-red-500">*</span></label>
            <input
              type="date"
              [(ngModel)]="dispatchDate"
              class="input-field w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">班组/人员 <span class="text-red-500">*</span></label>
            <input
              type="text"
              [(ngModel)]="formData.workerGroup"
              class="input-field w-full"
              placeholder="请输入班组或人员名称"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea
              [(ngModel)]="formData.notes"
              rows="3"
              class="input-field w-full"
              placeholder="备注信息"
            ></textarea>
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <button (click)="goBack()" class="btn-secondary">
              取消
            </button>
            <button (click)="saveDispatch()" class="btn-primary">
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DispatchFormComponent implements OnInit {
  private readonly productionService = inject(ProductionService);
  private readonly router = inject(Router);

  productionOrders = signal<ProductionOrder[]>([]);
  processRoutes = signal<ProcessRoute[]>([]);
  processSteps = signal<ProcessStep[]>([]);

  formData: CreateDispatchParams = {
    productionOrderId: '',
    stepId: '',
    quantity: 0,
    dispatchDate: new Date(),
    workerGroup: '',
    notes: '',
  };

  dispatchDate = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.loadProductionOrders();
    this.loadProcessRoutes();
  }

  loadProductionOrders(): void {
    this.productionService.getOrders({
      page: 1,
      pageSize: 100,
      status: undefined,
    }).subscribe({
      next: (result) => {
        this.productionOrders.set(result.items);
      },
      error: (err) => {
        console.error('加载生产工单失败', err);
      },
    });
  }

  loadProcessRoutes(): void {
    this.productionService.getProcessRoutes({
      page: 1,
      pageSize: 100,
      status: undefined,
    }).subscribe({
      next: (result) => {
        this.processRoutes.set(result.items);
      },
      error: (err) => {
        console.error('加载工艺路线失败', err);
      },
    });
  }

  onOrderChange(): void {
    this.formData.stepId = '';
    this.processSteps.set([]);
  }

  saveDispatch(): void {
    if (!this.formData.productionOrderId || !this.formData.stepId || !this.formData.quantity || !this.formData.workerGroup) {
      alert('请填写必填项');
      return;
    }

    this.formData.dispatchDate = new Date(this.dispatchDate);

    this.productionService.createDispatch(this.formData).subscribe({
      next: () => {
        this.router.navigate(['/production/dispatches']);
      },
      error: (err) => {
        console.error('创建派工单失败', err);
        alert('创建派工单失败');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/production/dispatches']);
  }
}
