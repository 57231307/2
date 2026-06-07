import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { InventoryAlertService } from '../../services/inventory-alert.service';
import { InventoryAlertItem, AlertSummary } from '../../models/alert.model';

type AlertTab = 'low-stock' | 'over-stock' | 'expiry';

@Component({
  selector: 'app-alert-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">库存预警</h1>
      </div>

      <!-- 预警汇总卡片 -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-sm text-gray-500">低库存预警</div>
          <div class="text-2xl font-bold text-red-600">{{ summary().lowStockCount }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-sm text-gray-500">超储预警</div>
          <div class="text-2xl font-bold text-orange-600">{{ summary().overStockCount }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-sm text-gray-500">效期预警</div>
          <div class="text-2xl font-bold text-yellow-600">{{ summary().expiryCount }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-sm text-gray-500">总计</div>
          <div class="text-2xl font-bold text-gray-800">{{ summary().totalCount }}</div>
        </div>
      </div>

      <!-- 标签页 -->
      <div class="bg-white rounded-lg shadow">
        <div class="border-b">
          <nav class="flex">
            <button
              (click)="switchTab('low-stock')"
              [class]="getTabClass('low-stock')">
              低库存预警 ({{ summary().lowStockCount }})
            </button>
            <button
              (click)="switchTab('over-stock')"
              [class]="getTabClass('over-stock')">
              超储预警 ({{ summary().overStockCount }})
            </button>
            <button
              (click)="switchTab('expiry')"
              [class]="getTabClass('expiry')">
              效期预警 ({{ summary().expiryCount }})
            </button>
          </nav>
        </div>

        <!-- 低库存预警列表 -->
        <div [hidden]="currentTab() !== 'low-stock'">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">产品</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">颜色</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">当前库存</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">安全库存</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">差额</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (item of lowStockAlerts(); track item.productId) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-900">{{ item.productName }}</td>
                  <td class="px-4 py-3 text-sm text-gray-500">
                    {{ item.colorCode || '-' }} {{ item.colorName || '' }}
                  </td>
                  <td class="px-4 py-3 text-sm text-right text-red-600">{{ item.currentQuantity }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-500">{{ item.threshold }}</td>
                  <td class="px-4 py-3 text-sm text-right text-red-600 font-bold">{{ item.diff }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-4 py-8 text-center text-gray-500">暂无低库存预警</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- 超储预警列表 -->
        <div [hidden]="currentTab() !== 'over-stock'">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">产品</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">颜色</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">当前库存</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">最高库存</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">差额</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (item of overStockAlerts(); track item.productId) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-900">{{ item.productName }}</td>
                  <td class="px-4 py-3 text-sm text-gray-500">
                    {{ item.colorCode || '-' }} {{ item.colorName || '' }}
                  </td>
                  <td class="px-4 py-3 text-sm text-right text-orange-600">{{ item.currentQuantity }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-500">{{ item.threshold }}</td>
                  <td class="px-4 py-3 text-sm text-right text-orange-600 font-bold">{{ item.diff }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-4 py-8 text-center text-gray-500">暂无超储预警</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- 效期预警列表 -->
        <div [hidden]="currentTab() !== 'expiry'">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">缸号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">匹号</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">仓库</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">数量</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">有效期</th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">剩余天数</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (item of expiryAlerts(); track item.batchId) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-900">{{ item.batchNo }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ item.rollNo }}</td>
                  <td class="px-4 py-3 text-sm text-gray-500">{{ item.warehouseName || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-900">{{ item.currentQuantity }}</td>
                  <td class="px-4 py-3 text-sm text-gray-500">{{ item.expiryDate | date:'yyyy-MM-dd' }}</td>
                  <td class="px-4 py-3 text-center">
                    <span [class]="getDaysClass(item.daysUntilExpiry)">
                      {{ item.daysUntilExpiry }}天
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-4 py-8 text-center text-gray-500">暂无效期预警</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertListComponent implements OnInit {
  private alertService = inject(InventoryAlertService);

  currentTab = signal<AlertTab>('low-stock');
  summary = signal<AlertSummary>({ lowStockCount: 0, overStockCount: 0, expiryCount: 0, totalCount: 0 });
  lowStockAlerts = signal<InventoryAlertItem[]>([]);
  overStockAlerts = signal<InventoryAlertItem[]>([]);
  expiryAlerts = signal<InventoryAlertItem[]>([]);

  ngOnInit(): void {
    this.loadSummary();
    this.loadAlerts();
  }

  switchTab(tab: AlertTab): void {
    this.currentTab.set(tab);
  }

  loadSummary(): void {
    this.alertService.getAlertSummary().subscribe({
      next: (data) => this.summary.set(data),
      error: (err) => console.error('加载预警汇总失败', err)
    });
  }

  loadAlerts(): void {
    this.alertService.getLowStockAlerts().subscribe({
      next: (data) => this.lowStockAlerts.set(data),
      error: (err) => console.error('加载低库存预警失败', err)
    });

    this.alertService.getOverStockAlerts().subscribe({
      next: (data) => this.overStockAlerts.set(data),
      error: (err) => console.error('加载超储预警失败', err)
    });

    this.alertService.getExpiryAlerts().subscribe({
      next: (data) => this.expiryAlerts.set(data),
      error: (err) => console.error('加载效期预警失败', err)
    });
  }

  getTabClass(tab: AlertTab): string {
    const baseClass = 'px-6 py-3 text-sm font-medium border-b-2 -mb-px';
    const activeClass = 'text-blue-600 border-blue-600';
    const inactiveClass = 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300';

    return this.currentTab() === tab
      ? `${baseClass} ${activeClass}`
      : `${baseClass} ${inactiveClass}`;
  }

  getDaysClass(days?: number): string {
    if (!days) return '';
    if (days <= 7) return 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800';
    if (days <= 15) return 'px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800';
    return 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800';
  }
}
