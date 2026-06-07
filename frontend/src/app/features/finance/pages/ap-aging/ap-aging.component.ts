import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../services/finance.service';

interface AgingBucket {
  range: string;
  amount: number;
  percentage: number;
  count: number;
}

interface SupplierDistribution {
  supplierName: string;
  amount: number;
  percentage: number;
}

interface OverdueAlert {
  id: string;
  documentNo: string;
  supplierName: string;
  amount: number;
  balance: number;
  dueDate: Date;
  overdueDays: number;
  severity: 'warning' | 'danger' | 'critical';
}

@Component({
  selector: 'app-ap-aging',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">应付款账龄分析</h1>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="card p-4">
          <div class="text-sm text-gray-500">应付总额</div>
          <div class="text-2xl font-bold text-gray-800">¥{{ getTotalAmount() | number: '1.2-2' }}</div>
        </div>
        @for (bucket of agingReport()?.ranges || []; track bucket.range) {
          <div class="card p-4">
            <div class="text-sm text-gray-500">{{ bucket.range }}</div>
            <div class="text-2xl font-bold" [class.text-green-600]="bucket.amount === 0" [class.text-orange-600]="bucket.amount > 0 && bucket.count <= 3" [class.text-red-600]="bucket.count > 3">
              ¥{{ bucket.amount | number: '1.2-2' }}
            </div>
            <div class="text-xs text-gray-400 mt-1">{{ bucket.count }} 笔 | {{ bucket.percentage }}%</div>
          </div>
        }
      </div>

      <!-- 逾期预警 -->
      @if (overdueAlerts().length > 0) {
        <div class="card mb-6 border-l-4 border-red-500">
          <div class="p-4">
            <h2 class="text-lg font-bold text-red-600 mb-3">逾期预警</h2>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-red-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-medium text-red-700">单据编号</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-red-700">供应商名称</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-red-700">应付金额</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-red-700">待付金额</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-red-700">到期日期</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-red-700">逾期天数</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-red-700">严重程度</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-red-100">
                  @for (alert of overdueAlerts(); track alert.id) {
                    <tr class="hover:bg-red-50">
                      <td class="px-4 py-2 text-sm text-gray-800">{{ alert.documentNo }}</td>
                      <td class="px-4 py-2 text-sm text-gray-800">{{ alert.supplierName }}</td>
                      <td class="px-4 py-2 text-sm text-right text-gray-800">¥{{ alert.amount | number: '1.2-2' }}</td>
                      <td class="px-4 py-2 text-sm text-right text-red-600 font-medium">¥{{ alert.balance | number: '1.2-2' }}</td>
                      <td class="px-4 py-2 text-sm text-gray-600">{{ alert.dueDate | date: 'yyyy-MM-dd' }}</td>
                      <td class="px-4 py-2 text-sm font-medium" [class.text-orange-600]="alert.severity === 'warning'" [class.text-red-600]="alert.severity === 'danger'" [class.text-purple-600]="alert.severity === 'critical'">
                        {{ alert.overdueDays }} 天
                      </td>
                      <td class="px-4 py-2">
                        <span [class]="getSeverityClass(alert.severity)">
                          {{ getSeverityLabel(alert.severity) }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- 账龄区间表格 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="card">
          <div class="p-4 border-b">
            <h2 class="text-lg font-bold text-gray-800">账龄区间分布</h2>
          </div>
          <div class="p-4">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">账龄区间</th>
                  <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">金额</th>
                  <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">占比</th>
                  <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">笔数</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (bucket of agingReport()?.ranges || []; track bucket.range) {
                  <tr class="hover:bg-gray-50" [class.bg-red-50]="bucket.range === '90天以上'">
                    <td class="px-4 py-2 text-sm text-gray-800">
                      {{ bucket.range }}
                      @if (bucket.range === '90天以上') {
                        <span class="ml-2 text-xs text-red-600 font-medium">高风险</span>
                      }
                    </td>
                    <td class="px-4 py-2 text-sm text-right font-medium" [class.text-red-600]="bucket.range === '90天以上'">
                      ¥{{ bucket.amount | number: '1.2-2' }}
                    </td>
                    <td class="px-4 py-2 text-sm text-right text-gray-600">{{ bucket.percentage }}%</td>
                    <td class="px-4 py-2 text-sm text-right text-gray-600">{{ bucket.count }}</td>
                  </tr>
                }
              </tbody>
              <tfoot class="bg-gray-50 font-medium">
                <tr>
                  <td class="px-4 py-2 text-sm">合计</td>
                  <td class="px-4 py-2 text-sm text-right">¥{{ getTotalAmount() | number: '1.2-2' }}</td>
                  <td class="px-4 py-2 text-sm text-right">100%</td>
                  <td class="px-4 py-2 text-sm text-right">{{ getTotalCount() }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- 供应商分布 -->
        <div class="card">
          <div class="p-4 border-b">
            <h2 class="text-lg font-bold text-gray-800">供应商分布</h2>
          </div>
          <div class="p-4">
            @if (agingReport()?.suppliers?.length) {
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">供应商名称</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">金额</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">占比</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  @for (supplier of agingReport()?.suppliers || []; track supplier.supplierName) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-4 py-2 text-sm text-gray-800">{{ supplier.supplierName }}</td>
                      <td class="px-4 py-2 text-sm text-right font-medium">¥{{ supplier.amount | number: '1.2-2' }}</td>
                      <td class="px-4 py-2 text-sm text-right text-gray-600">{{ supplier.percentage }}%</td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <div class="text-center text-gray-500 py-8">暂无供应商分布数据</div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApAgingComponent implements OnInit {
  private financeService = inject(FinanceService);

  agingReport = signal<{
    totalAmount: number;
    ranges: AgingBucket[];
    suppliers: SupplierDistribution[];
  } | null>(null);

  overdueAlerts = signal<OverdueAlert[]>([]);

  ngOnInit(): void {
    this.loadAgingReport();
    this.loadOverdueAlerts();
  }

  loadAgingReport(): void {
    this.financeService.getApAgingReport().subscribe({
      next: (result: any) => {
        // 将后端返回的中文键名转换为英文
        const data = result.data;
        this.agingReport.set({
          totalAmount: data.总金额,
          ranges: data.账龄区间.map((b: any) => ({
            range: b.区间,
            amount: b.金额,
            percentage: b.占比,
            count: b.笔数
          })),
          suppliers: data.供应商分布?.map((s: any) => ({
            supplierName: s.供应商名称,
            amount: s.金额,
            percentage: s.占比
          })) || []
        });
      },
      error: (err) => console.error('加载账龄报表失败', err)
    });
  }

  loadOverdueAlerts(): void {
    this.financeService.getApOverdueAlerts().subscribe({
      next: (result: any) => {
        this.overdueAlerts.set(result.data);
      },
      error: (err) => console.error('加载逾期预警失败', err)
    });
  }

  getTotalAmount(): number {
    return this.agingReport()?.totalAmount || 0;
  }

  getTotalCount(): number {
    const buckets = this.agingReport()?.ranges || [];
    return buckets.reduce((sum, b) => sum + b.count, 0);
  }

  getSeverityClass(severity: string): string {
    const classes: Record<string, string> = {
      warning: 'px-2 py-1 text-xs rounded bg-orange-100 text-orange-700',
      danger: 'px-2 py-1 text-xs rounded bg-red-100 text-red-700',
      critical: 'px-2 py-1 text-xs rounded bg-purple-100 text-purple-700'
    };
    return classes[severity] || '';
  }

  getSeverityLabel(severity: string): string {
    const labels: Record<string, string> = {
      warning: '轻度',
      danger: '中度',
      critical: '严重'
    };
    return labels[severity] || severity;
  }
}
