import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FinanceService } from '../../services/finance.service';

interface CostVariance {
  id: string;
  analysisNo: string;
  workOrderId: string | null;
  workOrderNo: string | null;
  orderId: string | null;
  orderNo: string | null;
  productName: string | null;
  productCode: string | null;
  standardCost: number;
  actualCost: number;
  varianceAmount: number;
  varianceRate: number;
  varianceReason: string | null;
  analysisDate: string;
  analyst: string;
  remark: string | null;
}

@Component({
  selector: 'app-cost-variance-list',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe, RouterLink],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">成本差异分析</h1>
        <button (click)="navigateToForm()" class="btn-primary">
          新建分析
        </button>
      </div>

      <!-- 筛选条件 -->
      <div class="card mb-6">
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">关键词</label>
              <input
                type="text"
                [(ngModel)]="searchKeyword"
                (keyup.enter)="loadData()"
                class="input-field w-full"
                placeholder="分析编号/订单号"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
              <input
                type="date"
                [(ngModel)]="startDate"
                class="input-field w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
              <input
                type="date"
                [(ngModel)]="endDate"
                class="input-field w-full"
              />
            </div>
            <div class="flex items-end gap-2">
              <button (click)="loadData()" class="btn-primary">查询</button>
              <button (click)="resetFilter()" class="btn-secondary">重置</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 差异图表 -->
      @if (chartData().length > 0) {
        <div class="card mb-6">
          <h3 class="text-lg font-medium text-gray-800 mb-4">成本差异趋势</h3>
          <div class="flex items-end gap-4 h-48">
            @for (item of chartData(); track item.label) {
              <div class="flex flex-col items-center flex-1">
                <div
                  class="w-full rounded-t transition-all"
                  [style.height.%]="item.height"
                  [class.bg-green-500]="item.value >= 0"
                  [class.bg-red-500]="item.value < 0"
                ></div>
                <span class="text-xs text-gray-600 mt-1">{{ item.label }}</span>
                <span class="text-xs" [class.text-green-600]="item.value >= 0" [class.text-red-600]="item.value < 0">
                  {{ item.value | number:'1.0-0' }}
                </span>
              </div>
            }
          </div>
        </div>
      }

      <!-- 数据列表 -->
      <div class="card">
        <div class="p-4">
          @if (dataList().length > 0) {
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">分析编号</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">订单编号</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">产品</th>
                  <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">标准成本</th>
                  <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">实际成本</th>
                  <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">差异金额</th>
                  <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">差异率</th>
                  <th class="px-4 py-2 text-center text-sm font-medium text-gray-600">分析日期</th>
                  <th class="px-4 py-2 text-center text-sm font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (item of dataList(); track item.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-2 text-sm text-gray-800">{{ item.analysisNo }}</td>
                    <td class="px-4 py-2 text-sm text-gray-600">{{ item.orderNo || '-' }}</td>
                    <td class="px-4 py-2 text-sm text-gray-600">{{ item.productName || '-' }}</td>
                    <td class="px-4 py-2 text-sm text-right text-gray-800">{{ item.standardCost | number:'1.2-2' }}</td>
                    <td class="px-4 py-2 text-sm text-right text-gray-800">{{ item.actualCost | number:'1.2-2' }}</td>
                    <td class="px-4 py-2 text-sm text-right" [class.text-green-600]="item.varianceAmount >= 0" [class.text-red-600]="item.varianceAmount < 0">
                      {{ item.varianceAmount | number:'1.2-2' }}
                    </td>
                    <td class="px-4 py-2 text-sm text-right" [class.text-green-600]="item.varianceRate >= 0" [class.text-red-600]="item.varianceRate < 0">
                      {{ item.varianceRate | number:'1.2-2' }}%
                    </td>
                    <td class="px-4 py-2 text-sm text-center text-gray-600">{{ item.analysisDate | date:'yyyy-MM-dd' }}</td>
                    <td class="px-4 py-2 text-center">
                      <button (click)="viewDetail(item)" class="text-blue-600 hover:text-blue-800 text-sm">查看</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>

            <!-- 分页 -->
            <div class="flex justify-between items-center mt-4">
              <span class="text-sm text-gray-600">共 {{ total() }} 条</span>
              <div class="flex gap-2">
                <button
                  (click)="prevPage()"
                  [disabled]="page() === 1"
                  class="btn-secondary disabled:opacity-50"
                >
                  上一页
                </button>
                <span class="px-4 py-2 text-sm text-gray-600">
                  第 {{ page() }} / {{ totalPages() }} 页
                </span>
                <button
                  (click)="nextPage()"
                  [disabled]="page() >= totalPages()"
                  class="btn-secondary disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            </div>
          } @else {
            <div class="text-center text-gray-500 py-8">暂无数据</div>
          }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CostVarianceListComponent implements OnInit {
  private financeService = inject(FinanceService);
  private router = inject(Router);

  dataList = signal<CostVariance[]>([]);
  total = signal(0);
  page = signal(1);
  pageSize = 20;

  searchKeyword = '';
  startDate = '';
  endDate = '';

  chartData = signal<{ label: string; value: number; height: number }[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const params: any = {
      page: this.page(),
      limit: this.pageSize,
    };
    if (this.searchKeyword) params.keyword = this.searchKeyword;
    if (this.startDate) params.startDate = this.startDate;
    if (this.endDate) params.endDate = this.endDate;

    this.financeService.getCostVarianceList(params).subscribe({
      next: (result: any) => {
        this.dataList.set(result.data || []);
        this.total.set(result.total || 0);
        this.updateChart();
      },
      error: (err) => console.error('加载成本差异分析列表失败', err)
    });
  }

  updateChart(): void {
    const items = this.dataList().slice(0, 7);
    const maxAbs = Math.max(...items.map(i => Math.abs(i.varianceAmount)), 1);
    this.chartData.set(items.map(item => ({
      label: item.analysisNo.slice(-4),
      value: item.varianceAmount,
      height: (Math.abs(item.varianceAmount) / maxAbs) * 80 + 10
    })));
  }

  totalPages(): number {
    return Math.ceil(this.total() / this.pageSize) || 1;
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.loadData();
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.loadData();
    }
  }

  resetFilter(): void {
    this.searchKeyword = '';
    this.startDate = '';
    this.endDate = '';
    this.page.set(1);
    this.loadData();
  }

  navigateToForm(): void {
    this.router.navigate(['/finance/cost-variance/form']);
  }

  viewDetail(item: CostVariance): void {
    this.router.navigate(['/finance/cost-variance/form'], { queryParams: { id: item.id } });
  }
}
