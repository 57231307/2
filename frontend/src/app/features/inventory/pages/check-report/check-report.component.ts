import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InventoryCheckService } from '../../services/inventory-check.service';

interface 盘点报告 {
  checkId: string;
  checkNo: string;
  checkDate: Date;
  warehouseName: string;
  checkType: string;
  status: string;
  manager: string;
  completedAt: Date;
  summary: {
    totalBookQuantity: number;
    totalActualQuantity: number;
    totalDifferenceQuantity: number;
    totalDifferenceAmount: number;
    itemCount: number;
    qualifiedRate: number;
  };
  items: {
    batchNo: string;
    productName: string;
    colorName: string;
    unit: string;
    bookQuantity: number;
    actualQuantity: number;
    differenceQuantity: number;
    differenceAmount: number;
  }[];
}

@Component({
  selector: 'app-check-report',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="盘点报告" subtitle="查看盘点报表详情">
      <div class="flex gap-2">
        <button (click)="printReport()" class="erp-btn erp-btn-primary">
          打印报告
        </button>
        <button routerLink="/inventory/check-list" class="erp-btn erp-btn-secondary">
          返回列表
        </button>
      </div>
    </app-page-header>

    @if (isLoading()) {
      <div class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <span class="ml-3 text-gray-600">加载中...</span>
      </div>
    } @else if (report()) {
      <div class="space-y-6" id="printArea">
        <!-- 基本信息 -->
        <div class="erp-card">
          <h3 class="text-lg font-semibold mb-4">盘点基本信息</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span class="text-sm text-gray-500">盘点单号</span>
              <p class="font-medium">{{ report()!.checkNo }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">仓库</span>
              <p class="font-medium">{{ report()!.warehouseName }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">盘点日期</span>
              <p class="font-medium">{{ report()!.checkDate | date:'yyyy-MM-dd' }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">盘点类型</span>
              <p class="font-medium">{{ report()!.checkType === 'FULL' ? '全盘' : '抽盘' }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">负责人</span>
              <p class="font-medium">{{ report()!.manager || '-' }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">完成时间</span>
              <p class="font-medium">{{ report()!.completedAt | date:'yyyy-MM-dd HH:mm' }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">状态</span>
              <p class="font-medium">{{ report()!.status }}</p>
            </div>
          </div>
        </div>

        <!-- 汇总信息 -->
        <div class="erp-card">
          <h3 class="text-lg font-semibold mb-4">盘点汇总</h3>
          <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{{ report()!.summary.itemCount }}</div>
              <div class="text-sm text-gray-500">盘点项数</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{{ report()!.summary.totalBookQuantity | number:'1.2-2' }}</div>
              <div class="text-sm text-gray-500">账面数量</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900">{{ report()!.summary.totalActualQuantity | number:'1.2-2' }}</div>
              <div class="text-sm text-gray-500">实盘数量</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold" [class.text-green-600]="report()!.summary.totalDifferenceQuantity >= 0" [class.text-red-600]="report()!.summary.totalDifferenceQuantity < 0">
                {{ report()!.summary.totalDifferenceQuantity | number:'1.2-2' }}
              </div>
              <div class="text-sm text-gray-500">差异数量</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold" [class.text-green-600]="report()!.summary.totalDifferenceAmount >= 0" [class.text-red-600]="report()!.summary.totalDifferenceAmount < 0">
                {{ report()!.summary.totalDifferenceAmount | number:'1.2-2' }}
              </div>
              <div class="text-sm text-gray-500">差异金额</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ report()!.summary.qualifiedRate | number:'1.1-1' }}%</div>
              <div class="text-sm text-gray-500">合格率</div>
            </div>
          </div>
        </div>

        <!-- 明细列表 -->
        <div class="erp-card">
          <h3 class="text-lg font-semibold mb-4">盘点明细</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">批次号</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">产品</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">颜色</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">账面数量</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">实盘数量</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">差异数量</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">差异金额</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (item of report()!.items; track item.batchNo) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ item.batchNo }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ item.productName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ item.colorName || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 text-right">{{ item.bookQuantity | number:'1.2-2' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 text-right">{{ item.actualQuantity | number:'1.2-2' }}</td>
                    <td class="px-4 py-3 text-right">
                      <span [class.text-green-600]="item.differenceQuantity >= 0" [class.text-red-600]="item.differenceQuantity < 0">
                        {{ item.differenceQuantity | number:'1.2-2' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <span [class.text-green-600]="item.differenceAmount >= 0" [class.text-red-600]="item.differenceAmount < 0">
                        {{ item.differenceAmount | number:'1.2-2' }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    } @else {
      <div class="text-center py-12 text-gray-500">
        暂无报告数据
      </div>
    }
  `
})
export class CheckReportComponent implements OnInit {
  private readonly checkService = inject(InventoryCheckService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isLoading = signal(false);
  report = signal<盘点报告 | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReport(id);
    }
  }

  loadReport(id: string) {
    this.isLoading.set(true);
    this.checkService.getReport(id).subscribe({
      next: (result) => {
        this.report.set(result);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  printReport() {
    window.print();
  }
}
