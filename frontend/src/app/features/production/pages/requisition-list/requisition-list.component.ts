import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ProductionService } from '../../services/production.service';
import {
  MaterialRequisition,
  RequisitionStatus,
  RequisitionQueryParams,
  PageResult,
  ProductionOrder,
} from '../../models/production.model';

@Component({
  selector: 'app-requisition-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">领料管理</h1>
          <p class="text-sm text-gray-500 mt-1">管理生产领料单</p>
        </div>
        <button (click)="createRequisition()" class="btn-primary">
          新建领料单
        </button>
      </div>

      <!-- 筛选区域 -->
      <div class="card mb-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">关键词搜索</label>
            <input
              type="text"
              [(ngModel)]="queryParams.keyword"
              (ngModelChange)="onSearchChange()"
              placeholder="领料单号/工单号"
              class="input-field w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">领料状态</label>
            <select
              [(ngModel)]="queryParams.status"
              (ngModelChange)="loadRequisitions()"
              class="input-field w-full"
            >
              <option [ngValue]="undefined">全部</option>
              <option value="pending">待领料</option>
              <option value="issued">已领料</option>
              <option value="partial">部分领料</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">生产工单</label>
            <select
              [(ngModel)]="queryParams.productionOrderId"
              (ngModelChange)="loadRequisitions()"
              class="input-field w-full"
            >
              <option [ngValue]="undefined">全部</option>
              @for (order of productionOrders(); track order.id) {
                <option [value]="order.id">{{ order.orderNo }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- 领料单列表 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">领料单号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">关联工单</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">领料日期</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">仓库</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">物料数量</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">状态</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (requisition of requisitions(); track requisition.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-primary-600 cursor-pointer" (click)="viewRequisition(requisition.id)">
                    {{ requisition.requisitionNo }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ requisition.productionOrderNo }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ requisition.requisitionDate | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ requisition.warehouseName }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ requisition.items.length }}</td>
                  <td class="px-4 py-3 text-center">
                    <span [class]="getStatusClass(requisition.status)">
                      {{ getStatusText(requisition.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <button (click)="viewRequisition(requisition.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                        查看
                      </button>
                      @if (requisition.status === 'pending') {
                        <button (click)="editRequisition(requisition.id)" class="text-primary-600 hover:text-primary-800 text-sm">
                          编辑
                        </button>
                        <button (click)="deleteRequisition(requisition)" class="text-red-600 hover:text-red-800 text-sm">
                          删除
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                    暂无领料单数据
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
export class RequisitionListComponent {
  private readonly productionService = inject(ProductionService);
  private readonly router = inject(Router);

  readonly RequisitionStatus = RequisitionStatus;

  requisitions = signal<MaterialRequisition[]>([]);
  productionOrders = signal<ProductionOrder[]>([]);
  pageResult = signal<PageResult<MaterialRequisition> | null>(null);

  queryParams: RequisitionQueryParams = {
    page: 1,
    pageSize: 10,
    keyword: '',
    status: undefined,
    productionOrderId: undefined,
  };

  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.loadRequisitions();
    this.loadProductionOrders();
  }

  loadRequisitions(): void {
    this.productionService.getRequisitions(this.queryParams).subscribe({
      next: (result) => {
        this.requisitions.set(result.items);
        this.pageResult.set(result);
      },
      error: (err) => {
        console.error('加载领料单列表失败', err);
      },
    });
  }

  loadProductionOrders(): void {
    this.productionService.getOrders({ page: 1, pageSize: 100 }).subscribe({
      next: (result) => this.productionOrders.set(result.items),
      error: (err) => console.error('加载工单列表失败', err),
    });
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.queryParams.page = 1;
      this.loadRequisitions();
    }, 300);
  }

  goToPage(page: number): void {
    this.queryParams.page = page;
    this.loadRequisitions();
  }

  createRequisition(): void {
    this.router.navigate(['/production/requisitions/new']);
  }

  viewRequisition(id: string): void {
    this.router.navigate(['/production/requisitions', id]);
  }

  editRequisition(id: string): void {
    this.router.navigate(['/production/requisitions', id, 'edit']);
  }

  deleteRequisition(requisition: MaterialRequisition): void {
    if (confirm(`确定要删除领料单 ${requisition.requisitionNo} 吗？`)) {
      this.productionService.deleteRequisition(requisition.id).subscribe({
        next: () => {
          this.loadRequisitions();
        },
        error: (err) => {
          console.error('删除领料单失败', err);
        },
      });
    }
  }

  getStatusClass(status: RequisitionStatus): string {
    const classes: Record<RequisitionStatus, string> = {
      [RequisitionStatus.待领料]: 'px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700',
      [RequisitionStatus.已领料]: 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
      [RequisitionStatus.部分领料]: 'px-2 py-1 text-xs rounded bg-blue-100 text-blue-700',
    };
    return classes[status] || '';
  }

  getStatusText(status: RequisitionStatus): string {
    const texts: Record<RequisitionStatus, string> = {
      [RequisitionStatus.待领料]: '待领料',
      [RequisitionStatus.已领料]: '已领料',
      [RequisitionStatus.部分领料]: '部分领料',
    };
    return texts[status] || status;
  }
}
