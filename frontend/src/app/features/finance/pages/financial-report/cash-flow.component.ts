import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { FinanceService } from '../../services/finance.service';

@Component({
  selector: 'app-cash-flow',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">现金流量表</h1>
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
            <h2 class="text-center text-xl font-bold mb-6">现金流量表</h2>
            <p class="text-center text-sm text-gray-600 mb-6">
              报表期间：{{ reportData()?.报表期间?.开始日期 }} 至 {{ reportData()?.报表期间?.结束日期 }}
            </p>

            <table class="w-full border-collapse">
              <tbody>
                <!-- 经营活动 -->
                <tr class="bg-gray-100">
                  <td class="border px-4 py-2 font-bold" colspan="2">一、经营活动产生的现金流量</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">销售商品、提供劳务收到的现金</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.经营活动?.销售商品提供劳务收到的现金 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">购买商品、接受劳务支付的现金</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.经营活动?.购买商品接受劳务支付的现金 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">支付给职工以及为职工支付的现金</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.经营活动?.支付给职工以及为职工支付的现金 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">支付的各项税费</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.经营活动?.支付的各项税费 | number:'1.2-2' }}</td>
                </tr>
                <tr class="bg-blue-50">
                  <td class="border px-4 py-2 font-bold">经营活动现金流量净额</td>
                  <td class="border px-4 py-2 text-right font-bold" [class.text-green-600]="reportData()?.经营活动?.经营活动现金流量净额 >= 0" [class.text-red-600]="reportData()?.经营活动?.经营活动现金流量净额 < 0">
                    {{ reportData()?.经营活动?.经营活动现金流量净额 | number:'1.2-2' }}
                  </td>
                </tr>

                <!-- 投资活动 -->
                <tr class="bg-gray-100">
                  <td class="border px-4 py-2 font-bold" colspan="2">二、投资活动产生的现金流量</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">处置固定资产收回的现金净额</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.投资活动?.处置固定资产收回的现金净额 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">购建固定资产支付的现金</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.投资活动?.购建固定资产支付的现金 | number:'1.2-2' }}</td>
                </tr>
                <tr class="bg-blue-50">
                  <td class="border px-4 py-2 font-bold">投资活动现金流量净额</td>
                  <td class="border px-4 py-2 text-right font-bold" [class.text-green-600]="reportData()?.投资活动?.投资活动现金流量净额 >= 0" [class.text-red-600]="reportData()?.投资活动?.投资活动现金流量净额 < 0">
                    {{ reportData()?.投资活动?.投资活动现金流量净额 | number:'1.2-2' }}
                  </td>
                </tr>

                <!-- 筹资活动 -->
                <tr class="bg-gray-100">
                  <td class="border px-4 py-2 font-bold" colspan="2">三、筹资活动产生的现金流量</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">吸收投资收到的现金</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.筹资活动?.吸收投资收到的现金 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">取得借款收到的现金</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.筹资活动?.取得借款收到的现金 | number:'1.2-2' }}</td>
                </tr>
                <tr>
                  <td class="border px-4 py-2 pl-8">偿还债务支付的现金</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.筹资活动?.偿还债务支付的现金 | number:'1.2-2' }}</td>
                </tr>
                <tr class="bg-blue-50">
                  <td class="border px-4 py-2 font-bold">筹资活动现金流量净额</td>
                  <td class="border px-4 py-2 text-right font-bold" [class.text-green-600]="reportData()?.筹资活动?.筹资活动现金流量净额 >= 0" [class.text-red-600]="reportData()?.筹资活动?.筹资活动现金流量净额 < 0">
                    {{ reportData()?.筹资活动?.筹资活动现金流量净额 | number:'1.2-2' }}
                  </td>
                </tr>

                <!-- 现金净增加额 -->
                <tr class="bg-green-50">
                  <td class="border px-4 py-2 font-bold text-lg">四、现金及现金等价物净增加额</td>
                  <td class="border px-4 py-2 text-right font-bold text-lg" [class.text-green-600]="reportData()?.现金及现金等价物净增加额 >= 0" [class.text-red-600]="reportData()?.现金及现金等价物净增加额 < 0">
                    {{ reportData()?.现金及现金等价物净增加额 | number:'1.2-2' }}
                  </td>
                </tr>
                <tr>
                  <td class="border px-4 py-2">加：期初现金及现金等价物余额</td>
                  <td class="border px-4 py-2 text-right">{{ reportData()?.期初现金及现金等价物余额 | number:'1.2-2' }}</td>
                </tr>
                <tr class="bg-green-50">
                  <td class="border px-4 py-2 font-bold">五、期末现金及现金等价物余额</td>
                  <td class="border px-4 py-2 text-right font-bold">{{ reportData()?.期末现金及现金等价物余额 | number:'1.2-2' }}</td>
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
export class CashFlowComponent implements OnInit {
  private financeService = inject(FinanceService);

  startDate = '';
  endDate = '';
  reportData = signal<any>(null);

  ngOnInit(): void {
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
    this.financeService.getCashFlowReport(this.startDate, this.endDate).subscribe({
      next: (data) => this.reportData.set(data),
      error: (err) => console.error('加载现金流量表失败', err)
    });
  }

  printReport(): void {
    window.print();
  }
}
