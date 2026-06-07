import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, CurrencyPipe } from '@angular/common';
import { InventoryCheckService, InventoryCheck, InventoryCheckItem } from '../../services/inventory-check.service';
import { WarehouseService } from '../../services/warehouse.service';
import { InventoryCheckStatus } from '../../models/check.model';

@Component({
  selector: 'app-check-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, CurrencyPipe],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">盘点单详情</h1>
        <a routerLink="/inventory/checks" class="text-gray-600 hover:text-gray-800">
          返回列表
        </a>
      </div>

      @if (check()) {
        <!-- 基本信息 -->
        <div class="bg-white rounded-lg shadow p-6 mb-4">
          <h3 class="font-medium text-gray-700 mb-4">基本信息</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div>
              <div class="text-gray-500 mb-1">盘点单号</div>
              <div class="font-medium">{{ check()!.checkNo }}</div>
            </div>
            <div>
              <div class="text-gray-500 mb-1">仓库</div>
              <div class="font-medium">{{ warehouseName() }}</div>
            </div>
            <div>
              <div class="text-gray-500 mb-1">盘点类型</div>
              <div class="font-medium">{{ check()!.checkType === 'FULL' ? '全盘' : '抽盘' }}</div>
            </div>
            <div>
              <div class="text-gray-500 mb-1">状态</div>
              <span [class]="getStatusClass(check()!.status)">
                {{ getStatusLabel(check()!.status) }}
              </span>
            </div>
            <div>
              <div class="text-gray-500 mb-1">盘点日期</div>
              <div class="font-medium">{{ check()!.checkDate | date:'yyyy-MM-dd' }}</div>
            </div>
            <div>
              <div class="text-gray-500 mb-1">负责人</div>
              <div class="font-medium">{{ check()!.manager || '-' }}</div>
            </div>
            <div>
              <div class="text-gray-500 mb-1">完成时间</div>
              <div class="font-medium">{{ check()!.completedAt ? (check()!.completedAt | date:'yyyy-MM-dd HH:mm') : '-' }}</div>
            </div>
            <div>
              <div class="text-gray-500 mb-1">创建时间</div>
              <div class="font-medium">{{ check()!.createdAt | date:'yyyy-MM-dd HH:mm' }}</div>
            </div>
          </div>
          @if (check()!.notes) {
            <div class="mt-4">
              <div class="text-gray-500 mb-1">备注</div>
              <div class="text-sm">{{ check()!.notes }}</div>
            </div>
          }
        </div>

        <!-- 差异汇总 -->
        @if (check()!.status !== 'PENDING') {
          <div class="bg-white rounded-lg shadow p-6 mb-4">
            <h3 class="font-medium text-gray-700 mb-4">差异汇总</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-3 bg-green-50 rounded-lg">
                <div class="text-green-600 text-xl font-bold">{{ getPositiveCount() }}</div>
                <div class="text-gray-500 text-sm">盘盈项数</div>
              </div>
              <div class="text-center p-3 bg-red-50 rounded-lg">
                <div class="text-red-600 text-xl font-bold">{{ getNegativeCount() }}</div>
                <div class="text-gray-500 text-sm">盘亏项数</div>
              </div>
              <div class="text-center p-3 bg-yellow-50 rounded-lg">
                <div class="text-yellow-600 text-xl font-bold">{{ getTotalDifference() | number:'1.0-4' }}</div>
                <div class="text-gray-500 text-sm">净差异量</div>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-gray-600 text-xl font-bold">{{ check()!.items?.length || 0 }}</div>
                <div class="text-gray-500 text-sm">盘点项数</div>
              </div>
            </div>
          </div>
        }

        <!-- 盘点明细 -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 class="font-medium text-gray-700">盘点明细</h3>
          </div>
          
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">批次ID</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">账面数量</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">实盘数量</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">差异数量</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">差异金额</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">备注</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (item of check()!.items || []; track item.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-900">{{ item.batchId }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ item.bookQuantity | number:'1.0-4' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ item.actualQuantity | number:'1.0-4' }}</td>
                  <td class="px-4 py-3">
                    <span [class]="getDifferenceClass(item.differenceQuantity)">
                      {{ item.differenceQuantity > 0 ? '+' : '' }}{{ item.differenceQuantity | number:'1.0-4' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ item.differenceAmount | currency:'CNY':'symbol':'1.2-2' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-500">{{ item.notes || '-' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-4 py-8 text-center text-gray-500">暂无盘点明细</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end space-x-4 mt-6">
          @if (check()!.status === 'PENDING') {
            <a [routerLink]="['/inventory/checks', check()!.id, 'execute']" 
               class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              开始盘点
            </a>
          }
          @if (check()!.status === 'IN_PROGRESS') {
            <button (click)="onApprove()"
                    class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
              审批差异
            </button>
            <button (click)="onComplete()"
                    class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              完成盘点
            </button>
          }
          @if (check()!.status === 'COMPLETED') {
            <span class="text-green-600 font-medium flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              盘点已完成
            </span>
          }
        </div>
      } @else {
        <div class="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          加载中...
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckDetailComponent implements OnInit {
  private checkService = inject(InventoryCheckService);
  private warehouseService = inject(WarehouseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  check = signal<InventoryCheck | null>(null);
  warehouseName = signal<string>('');
  checkId = '';

  ngOnInit(): void {
    this.checkId = this.route.snapshot.paramMap.get('id') || '';
    if (this.checkId) {
      this.loadCheck();
    }
  }

  loadCheck(): void {
    this.checkService.getCheckById(this.checkId).subscribe({
      next: (check) => {
        this.check.set(check);
        this.loadWarehouseName(check.warehouseId);
      },
      error: (err) => console.error('加载盘点单失败', err)
    });
  }

  loadWarehouseName(warehouseId: string): void {
    this.warehouseService.getWarehouseById(warehouseId).subscribe({
      next: (warehouse) => this.warehouseName.set(warehouse.name),
      error: () => this.warehouseName.set(warehouseId)
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': '待盘点',
      'IN_PROGRESS': '盘点中',
      'COMPLETED': '已完成'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
      'IN_PROGRESS': 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
      'COMPLETED': 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800'
    };
    return classes[status] || '';
  }

  getPositiveCount(): number {
    return this.check()?.items?.filter(item => Number(item.differenceQuantity) > 0).length || 0;
  }

  getNegativeCount(): number {
    return this.check()?.items?.filter(item => Number(item.differenceQuantity) < 0).length || 0;
  }

  getTotalDifference(): number {
    return this.check()?.items?.reduce((sum, item) => sum + Number(item.differenceQuantity), 0) || 0;
  }

  getDifferenceClass(diff: number): string {
    if (diff > 0) return 'text-green-600 font-medium';
    if (diff < 0) return 'text-red-600 font-medium';
    return 'text-gray-600';
  }

  onApprove(): void {
    if (confirm('确认审批通过所有差异？')) {
      this.checkService.approveCheck(this.checkId, true).subscribe({
        next: () => this.loadCheck(),
        error: (err) => console.error('审批失败', err)
      });
    }
  }

  onComplete(): void {
    if (confirm('确认完成盘点？库存将根据实盘数量进行调整。')) {
      this.checkService.completeCheck(this.checkId).subscribe({
        next: () => this.loadCheck(),
        error: (err) => {
          console.error('完成失败', err);
          alert('完成失败：' + (err.error?.message || err.message));
        }
      });
    }
  }
}
