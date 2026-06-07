import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { FinanceService } from '../../services/finance.service';

@Component({
  selector: 'app-balance-sheet',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">资产负债表</h1>
        <button (click)="printReport()" class="btn-secondary">打印</button>
      </div>

      <!-- 日期筛选 -->
      <div class="card mb-6">
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">报表日期</label>
              <input
                type="date"
                [(ngModel)]="asOfDate"
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
            <h2 class="text-center text-xl font-bold mb-6">资产负债表</h2>
            <p class="text-center text-sm text-gray-600 mb-6">
              报表日期：{{ reportData()?.报表日期 }}
            </p>

            <table class="w-full border-collapse">
              <tbody>
                <!-- 资产 -->
                <tr class="bg-gray-100">
                  <td class="border px-4 py-2 font-bold" colspan="2">资产</td>
                </tr>

                <!-- 流动资产 -->
                <tr class="bg-gray-50">
                  <td class="border px-4 py-2 font-medium" colspan="2">流动资产</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">货币资金</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.资产?.流动资产?.货币资金 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">应收账款</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.资产?.流动资产?.应收账款 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">存货</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.资产?.流动资产?.存货 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">预付账款</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.资产?.流动资产?.预付账款 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">其他流动资产</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.资产?.流动资产?.其他流动资产 | number:'1.2-2' }}</td>
                </tr>
                <tr class="bg-gray-100">
                  <td class="border px-4 py-2 font-medium">流动资产合计</td>
                  <td class="border px-4 py-2 text-right font-bold">{{ reportData()?.资产?.流动资产?.合计 | number:'1.2-2' }}</td>
                </tr>

                <!-- 非流动资产 -->
                <tr class="bg-gray-50">
                  <td class="border px-4 py-2 font-medium" colspan="2">非流动资产</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">固定资产</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.资产?.非流动资产?.固定资产 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">无形资产</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.资产?.非流动资产?.无形资产 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">其他非流动资产</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.资产?.非流动资产?.其他非流动资产 | number:'1.2-2' }}</td>
                </tr>
                <tr class="bg-gray-100">
                  <td class="border px-4 py-2 font-medium">非流动资产合计</td>
                  <td class="border px-4 py-2 text-right font-bold">{{ reportData()?.资产?.非流动资产?.合计 | number:'1.2-2' }}</td>
                </tr>
                <tr class="bg-blue-50">
                  <td class="border px-4 py-2 font-bold text-lg">资产总计</td>
                  <td class="border px-4 py-2 text-right font-bold text-lg">{{ reportData()?.资产?.资产合计 | number:'1.2-2' }}</td>
                </tr>

                <!-- 负债 -->
                <tr class="bg-gray-100">
                  <td class="border px-4 py-2 font-bold" colspan="2">负债</td>
                </tr>

                <!-- 流动负债 -->
                <tr class="bg-gray-50">
                  <td class="border px-4 py-2 font-medium" colspan="2">流动负债</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">应付账款</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.负债?.流动负债?.应付账款 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">应付票据</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.负债?.流动负债?.应付票据 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">预收账款</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.负债?.流动负债?.预收账款 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">应付职工薪酬</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.负债?.流动负债?.应付职工薪酬 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">应交税费</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.负债?.流动负债?.应交税费 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">其他流动负债</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.负债?.流动负债?.其他流动负债 | number:'1.2-2' }}</td>
                </tr>
                <tr class="bg-gray-100">
                  <td class="border px-4 py-2 font-medium">流动负债合计</td>
                  <td class="border px-4 py-2 text-right font-bold">{{ reportData()?.负债?.流动负债?.合计 | number:'1.2-2' }}</td>
                </tr>

                <!-- 非流动负债 -->
                <tr class="bg-gray-50">
                  <td class="border px-4 py-2 font-medium" colspan="2">非流动负债</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">长期借款</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.负债?.非流动负债?.长期借款 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">其他非流动负债</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.负债?.非流动负债?.其他非流动负债 | number:'1.2-2' }}</td>
                </tr>
                <tr class="bg-gray-100">
                  <td class="border px-4 py-2 font-medium">非流动负债合计</td>
                  <td class="border px-4 py-2 text-right font-bold">{{ reportData()?.负债?.非流动负债?.合计 | number:'1.2-2' }}</td>
                </tr>
                <tr class="bg-red-50">
                  <td class="border px-4 py-2 font-bold text-lg">负债合计</td>
                  <td class="border px-4 py-2 text-right font-bold text-lg">{{ reportData()?.负债?.负债合计 | number:'1.2-2' }}</td>
                </tr>

                <!-- 所有者权益 -->
                <tr class="bg-gray-100">
                  <td class="border px-4 py-2 font-bold" colspan="2">所有者权益</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">实收资本</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.所有者权益?.实收资本 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">未分配利润</td>
                  <td class="border px-4 py-2 text-right" [class.text-green-600]="reportData()?.所有者权益?.未分配利润 >= 0" [class.text-red-600]="reportData()?.所有者权益?.未分配利润 < 0">
                    {{ reportData()?.所有者权益?.未分配利润 | number:'1.2-2' }}
                  </td>
                </tr>
                <tr class="bg-green-50">
                  <td class="border px-4 py-2 font-bold">所有者权益合计</td>
                  <td class="border px-4 py-2 text-right font-bold">{{ reportData()?.所有者权益?.所有者权益合计 | number:'1.2-2' }}</td>
                </tr>
                <tr class="bg-blue-50">
                  <td class="border px-4 py-2 font-bold text-lg">负债和所有者权益总计</td>
                  <td class="border px-4 py-2 text-right font-bold text-lg">{{ reportData()?.负债和所有者权益合计 | number:'1.2-2' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <div class="card">
          <div class="text-center text-gray-500 py-12">
            请选择报表日期并点击查询按钮加载报表
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BalanceSheetComponent implements OnInit {
  private financeService = inject(FinanceService);

  asOfDate = '';
  reportData = signal<any>(null);

  ngOnInit(): void {
    this.asOfDate = new Date().toISOString().split('T')[0];
    this.loadReport();
  }

  loadReport(): void {
    if (!this.asOfDate) {
      alert('请选择报表日期');
      return;
    }
    this.financeService.getBalanceSheetReport(this.asOfDate).subscribe({
      next: (data) => this.reportData.set(data),
      error: (err) => console.error('加载资产负债表失败', err)
    });
  }

  printReport(): void {
    window.print();
  }
}
