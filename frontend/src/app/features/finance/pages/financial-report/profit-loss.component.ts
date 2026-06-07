import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { FinanceService } from '../../services/finance.service';

@Component({
  selector: 'app-profit-loss',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">利润表</h1>
        <button (click)="printReport()" class="btn-secondary">打印</button>
      </div>

      <!-- 日期筛选 -->
      <div class="card mb-6">
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <button (click)="loadReport()" class="btn-primary">查询</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 报表内容 -->
      @if (reportData()) {
        <div class="card" id="print-area">
          <div class="p-6">
            <h2 class="text-center text-xl font-bold mb-6">利润表</h2>
            <p class="text-center text-sm text-gray-600 mb-6">
              报表期间：{{ reportData()?.报表期间?.开始日期 }} 至 {{ reportData()?.报表期间?.结束日期 }}
            </p>

            <table class="w-full border-collapse">
              <tbody>
                <!-- 营业收入 -->
                <tr class="bg-gray-50">
                  <td class="border px-4 py-2 font-medium" colspan="2">一、营业收入</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">其中：销售收入</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.营业收入?.销售收入 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">其他收入</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.营业收入?.其他收入 | number:'1.2-2' }}</td>
                </tr>
                <tr class="bg-gray-100">
                  <td class="border px-4 py-2 font-medium">营业收入合计</td>
                  <td class="border px-4 py-2 text-right font-bold">{{ reportData()?.营业收入?.合计 | number:'1.2-2' }}</td>
                </tr>

                <!-- 营业成本 -->
                <tr class="bg-gray-50">
                  <td class="border px-4 py-2 font-medium" colspan="2">二、营业成本</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">其中：销售成本</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.营业成本?.销售成本 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">其他成本</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.营业成本?.其他成本 | number:'1.2-2' }}</td>
                </tr>
                <tr class="bg-gray-100">
                  <td class="border px-4 py-2 font-medium">营业成本合计</td>
                  <td class="border px-4 py-2 text-right font-bold">{{ reportData()?.营业成本?.合计 | number:'1.2-2' }}</td>
                </tr>

                <!-- 毛利 -->
                <tr class="bg-blue-50">
                  <td class="border px-4 py-2 font-bold">三、毛利</td>
                  <td class="border px-4 py-2 text-right font-bold" [class.text-green-600]="reportData()?.毛利 >= 0" [class.text-red-600]="reportData()?.毛利 < 0">
                    {{ reportData()?.毛利 | number:'1.2-2' }}
                  </td>
                </tr>

                <!-- 营业费用 -->
                <tr class="bg-gray-50">
                  <td class="border px-4 py-2 font-medium" colspan="2">四、营业费用</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">销售费用</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.营业费用?.销售费用 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">管理费用</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.营业费用?.管理费用 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">财务费用</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.营业费用?.财务费用 | number:'1.2-2' }}</td>
                </tr>
                <tr class="bg-gray-100">
                  <td class="border px-4 py-2 font-medium">营业费用合计</td>
                  <td class="border px-4 py-2 text-right font-bold">{{ reportData()?.营业费用?.合计 | number:'1.2-2' }}</td>
                </tr>

                <!-- 营业利润 -->
                <tr class="bg-blue-50">
                  <td class="border px-4 py-2 font-bold">五、营业利润</td>
                  <td class="border px-4 py-2 text-right font-bold" [class.text-green-600]="reportData()?.营业利润 >= 0" [class.text-red-600]="reportData()?.营业利润 < 0">
                    {{ reportData()?.营业利润 | number:'1.2-2' }}
                  </td>
                </tr>

                <!-- 所得税 -->
                <tr>
                  <td class="border px-4 py-2">减：所得税</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.所得税 | number:'1.2-2' }}</td>
                </tr>

                <!-- 净利润 -->
                <tr class="bg-green-50">
                  <td class="border px-4 py-2 font-bold text-lg">六、净利润</td>
                  <td class="border px-4 py-2 text-right font-bold text-lg" [class.text-green-600]="reportData()?.净利润 >= 0" [class.text-red-600]="reportData()?.净利润 < 0">
                    {{ reportData()?.净利润 | number:'1.2-2' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <div class="card">
          <div class="text-center text-gray-500 py-12">
            请选择日期范围并点击查询按钮加载报表
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfitLossComponent implements OnInit {
  private financeService = inject(FinanceService);

  startDate = '';
  endDate = '';
  reportData = signal<any>(null);

  ngOnInit(): void {
    // 设置默认日期范围（本月）
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.startDate = firstDay.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
    this.loadReport();
  }

  loadReport(): void {
    if (!this.startDate || !this.endDate) {
      alert('请选择日期范围');
      return;
    }
    this.financeService.getProfitLossReport(this.startDate, this.endDate).subscribe({
      next: (data) => this.reportData.set(data),
      error: (err) => console.error('加载利润表失败', err)
    });
  }

  printReport(): void {
    window.print();
  }
}
