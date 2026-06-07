import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SaleService } from '../../services/sale.service';
import { SaleQuotation, QuotationStatus } from '../../models/sale.model';

@Component({
  selector: 'app-quotation-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">报价单详情</h1>
        <button
          (click)="goBack()"
          class="btn-secondary"
        >
          返回
        </button>
      </div>

      @if (quotation()) {
        <!-- 基本信息 -->
        <div class="card mb-4">
          <h3 class="text-lg font-medium text-gray-800 mb-4">基本信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="text-sm text-gray-500">报价单号</label>
              <p class="text-gray-800 font-medium">{{ quotation()!.quotationNo }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-500">客户名称</label>
              <p class="text-gray-800">{{ quotation()!.customerName }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-500">报价单状态</label>
              <p>
                <span [class]="getStatusClass(quotation()!.status)">
                  {{ getStatusText(quotation()!.status) }}
                </span>
              </p>
            </div>
            <div>
              <label class="text-sm text-gray-500">报价日期</label>
              <p class="text-gray-800">{{ quotation()!.quotationDate | date: 'yyyy-MM-dd' }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-500">有效期至</label>
              <p class="text-gray-800">{{ quotation()!.validUntil | date: 'yyyy-MM-dd' }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-500">备注</label>
              <p class="text-gray-800">{{ quotation()!.remark || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- 产品明细 -->
        <div class="card mb-4">
          <h3 class="text-lg font-medium text-gray-800 mb-4">产品明细</h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">产品名称</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">颜色代码</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">颜色名称</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">数量</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">单位</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">单价</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">金额</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (item of quotation()!.items; track item.id) {
                  <tr>
                    <td class="px-4 py-3 text-sm text-gray-800">{{ item.productName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ item.colorCode }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ item.colorName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800">{{ item.quantity }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ item.unit }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800">¥{{ item.unitPrice | number: '1.2-2' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 font-medium">¥{{ item.amount | number: '1.2-2' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- 价格汇总 -->
        <div class="card mb-4">
          <h3 class="text-lg font-medium text-gray-800 mb-4">价格汇总</h3>
          <div class="flex justify-end">
            <div class="w-80 space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">总价：</span>
                <span class="text-gray-800 font-medium">¥{{ quotation()!.totalAmount | number: '1.2-2' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">折扣率：</span>
                <span class="text-gray-800 font-medium">{{ quotation()!.discountRate * 100 | number: '1.0-0' }}%</span>
              </div>
              <div class="flex justify-between text-lg">
                <span class="text-gray-800 font-medium">折后价：</span>
                <span class="text-primary-600 font-bold">¥{{ quotation()!.finalAmount | number: '1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-between items-center">
          <div class="flex gap-3">
            @if (quotation()!.status === statusDraft) {
              <button
                (click)="editQuotation()"
                class="btn-primary"
              >
                编辑
              </button>
              <button
                (click)="confirmQuotation()"
                class="btn-secondary"
              >
                确认
              </button>
            }
            @if (quotation()!.status === statusConfirmed) {
              <button
                (click)="convertToOrder()"
                class="btn-primary"
              >
                转订单
              </button>
            }
          </div>
          <div class="flex gap-3">
            @if (quotation()!.status === statusDraft) {
              <button
                (click)="deleteQuotation()"
                class="btn-danger"
              >
                删除
              </button>
            }
          </div>
        </div>
      } @else {
        <div class="card">
          <p class="text-center text-gray-500 py-8">加载中...</p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuotationDetailComponent implements OnInit {
  private readonly saleService = inject(SaleService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly QuotationStatus = QuotationStatus;
  // 模板中使用的状态常量
  readonly statusDraft = 'draft';
  readonly statusConfirmed = 'confirmed';

  quotation = signal<SaleQuotation | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadQuotation(id);
    } else {
      this.goBack();
    }
  }

  loadQuotation(id: string): void {
    this.saleService.getQuotation(id).subscribe({
      next: (quotation) => {
        this.quotation.set(quotation);
      },
      error: (err) => {
        console.error('加载报价单失败', err);
        alert('加载报价单失败');
        this.goBack();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/sales/quotations']);
  }

  editQuotation(): void {
    this.router.navigate(['/sales/quotations', this.quotation()!.id, 'edit']);
  }

  confirmQuotation(): void {
    if (confirm(`确定要确认报价单 ${this.quotation()!.quotationNo} 吗？`)) {
      this.saleService.confirmQuotation(this.quotation()!.id).subscribe({
        next: () => {
          alert('确认成功');
          this.loadQuotation(this.quotation()!.id);
        },
        error: (err) => {
          console.error('确认报价单失败', err);
          alert('确认失败：' + (err.error?.message || '未知错误'));
        },
      });
    }
  }

  convertToOrder(): void {
    if (confirm(`确定要将报价单 ${this.quotation()!.quotationNo} 转化为销售订单吗？`)) {
      this.saleService.convertQuotationToOrder(this.quotation()!.id).subscribe({
        next: (order) => {
          alert(`订单创建成功，订单号：${order.orderNo}`);
          this.router.navigate(['/sales/orders']);
        },
        error: (err) => {
          console.error('转订单失败', err);
          alert('转订单失败：' + (err.error?.message || '未知错误'));
        },
      });
    }
  }

  deleteQuotation(): void {
    if (confirm(`确定要删除报价单 ${this.quotation()!.quotationNo} 吗？`)) {
      this.saleService.deleteQuotation(this.quotation()!.id).subscribe({
        next: () => {
          alert('删除成功');
          this.goBack();
        },
        error: (err) => {
          console.error('删除报价单失败', err);
          alert('删除失败：' + (err.error?.message || '未知错误'));
        },
      });
    }
  }

  getStatusClass(status: QuotationStatus): string {
    const classes: Record<QuotationStatus, string> = {
      [QuotationStatus.草稿]: 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-600',
      [QuotationStatus.已确认]: 'px-2 py-1 text-xs rounded bg-blue-100 text-blue-700',
      [QuotationStatus.已转订单]: 'px-2 py-1 text-xs rounded bg-green-100 text-green-700',
      [QuotationStatus.已过期]: 'px-2 py-1 text-xs rounded bg-red-100 text-red-700',
    };
    return classes[status] || '';
  }

  getStatusText(status: QuotationStatus): string {
    const texts: Record<QuotationStatus, string> = {
      [QuotationStatus.草稿]: '草稿',
      [QuotationStatus.已确认]: '已确认',
      [QuotationStatus.已转订单]: '已转订单',
      [QuotationStatus.已过期]: '已过期',
    };
    return texts[status] || status;
  }
}
