import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { PurchaseService } from '../../services/purchase.service';
import { 询价单对比结果 } from '../../models/purchase-inquiry.model';

@Component({
  selector: 'app-inquiry-compare',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="询价单对比" subtitle="多供应商询价单价格对比">
      <button routerLink="/purchase/inquiry-list" class="erp-btn erp-btn-secondary">
        返回列表
      </button>
    </app-page-header>

    @if (isLoading()) {
      <div class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <span class="ml-3 text-gray-600">加载中...</span>
      </div>
    } @else if (compareResult()) {
      <div class="space-y-6">
        <!-- 汇总信息 -->
        <div class="erp-card">
          <h3 class="text-lg font-semibold mb-4">询价单汇总</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">询价单号</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">供应商</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">总金额</th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">最低价数量</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (summary of compareResult()!.summary; track summary.inquiryId) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ summary.inquiryNo }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ summary.supplierName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 text-right">{{ summary.totalAmount | number:'1.2-2' }}</td>
                    <td class="px-4 py-3 text-sm text-center">
                      <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {{ summary.lowestPriceCount }} 个最低价
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- 明细对比 -->
        <div class="erp-card">
          <h3 class="text-lg font-semibold mb-4">明细价格对比</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">产品</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">颜色</th>
                  @for (summary of compareResult()!.summary; track summary.inquiryId) {
                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ summary.supplierName }}<br/>
                      <span class="text-xs text-gray-400">{{ summary.inquiryNo }}</span>
                    </th>
                  }
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (item of compareResult()!.comparison; track item.productId + item.colorVariantId) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ item.productName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ item.colorName || '-' }}</td>
                    @for (detail of item.items; track detail.inquiryId) {
                      <td class="px-4 py-3 text-center">
                        <div class="text-sm text-gray-900">{{ detail.quotedPrice | number:'1.2-2' }}</div>
                        <div class="text-xs text-gray-500">{{ detail.quantity }} × {{ detail.subtotal | number:'1.2-2' }}</div>
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    } @else {
      <div class="text-center py-12 text-gray-500">
        暂无对比数据
      </div>
    }
  `
})
export class InquiryCompareComponent implements OnInit {
  private readonly purchaseService = inject(PurchaseService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isLoading = signal(false);
  compareResult = signal<询价单对比结果 | null>(null);

  ngOnInit() {
    const idsParam = this.route.snapshot.queryParamMap.get('ids');
    if (idsParam) {
      const ids = idsParam.split(',');
      this.loadComparison(ids);
    }
  }

  loadComparison(ids: string[]) {
    this.isLoading.set(true);
    this.purchaseService.compareInquiries(ids).subscribe({
      next: (result) => {
        this.compareResult.set(result);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
