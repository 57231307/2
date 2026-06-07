import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { FinanceService } from '../../services/finance.service';

interface CostBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
}

interface MaterialDetail {
  materialName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface VarianceAnalysisItem {
  type: '有利' | '不利';
  item: string;
  budget: number;
  actual: number;
  variance: number;
}

@Component({
  selector: 'app-cost-accounting',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">成本核算</h1>
      </div>

      <!-- 查询条件 -->
      <div class="card mb-6">
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">订单编号</label>
              <input
                type="text"
                [(ngModel)]="orderId"
                placeholder="请输入订单编号"
                class="input-field w-full"
              />
            </div>
            <div class="flex items-end gap-2">
              <button (click)="calculateCost()" class="btn-primary">
                计算成本
              </button>
              <button (click)="analyzeVariance()" class="btn-secondary">
                差异分析
              </button>
            </div>
          </div>
        </div>
      </div>

      @if (actualCostData()) {
        <!-- 成本构成卡片 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- 成本构成饼图数据展示 -->
          <div class="card">
            <div class="p-4 border-b">
              <h2 class="text-lg font-bold text-gray-800">成本构成</h2>
            </div>
            <div class="p-4">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">成本项目</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">金额</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">占比</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  @for (item of actualCostData()?.breakdown || []; track item.category) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-4 py-2 text-sm text-gray-800">
                        <span class="inline-block w-3 h-3 rounded-full mr-2" [class]="getCostColor(item.category)"></span>
                        {{ item.category }}
                      </td>
                      <td class="px-4 py-2 text-sm text-right font-medium">¥{{ item.amount | number: '1.2-2' }}</td>
                      <td class="px-4 py-2 text-sm text-right text-gray-600">{{ item.percentage }}%</td>
                    </tr>
                  }
                </tbody>
                <tfoot class="bg-gray-50 font-medium">
                  <tr>
                    <td class="px-4 py-2 text-sm">合计</td>
                    <td class="px-4 py-2 text-sm text-right">¥{{ actualCostData()?.totalCost | number: '1.2-2' }}</td>
                    <td class="px-4 py-2 text-sm text-right">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- 成本汇总 -->
          <div class="card">
            <div class="p-4 border-b">
              <h2 class="text-lg font-bold text-gray-800">成本汇总</h2>
            </div>
            <div class="p-4">
              <div class="space-y-4">
                <div class="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span class="text-sm text-gray-600">预算成本</span>
                  <span class="text-lg font-bold text-blue-600">¥{{ actualCostData()?.budgetCost | number: '1.2-2' }}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-orange-50 rounded">
                  <span class="text-sm text-gray-600">实际成本</span>
                  <span class="text-lg font-bold text-orange-600">¥{{ actualCostData()?.actualCost | number: '1.2-2' }}</span>
                </div>
                <div class="flex justify-between items-center p-3 rounded" [class.bg-green-50]="actualCostData()?.costVariance <= 0" [class.bg-red-50]="actualCostData()?.costVariance > 0">
                  <span class="text-sm text-gray-600">成本差异</span>
                  <div class="text-right">
                    <span class="text-lg font-bold" [class.text-green-600]="actualCostData()?.costVariance <= 0" [class.text-red-600]="actualCostData()?.costVariance > 0">
                      {{ actualCostData()?.costVariance > 0 ? '+' : '' }}¥{{ actualCostData()?.costVariance | number: '1.2-2' }}
                    </span>
                    <span class="text-sm ml-2" [class.text-green-600]="actualCostData()?.varianceRate <= 0" [class.text-red-600]="actualCostData()?.varianceRate > 0">
                      ({{ actualCostData()?.varianceRate > 0 ? '+' : '' }}{{ actualCostData()?.varianceRate }}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      @if (varianceData()) {
        <!-- 差异分析 -->
        <div class="card mb-6">
          <div class="p-4 border-b">
            <h2 class="text-lg font-bold text-gray-800">成本差异分析</h2>
          </div>
          <div class="p-4">
            <table class="w-full mb-4">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">类型</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">项目</th>
                  <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">预算</th>
                  <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">实际</th>
                  <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">差异</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (item of varianceData()?.items || []; track item.item) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-2">
                      <span [class]="item.type === '有利' ? 'px-2 py-1 text-xs rounded bg-green-100 text-green-700' : 'px-2 py-1 text-xs rounded bg-red-100 text-red-700'">
                        {{ item.type }}
                      </span>
                    </td>
                    <td class="px-4 py-2 text-sm text-gray-800">{{ item.item }}</td>
                    <td class="px-4 py-2 text-sm text-right text-gray-600">¥{{ item.budget | number: '1.2-2' }}</td>
                    <td class="px-4 py-2 text-sm text-right text-gray-600">¥{{ item.actual | number: '1.2-2' }}</td>
                    <td class="px-4 py-2 text-sm text-right font-medium" [class.text-green-600]="item.variance < 0" [class.text-red-600]="item.variance > 0">
                      {{ item.variance > 0 ? '+' : '' }}¥{{ item.variance | number: '1.2-2' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>

            @if (varianceData()?.suggestions?.length) {
              <div class="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h3 class="font-medium text-yellow-800 mb-2">改进建议</h3>
                <ul class="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  @for (suggestion of varianceData()?.suggestions || []; track suggestion) {
                    <li>{{ suggestion }}</li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>
      }

      @if (costReportData()) {
        <!-- 生产成本报表 -->
        <div class="card">
          <div class="p-4 border-b">
            <h2 class="text-lg font-bold text-gray-800">生产成本报表</h2>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- 工单信息 -->
              <div>
                <h3 class="font-medium text-gray-800 mb-3">工单信息</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">工单编号</span>
                    <span class="font-medium">{{ costReportData()?.orderNo }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">产品数量</span>
                    <span>{{ costReportData()?.productInfo?.quantity }} {{ costReportData()?.productInfo?.unit }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">总成本</span>
                    <span class="font-bold text-orange-600">¥{{ costReportData()?.totalCost | number: '1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">单位成本</span>
                    <span class="font-medium">¥{{ costReportData()?.unitCost | number: '1.2-2' }}</span>
                  </div>
                </div>
              </div>

              <!-- 工时统计 -->
              <div>
                <h3 class="font-medium text-gray-800 mb-3">工时统计</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">计划工时</span>
                    <span>{{ costReportData()?.laborHours?.plannedHours }} h</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">实际工时</span>
                    <span>{{ costReportData()?.laborHours?.actualHours }} h</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">效率</span>
                    <span class="font-medium" [class.text-green-600]="costReportData()?.laborHours?.efficiency >= 100" [class.text-red-600]="costReportData()?.laborHours?.efficiency < 100">
                      {{ costReportData()?.laborHours?.efficiency }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 材料明细 -->
            @if (costReportData()?.materials?.length) {
              <div class="mt-6">
                <h3 class="font-medium text-gray-800 mb-3">材料明细</h3>
                <table class="w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">物料名称</th>
                      <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">数量</th>
                      <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">单位成本</th>
                      <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">总成本</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    @for (item of costReportData()?.materials || []; track item.materialName) {
                      <tr class="hover:bg-gray-50">
                        <td class="px-4 py-2 text-sm text-gray-800">{{ item.materialName }}</td>
                        <td class="px-4 py-2 text-sm text-right text-gray-600">{{ item.quantity | number: '1.2-2' }}</td>
                        <td class="px-4 py-2 text-sm text-right text-gray-600">¥{{ item.unitCost | number: '1.2-2' }}</td>
                        <td class="px-4 py-2 text-sm text-right font-medium">¥{{ item.totalCost | number: '1.2-2' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CostAccountingComponent implements OnInit {
  private financeService = inject(FinanceService);

  orderId = '';
  productionOrderId = '';

  actualCostData = signal<any>(null);
  varianceData = signal<any>(null);
  costReportData = signal<any>(null);

  ngOnInit(): void {}

  calculateCost(): void {
    if (!this.orderId) {
      alert('请输入订单编号');
      return;
    }
    this.financeService.calculateActualCost(this.orderId).subscribe({
      next: (result: any) => {
        const data = result.data;
        // 转换中文键名为英文
        this.actualCostData.set({
          breakdown: data.成本构成?.map((c: any) => ({
            category: c.类别,
            amount: c.金额,
            percentage: c.占比
          })) || [],
          budgetCost: data.预算成本,
          actualCost: data.实际成本 || data.总成本,
          costVariance: data.成本差异,
          varianceRate: data.差异率,
          totalCost: data.总成本,
          orderNo: data.订单编号
        });
      },
      error: (err) => console.error('计算成本失败', err)
    });
  }

  analyzeVariance(): void {
    if (!this.orderId) {
      alert('请输入订单编号');
      return;
    }
    this.financeService.getCostVariance(this.orderId).subscribe({
      next: (result: any) => {
        const data = result.data;
        this.varianceData.set({
          items: data.差异分析?.map((v: any) => ({
            type: v.类型,
            item: v.项目,
            budget: v.预算,
            actual: v.实际,
            variance: v.差异
          })) || [],
          suggestions: data.改进建议 || []
        });
      },
      error: (err) => console.error('分析差异失败', err)
    });
  }

  loadCostReport(): void {
    if (!this.productionOrderId) {
      alert('请输入生产工单编号');
      return;
    }
    this.financeService.getCostReport(this.productionOrderId).subscribe({
      next: (result: any) => {
        const data = result.data;
        this.costReportData.set({
          orderNo: data.工单编号,
          productInfo: {
            quantity: data.产品信息?.数量,
            unit: data.产品信息?.单位
          },
          totalCost: data.总成本,
          unitCost: data.单位成本,
          laborHours: {
            plannedHours: data.工时统计?.计划工时,
            actualHours: data.工时统计?.实际工时,
            efficiency: data.工时统计?.效率
          },
          materials: data.材料明细?.map((m: any) => ({
            materialName: m.物料名称,
            quantity: m.数量,
            unitCost: m.单位成本,
            totalCost: m.总成本
          })) || []
        });
      },
      error: (err) => console.error('加载成本报表失败', err)
    });
  }

  getCostColor(category: string): string {
    const colors: Record<string, string> = {
      '直接材料': 'bg-blue-500',
      '直接人工': 'bg-green-500',
      '制造费用': 'bg-orange-500'
    };
    return colors[category] || 'bg-gray-500';
  }
}
