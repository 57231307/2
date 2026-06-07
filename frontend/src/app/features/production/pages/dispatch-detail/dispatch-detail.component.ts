import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ProductionService } from '../../services/production.service';
import {
  WorkOrderDispatch,
  DispatchStatus,
  CompleteDispatchParams,
} from '../../models/process-route.model';

@Component({
  selector: 'app-dispatch-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">派工单详情</h1>
          <p class="text-sm text-gray-500 mt-1">查看派工单详细信息</p>
        </div>
        <button (click)="goBack()" class="btn-secondary">
          返回列表
        </button>
      </div>

      @if (dispatch()) {
        <!-- 基本信息 -->
        <div class="card mb-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm text-gray-500">派工单号</label>
              <p class="text-gray-800 font-medium">{{ dispatch()!.dispatchNo }}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-500">生产工单</label>
              <p class="text-gray-800">{{ dispatch()!.productionOrderNo || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-500">工序</label>
              <p class="text-gray-800">{{ dispatch()!.stepName || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-500">状态</label>
              <span [class]="getStatusClass(dispatch()!.status)">
                {{ getStatusText(dispatch()!.status) }}
              </span>
            </div>
            <div>
              <label class="block text-sm text-gray-500">派工数量</label>
              <p class="text-gray-800">{{ dispatch()!.quantity | number }}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-500">派工日期</label>
              <p class="text-gray-800">{{ dispatch()!.dispatchDate | date:'yyyy-MM-dd' }}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-500">班组/人员</label>
              <p class="text-gray-800">{{ dispatch()!.workerGroup }}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-500">良品数量</label>
              <p class="text-gray-800">{{ dispatch()!.goodQuantity | number }}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-500">不良品数量</label>
              <p class="text-gray-800">{{ dispatch()!.defectQuantity | number }}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-500">实际工时</label>
              <p class="text-gray-800">{{ dispatch()!.actualHours ? (dispatch()!.actualHours | number:'1.2-2') : '-' }}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-500">开始时间</label>
              <p class="text-gray-800">{{ dispatch()!.startTime ? (dispatch()!.startTime | date:'yyyy-MM-dd HH:mm') : '-' }}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-500">结束时间</label>
              <p class="text-gray-800">{{ dispatch()!.endTime ? (dispatch()!.endTime | date:'yyyy-MM-dd HH:mm') : '-' }}</p>
            </div>
          </div>
          @if (dispatch()!.notes) {
            <div class="mt-4 pt-4 border-t">
              <label class="block text-sm text-gray-500">备注</label>
              <p class="text-gray-800">{{ dispatch()!.notes }}</p>
            </div>
          }
        </div>

        <!-- 操作按钮 -->
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">操作</h2>
          <div class="flex flex-wrap gap-2">
            @if (isPending()) {
              <button (click)="confirmDispatch()" class="btn-primary">
                确认派工
              </button>
            }
            @if (isDispatched()) {
              <button (click)="startDispatch()" class="btn-primary">
                开始生产
              </button>
            }
            @if (isInProduction()) {
              <button (click)="openCompleteDialog()" class="btn-primary">
                完成生产
              </button>
            }
            @if (canCancel()) {
              <button (click)="cancelDispatch()" class="btn-secondary text-red-600 border-red-600 hover:bg-red-50">
                取消派工
              </button>
            }
          </div>
        </div>
      }

      <!-- 完成生产弹窗 -->
      @if (showCompleteModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">完成生产</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">良品数量 <span class="text-red-500">*</span></label>
                <input
                  type="number"
                  [(ngModel)]="completeForm.goodQuantity"
                  class="input-field w-full"
                  placeholder="请输入良品数量"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">不良品数量</label>
                <input
                  type="number"
                  [(ngModel)]="completeForm.defectQuantity"
                  class="input-field w-full"
                  placeholder="请输入不良品数量"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">实际工时（小时）</label>
                <input
                  type="number"
                  [(ngModel)]="completeForm.actualHours"
                  class="input-field w-full"
                  placeholder="请输入实际工时"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  [(ngModel)]="completeForm.notes"
                  rows="2"
                  class="input-field w-full"
                  placeholder="备注信息"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <button (click)="closeCompleteDialog()" class="btn-secondary">
                取消
              </button>
              <button (click)="submitComplete()" class="btn-primary">
                确认
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DispatchDetailComponent implements OnInit {
  private readonly productionService = inject(ProductionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly DispatchStatus = DispatchStatus;

  dispatch = signal<WorkOrderDispatch | null>(null);
  showCompleteModal = signal(false);

  completeForm: CompleteDispatchParams = {
    goodQuantity: 0,
    defectQuantity: 0,
    actualHours: 0,
    notes: '',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDispatch(id);
    }

    const action = this.route.snapshot.queryParamMap.get('action');
    if (action === 'complete') {
      this.showCompleteModal.set(true);
    }
  }

  loadDispatch(id: string): void {
    this.productionService.getDispatch(id).subscribe({
      next: (dispatch) => {
        this.dispatch.set(dispatch);
        this.completeForm.goodQuantity = Number(dispatch.quantity);
      },
      error: (err) => {
        console.error('加载派工单失败', err);
      },
    });
  }

  isPending(): boolean {
    return this.dispatch()?.status === DispatchStatus["待派工"];
  }

  isDispatched(): boolean {
    return this.dispatch()?.status === DispatchStatus["已派工"];
  }

  isInProduction(): boolean {
    return this.dispatch()?.status === DispatchStatus["生产中"];
  }

  canCancel(): boolean {
    const status = this.dispatch()?.status;
    return status !== DispatchStatus["已完成"] && status !== DispatchStatus["已取消"];
  }

  confirmDispatch(): void {
    const dispatch = this.dispatch();
    if (!dispatch) return;

    if (confirm(`确定要确认派工单 ${dispatch.dispatchNo} 吗？`)) {
      this.productionService.confirmDispatch(dispatch.id).subscribe({
        next: () => {
          this.loadDispatch(dispatch.id);
        },
        error: (err) => {
          console.error('确认派工失败', err);
        },
      });
    }
  }

  startDispatch(): void {
    const dispatch = this.dispatch();
    if (!dispatch) return;

    if (confirm(`确定要开始生产派工单 ${dispatch.dispatchNo} 吗？`)) {
      this.productionService.startDispatch(dispatch.id).subscribe({
        next: () => {
          this.loadDispatch(dispatch.id);
        },
        error: (err) => {
          console.error('开始生产失败', err);
        },
      });
    }
  }

  openCompleteDialog(): void {
    this.showCompleteModal.set(true);
  }

  closeCompleteDialog(): void {
    this.showCompleteModal.set(false);
  }

  submitComplete(): void {
    const dispatch = this.dispatch();
    if (!dispatch) return;

    if (!this.completeForm.goodQuantity) {
      alert('请输入良品数量');
      return;
    }

    this.productionService.completeDispatch(dispatch.id, this.completeForm).subscribe({
      next: () => {
        this.loadDispatch(dispatch.id);
        this.closeCompleteDialog();
      },
      error: (err) => {
        console.error('完成生产失败', err);
      },
    });
  }

  cancelDispatch(): void {
    const dispatch = this.dispatch();
    if (!dispatch) return;

    if (confirm(`确定要取消派工单 ${dispatch.dispatchNo} 吗？`)) {
      this.productionService.cancelDispatch(dispatch.id).subscribe({
        next: () => {
          this.loadDispatch(dispatch.id);
        },
        error: (err) => {
          console.error('取消派工失败', err);
        },
      });
    }
  }

  getStatusClass(status: DispatchStatus): string {
    const classes: Record<string, string> = {
      [DispatchStatus["待派工"]]: 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-600',
      [DispatchStatus["已派工"]]: 'px-2 py-1 text-xs rounded bg-blue-100 text-blue-700',
      [DispatchStatus["生产中"]]: 'px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700',
      [DispatchStatus["已完成"]]: 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
      [DispatchStatus["已取消"]]: 'px-2 py-1 text-xs rounded bg-red-100 text-red-700',
    };
    return classes[status] || '';
  }

  getStatusText(status: DispatchStatus): string {
    const texts: Record<string, string> = {
      [DispatchStatus["待派工"]]: '待派工',
      [DispatchStatus["已派工"]]: '已派工',
      [DispatchStatus["生产中"]]: '生产中',
      [DispatchStatus["已完成"]]: '已完成',
      [DispatchStatus["已取消"]]: '已取消',
    };
    return texts[status] || status;
  }

  goBack(): void {
    this.router.navigate(['/production/dispatches']);
  }
}
