import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ProductionService } from '../../services/production.service';
import { MaterialRequisition, RequisitionStatus } from '../../models/production.model';

@Component({
  selector: 'app-requisition-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      @if (requisition()) {
        <!-- 页面标题 -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-800">{{ requisition()!.requisitionNo }}</h1>
              <span [class]="getStatusClass(requisition()!.status)">
                {{ getStatusText(requisition()!.status) }}
              </span>
            </div>
            <p class="text-sm text-gray-500 mt-1">领料单详情</p>
          </div>
          <div class="flex gap-2">
            <button (click)="goBack()" class="btn-secondary">
              返回列表
            </button>
            @if (requisition()!.status === 'pending') {
              <button (click)="editRequisition()" class="btn-primary">
                编辑领料单
              </button>
            }
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="card mb-4">
          <h3 class="text-lg font-medium text-gray-800 mb-4">基本信息</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p class="text-sm text-gray-500 mb-1">领料单号</p>
              <p class="text-gray-800 font-medium">{{ requisition()!.requisitionNo }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">关联工单</p>
              <p class="text-primary-600 cursor-pointer hover:text-primary-800" (click)="viewOrder()">
                {{ requisition()!.productionOrderNo }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">领料日期</p>
              <p class="text-gray-800">{{ requisition()!.requisitionDate | date: 'yyyy-MM-dd' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">仓库</p>
              <p class="text-gray-800">{{ requisition()!.warehouseName }}</p>
            </div>
          </div>
        </div>

        <!-- 原料明细 -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-800 mb-4">原料明细</h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">原料名称</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">需求数量</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">已领数量</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">剩余数量</th>
                  <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">单位</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (item of requisition()!.items; track item.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-800">{{ item.productName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 text-right">{{ item.requisitionQuantity | number }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 text-right">{{ item.issuedQuantity | number }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 text-right">
                      {{ item.requisitionQuantity - item.issuedQuantity | number }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ item.unit }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                      暂无原料数据
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <div class="flex justify-center items-center h-64">
          <p class="text-gray-500">加载中...</p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequisitionDetailComponent implements OnInit {
  private readonly productionService = inject(ProductionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly RequisitionStatus = RequisitionStatus;

  requisition = signal<MaterialRequisition | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRequisition(id);
    }
  }

  loadRequisition(id: string): void {
    this.productionService.getRequisition(id).subscribe({
      next: (requisition) => this.requisition.set(requisition),
      error: (err) => {
        console.error('加载领料单详情失败', err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/production/requisitions']);
  }

  editRequisition(): void {
    if (this.requisition()) {
      this.router.navigate(['/production/requisitions', this.requisition()!.id, 'edit']);
    }
  }

  viewOrder(): void {
    if (this.requisition()) {
      this.router.navigate(['/production/orders', this.requisition()!.productionOrderId]);
    }
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'pending': 'px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700',
      'issued': 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
      'partial': 'px-2 py-1 text-xs rounded bg-blue-100 text-blue-700',
    };
    return classes[status] || '';
  }

  getStatusText(status: string): string {
    const texts: Record<string, string> = {
      'pending': '待领料',
      'issued': '已领料',
      'partial': '部分领料',
    };
    return texts[status] || status;
  }
}
