import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { PurchaseService } from '../../services/purchase.service';

@Component({
  selector: 'app-supplier-performance',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">供应商采购绩效报表</h1>
        <button (click)="printReport()" class="btn-secondary">打印</button>
      </div>

      <!-- 供应商选择 -->
      <div class="card mb-6">
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">选择供应商</label>
              <select [(ngModel)]="selectedSupplierId" (change)="loadReport()" class="input-field w-full">
                <option value="">请选择供应商</option>
                @for (supplier of suppliers(); track supplier.id) {
                  <option [value]="supplier.id">{{ supplier.supplierName }}</option>
                }
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 报表内容 -->
      @if (reportData()) {
        <div class="space-y-6" id="print-area">
          <!-- 供应商基本信息 -->
          <div class="card">
            <div class="p-4">
              <h3 class="text-lg font-medium text-gray-800 mb-4">供应商信息</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p class="text-xs text-gray-500">供应商名称</p>
                  <p class="text-sm font-medium text-gray-800">{{ reportData()?.供应商名称 }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">供应商编号</p>
                  <p class="text-sm text-gray-600">{{ reportData()?.供应商编号 }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">合作开始日期</p>
                  <p class="text-sm text-gray-600">{{ reportData()?.合作开始日期 | date:'yyyy-MM-dd' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">联系人</p>
                  <p class="text-sm text-gray-600">{{ reportData()?.联系人 || '-' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 绩效数据 -->
          <div class="card">
            <div class="p-4">
              <h3 class="text-lg font-medium text-gray-800 mb-4">采购绩效数据</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center p-3 bg-blue-50 rounded">
                  <p class="text-xs text-gray-500">订单数量</p>
                  <p class="text-2xl font-bold text-blue-600">{{ reportData()?.绩效数据?.订单数量 }}</p>
                </div>
                <div class="text-center p-3 bg-green-50 rounded">
                  <p class="text-xs text-gray-500">订单金额</p>
                  <p class="text-2xl font-bold text-green-600">{{ reportData()?.绩效数据?.订单金额 | number:'1.2-2' }}</p>
                </div>
                <div class="text-center p-3 bg-yellow-50 rounded">
                  <p class="text-xs text-gray-500">准时交货率</p>
                  <p class="text-2xl font-bold text-yellow-600">{{ reportData()?.绩效数据?.准时交货率 | number:'1.2-2' }}%</p>
                </div>
                <div class="text-center p-3 bg-purple-50 rounded">
                  <p class="text-xs text-gray-500">质量合格率</p>
                  <p class="text-2xl font-bold text-purple-600">{{ reportData()?.绩效数据?.质量合格率 | number:'1.2-2' }}%</p>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center p-3 bg-gray-50 rounded">
                  <p class="text-xs text-gray-500">平均交货周期</p>
                  <p class="text-lg font-bold text-gray-600">{{ reportData()?.绩效数据?.平均交货周期 || 0 }}天</p>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded">
                  <p class="text-xs text-gray-500">响应速度评分</p>
                  <p class="text-lg font-bold text-gray-600">{{ reportData()?.绩效数据?.响应速度评分 || 0 }}</p>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded">
                  <p class="text-xs text-gray-500">价格竞争力评分</p>
                  <p class="text-lg font-bold text-gray-600">{{ reportData()?.绩效数据?.价格竞争力评分 || 0 }}</p>
                </div>
                <div class="text-center p-3 bg-indigo-50 rounded">
                  <p class="text-xs text-gray-500">综合评分</p>
                  <p class="text-2xl font-bold text-indigo-600">{{ reportData()?.绩效数据?.综合评分 | number:'1.2-2' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 历史评估 -->
          <div class="card">
            <div class="p-4">
              <h3 class="text-lg font-medium text-gray-800 mb-4">历史评估记录</h3>
              @if (reportData()?.历史评估?.length > 0) {
                <table class="w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">评估日期</th>
                      <th class="px-4 py-2 text-center text-sm font-medium text-gray-600">评估等级</th>
                      <th class="px-4 py-2 text-right text-sm font-medium text-gray-600">评估得分</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    @for (evaluation of reportData()?.历史评估; track $index) {
                      <tr class="hover:bg-gray-50">
                        <td class="px-4 py-2 text-sm text-gray-600">{{ evaluation.评估日期 | date:'yyyy-MM-dd' }}</td>
                        <td class="px-4 py-2 text-center">
                          <span [class]="getLevelClass(evaluation.评估等级)">{{ evaluation.评估等级 }}</span>
                        </td>
                        <td class="px-4 py-2 text-sm text-right text-gray-800">{{ evaluation.评估得分 | number:'1.2-2' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else {
                <div class="text-center text-gray-500 py-8">暂无评估记录</div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="card">
          <div class="text-center text-gray-500 py-12">
            请选择供应商并点击查询按钮加载报表
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupplierPerformanceComponent implements OnInit {
  private purchaseService = inject(PurchaseService);

  selectedSupplierId = '';
  reportData = signal<any>(null);
  suppliers = signal<any[]>([]);

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.purchaseService.getSuppliers().subscribe({
      next: (data) => this.suppliers.set(data || []),
      error: (err) => console.error('加载供应商列表失败', err)
    });
  }

  loadReport(): void {
    if (!this.selectedSupplierId) {
      this.reportData.set(null);
      return;
    }
    this.purchaseService.getSupplierPerformanceReport(this.selectedSupplierId).subscribe({
      next: (data) => this.reportData.set(data),
      error: (err) => {
        console.error('加载供应商绩效报表失败', err);
        this.reportData.set(null);
      }
    });
  }

  getLevelClass(level: string): string {
    const classes: Record<string, string> = {
      'A': 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
      'B': 'px-2 py-1 text-xs rounded bg-blue-100 text-blue-700',
      'C': 'px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700',
      'D': 'px-2 py-1 text-xs rounded bg-red-100 text-red-700',
    };
    return classes[level] || 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-700';
  }

  printReport(): void {
    window.print();
  }
}
