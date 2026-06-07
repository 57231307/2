import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { PurchaseService } from '../../services/purchase.service';

@Component({
  selector: 'app-purchase-summary',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">采购汇总报表</h1>
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

      <!-- 汇总数据 -->
      @if (reportData()) {
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="card bg-blue-50">
            <div class="p-4 text-center">
              <p class="text-sm text-gray-600">订单总数量</p>
              <p class="text-2xl font-bold text-blue-600">{{ reportData()?.汇总数据?.订单总数量 }}</p>
            </div>
          </div>
          <div class="card bg-green-50">
            <div class="p-4 text-center">
              <p class="text-sm text-gray-600">订单总金额</p>
              <p class="text-2xl font-bold text-green-600">{{ reportData()?.汇总数据?.订单总金额 | number:'1.2-2' }}</p>
            </div>
          </div>
          <div class="card bg-yellow-50">
            <div class="p-4 text-center">
              <p class="text-sm text-gray-600">已入库金额</p>
              <p class="text-2xl font-bold text-yellow-600">{{ reportData()?.汇总数据?.已入库总金额 | number:'1.2-2' }}</p>
            </div>
          </div>
          <div class="card bg-purple-50">
            <div class="p-4 text-center">
              <p class="text-sm text-gray-600">整体入库率</p>
              <p class="text-2xl font-bold text-purple-600">{{ reportData()?.汇总数据?.整体入库率 | number:'1.2-2' }}%</p>
            </div>
          </div>
        </div>

        <!-- 供应商明细 -->
        <div class="card" id="print-area">
          <div class="p-4">
            <h3 class="text-lg font-medium text-gray-800 mb-4">供应商采购明细</h3>
            @if (reportData()?.供应商明细?.length > 0) {
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">供应商名称</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">订单数量</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">订单金额</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">已入库金额</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">入库率</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">已付款金额</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">付款率</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  @for (item of reportData()?.供应商明细; track $index) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-4 py-2 text-sm text-gray-800">{{ item.供应商名称 }}</td>
                      <td class="px-4 py-2 text-sm text-right text-gray-600">{{ item.订单数量 }}</td>
                      <td class="px-4 py-2 text-sm text-right text-gray-800">{{ item.订单金额 | number:'1.2-2' }}</td>
                      <td class="px-4 py-2 text-sm text-right text-gray-800">{{ item.已入库金额 | number:'1.2-2' }}</td>
                      <td class="px-4 py-2 text-sm text-right">
                        <span [class.text-green-600]="item.入库率 >= 80" [class.text-yellow-600]="item.入库率 >= 50 && item.入库率 < 80" [class.text-red-600]="item.入库率 < 50">
                          {{ item.入库率 | number:'1.2-2' }}%
                        </span>
                      </td>
                      <td class="px-4 py-2 text-sm text-right text-gray-800">{{ item.已付款金额 | number:'1.2-2' }}</td>
                      <td class="px-4 py-2 text-sm text-right">
                        <span [class.text-green-600]="item.付款率 >= 80" [class.text-yellow-600]="item.付款率 >= 50 && item.付款率 < 80" [class.text-red-600]="item.付款率 < 50">
                          {{ item.付款率 | number:'1.2-2' }}%
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <div class="text-center text-gray-500 py-8">暂无数据</div>
            }
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
export class SummaryComponent implements OnInit {
  private purchaseService = inject(PurchaseService);

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
    this.purchaseService.getPurchaseSummaryReport(this.startDate, this.endDate).subscribe({
      next: (data) => this.reportData.set(data),
      error: (err) => console.error('加载采购汇总报表失败', err)
    });
  }

  printReport(): void {
    window.print();
  }
}
