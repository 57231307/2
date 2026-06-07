import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { PurchaseService } from '../../services/purchase.service';

@Component({
  selector: 'app-purchase-detail',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">采购明细报表</h1>
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
        <div class="card mb-6">
          <div class="p-4">
            <h3 class="text-lg font-medium text-gray-800 mb-4">合计数据</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-3 bg-gray-50 rounded">
                <p class="text-xs text-gray-500">订单数量</p>
                <p class="text-lg font-bold text-gray-800">{{ reportData()?.合计?.订单数量 }}</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded">
                <p class="text-xs text-gray-500">订单金额</p>
                <p class="text-lg font-bold text-gray-800">{{ reportData()?.合计?.订单金额 | number:'1.2-2' }}</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded">
                <p class="text-xs text-gray-500">已入库数量</p>
                <p class="text-lg font-bold text-gray-800">{{ reportData()?.合计?.已入库数量 }}</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded">
                <p class="text-xs text-gray-500">入库金额</p>
                <p class="text-lg font-bold text-gray-800">{{ reportData()?.合计?.入库金额 | number:'1.2-2' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card" id="print-area">
          <div class="p-4">
            <h3 class="text-lg font-medium text-gray-800 mb-4">采购明细列表</h3>
            @if (reportData()?.明细列表?.length > 0) {
              <div class="overflow-x-auto">
                <table class="w-full min-w-[1200px]">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">订单编号</th>
                      <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">订单日期</th>
                      <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">供应商</th>
                      <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">产品</th>
                      <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">单位</th>
                      <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">订单数量</th>
                      <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">订单单价</th>
                      <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">订单金额</th>
                      <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">已入库数量</th>
                      <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">入库金额</th>
                      <th class="px-4 py-2 text-center text-sm font-medium text-gray-600">状态</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    @for (item of reportData()?.明细列表; track $index) {
                      <tr class="hover:bg-gray-50">
                        <td class="px-4 py-2 text-sm text-gray-800">{{ item.订单编号 }}</td>
                        <td class="px-4 py-2 text-sm text-gray-600">{{ item.订单日期 | date:'yyyy-MM-dd' }}</td>
                        <td class="px-4 py-2 text-sm text-gray-600">{{ item.供应商名称 }}</td>
                        <td class="px-4 py-2 text-sm text-gray-600">{{ item.产品名称 }}</td>
                        <td class="px-4 py-2 text-sm text-right text-gray-600">{{ item.单位 }}</td>
                        <td class="px-4 py-2 text-sm text-right text-gray-800">{{ item.订单数量 | number:'1.0-0' }}</td>
                        <td class="px-4 py-2 text-sm text-right text-gray-800">{{ item.订单单价 | number:'1.2-2' }}</td>
                        <td class="px-4 py-2 text-sm text-right text-gray-800">{{ item.订单金额 | number:'1.2-2' }}</td>
                        <td class="px-4 py-2 text-sm text-right">
                          <span [class.text-green-600]="item.已入库数量 >= item.订单数量" [class.text-yellow-600]="item.已入库数量 > 0 && item.已入库数量 < item.订单数量" [class.text-gray-400]="item.已入库数量 === 0">
                            {{ item.已入库数量 | number:'1.0-0' }}
                          </span>
                        </td>
                        <td class="px-4 py-2 text-sm text-right text-gray-800">{{ item.入库金额 | number:'1.2-2' }}</td>
                        <td class="px-4 py-2 text-center">
                          <span [class]="getStatusClass(item.订单状态)">{{ item.订单状态 }}</span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
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
export class DetailComponent implements OnInit {
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
    this.purchaseService.getPurchaseDetailReport(this.startDate, this.endDate).subscribe({
      next: (data) => this.reportData.set(data),
      error: (err) => console.error('加载采购明细报表失败', err)
    });
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700',
      'APPROVED': 'px-2 py-1 text-xs rounded bg-blue-100 text-blue-700',
      'COMPLETED': 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
      'CANCELLED': 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-700',
    };
    return classes[status] || 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-700';
  }

  printReport(): void {
    window.print();
  }
}
