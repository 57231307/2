import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ProductionService } from '../../services/production.service';
import {
  WorkOrderDispatch,
  DispatchStatus,
  DispatchQueryParams,
  PageResult,
} from '../../models/process-route.model';

@Component({
  selector: 'app-dispatch-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">工序派工管理</h1>
          <p class="text-sm text-gray-500 mt-1">管理生产工序派工和进度跟踪</p>
        </div>
        <button (click)="createDispatch()" class="btn-primary">
          新建派工单
        </button>
      </div>

      <!-- 筛选区域 -->
      <div class="card mb-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">派工单号</label>
            <input
              type="text"
              [(ngModel)]="queryParams.dispatchNo"
              (ngModelChange)="onSearchChange()"
              placeholder="派工单号"
              class="input-field w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">生产工单</label>
            <input
              type="text"
              [(ngModel)]="productionOrderKeyword"
              (ngModelChange)="onSearchChange()"
              placeholder="工单号"
              class="input-field w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              [(ngModel)]="queryParams.status"
              (ngModelChange)="loadDispatches()"
              class="input-field w-full"
            >
              <option [ngValue]="undefined">全部</option>
              <option [value]="dispatchStatusPending">待派工</option>
              <option [value]="dispatchStatusDispatched">已派工</option>
              <option [value]="dispatchStatusInProduction">生产中</option>
              <option [value]="dispatchStatusCompleted">已完成</option>
              <option [value]="dispatchStatusCancelled">已取消</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">派工日期</label>
            <input
              type="date"
              [(ngModel)]="dispatchDate"
              (ngModelChange)="onDateChange()"
              class="input-field w-full"
            />
          </div>
        </div>
      </div>

      <!-- 派工单列表 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">派工单号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">生产工单</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">工序</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">派工数量</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">派工日期</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">班组/人员</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">状态</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (dispatch of dispatches(); track dispatch.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-primary-600 cursor-pointer" (click)="viewDispatch(dispatch.id)">
                    {{ dispatch.dispatchNo }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ dispatch.productionOrderNo || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ dispatch.stepName || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 text-right">{{ dispatch.quantity | number }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ dispatch.dispatchDate | date:'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ dispatch.workerGroup }}</td>
                  <td class="px-4 py-3 text-center">
                    <span [class]="getStatusClass(dispatch.status)">
                      {{ getStatusText(dispatch.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <button (click)="viewDispatch(dispatch.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                        查看
                      </button>
                      @if (isPending(dispatch.status)) {
                        <button (click)="confirmDispatch(dispatch)" class="text-blue-600 hover:text-blue-800 text-sm">
                          确认
                        </button>
                      }
                      @if (isDispatched(dispatch.status)) {
                        <button (click)="startDispatch(dispatch)" class="text-green-600 hover:text-green-800 text-sm">
                          开始
                        </button>
                      }
                      @if (isInProduction(dispatch.status)) {
                        <button (click)="completeDispatch(dispatch)" class="text-purple-600 hover:text-purple-800 text-sm">
                          完成
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                    暂无派工单数据
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        @if (pageResult()) {
          <div class="flex justify-between items-center mt-4 pt-4 border-t">
            <span class="text-sm text-gray-600">
              共 {{ pageResult()!.total }} 条记录，第 {{ pageResult()!.page }} / {{ pageResult()!.totalPages }} 页
            </span>
            <div class="flex gap-2">
              <button
                [disabled]="pageResult()!.page <= 1"
                (click)="goToPage(pageResult()!.page - 1)"
                class="btn-secondary disabled:opacity-50"
              >
                上一页
              </button>
              <button
                [disabled]="pageResult()!.page >= pageResult()!.totalPages"
                (click)="goToPage(pageResult()!.page + 1)"
                class="btn-secondary disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DispatchListComponent {
  private readonly productionService = inject(ProductionService);
  private readonly router = inject(Router);

  readonly DispatchStatus = DispatchStatus;
  readonly dispatchStatusPending = DispatchStatus["待派工"];
  readonly dispatchStatusDispatched = DispatchStatus["已派工"];
  readonly dispatchStatusInProduction = DispatchStatus["生产中"];
  readonly dispatchStatusCompleted = DispatchStatus["已完成"];
  readonly dispatchStatusCancelled = DispatchStatus["已取消"];

  dispatches = signal<WorkOrderDispatch[]>([]);
  pageResult = signal<PageResult<WorkOrderDispatch> | null>(null);

  queryParams: DispatchQueryParams = {
    page: 1,
    pageSize: 10,
    dispatchNo: '',
    productionOrderId: undefined,
    stepId: undefined,
    status: undefined,
    dispatchDateFrom: undefined,
    dispatchDateTo: undefined,
  };

  productionOrderKeyword = '';
  dispatchDate = '';

  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.loadDispatches();
  }

  loadDispatches(): void {
    this.productionService.getDispatches(this.queryParams).subscribe({
      next: (result) => {
        this.dispatches.set(result.items);
        this.pageResult.set(result);
      },
      error: (err) => {
        console.error('加载派工单列表失败', err);
      },
    });
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.queryParams.page = 1;
      this.loadDispatches();
    }, 300);
  }

  onDateChange(): void {
    if (this.dispatchDate) {
      const date = new Date(this.dispatchDate);
      this.queryParams.dispatchDateFrom = date;
      this.queryParams.dispatchDateTo = date;
    } else {
      this.queryParams.dispatchDateFrom = undefined;
      this.queryParams.dispatchDateTo = undefined;
    }
    this.queryParams.page = 1;
    this.loadDispatches();
  }

  goToPage(page: number): void {
    this.queryParams.page = page;
    this.loadDispatches();
  }

  createDispatch(): void {
    this.router.navigate(['/production/dispatches/new']);
  }

  viewDispatch(id: string): void {
    this.router.navigate(['/production/dispatches', id]);
  }

  isPending(status: DispatchStatus): boolean {
    return status === DispatchStatus["待派工"];
  }

  isDispatched(status: DispatchStatus): boolean {
    return status === DispatchStatus["已派工"];
  }

  isInProduction(status: DispatchStatus): boolean {
    return status === DispatchStatus["生产中"];
  }

  confirmDispatch(dispatch: WorkOrderDispatch): void {
    if (confirm(`确定要确认派工单 ${dispatch.dispatchNo} 吗？`)) {
      this.productionService.confirmDispatch(dispatch.id).subscribe({
        next: () => {
          this.loadDispatches();
        },
        error: (err) => {
          console.error('确认派工失败', err);
        },
      });
    }
  }

  startDispatch(dispatch: WorkOrderDispatch): void {
    if (confirm(`确定要开始生产派工单 ${dispatch.dispatchNo} 吗？`)) {
      this.productionService.startDispatch(dispatch.id).subscribe({
        next: () => {
          this.loadDispatches();
        },
        error: (err) => {
          console.error('开始生产失败', err);
        },
      });
    }
  }

  completeDispatch(dispatch: WorkOrderDispatch): void {
    this.router.navigate(['/production/dispatches', dispatch.id], { queryParams: { action: 'complete' } });
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
}
