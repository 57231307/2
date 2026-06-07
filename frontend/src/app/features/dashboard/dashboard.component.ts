import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header title="工作台" subtitle="欢迎使用面料ERP管理系统" />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div class="erp-card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">今日订单</p>
            <p class="text-2xl font-semibold text-gray-900 mt-1">128</p>
          </div>
          <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-2xl">
            📦
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="text-green-500">↑ 12%</span>
          <span class="text-gray-500 ml-2">较昨日</span>
        </div>
      </div>

      <div class="erp-card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">待生产</p>
            <p class="text-2xl font-semibold text-gray-900 mt-1">45</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 text-2xl">
            🏭
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="text-red-500">↓ 5%</span>
          <span class="text-gray-500 ml-2">较昨日</span>
        </div>
      </div>

      <div class="erp-card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">库存预警</p>
            <p class="text-2xl font-semibold text-gray-900 mt-1">8</p>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 text-2xl">
            ⚠️
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm text-red-500">
          需要关注
        </div>
      </div>

      <div class="erp-card p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">本月销售额</p>
            <p class="text-2xl font-semibold text-gray-900 mt-1">¥128万</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-2xl">
            💰
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="text-green-500">↑ 23%</span>
          <span class="text-gray-500 ml-2">较上月</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="erp-card p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">近期订单</h3>
        <div class="space-y-4">
          @for (order of recentOrders; track order.id) {
            <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p class="font-medium text-gray-900">{{ order.id }}</p>
                <p class="text-sm text-gray-500">{{ order.customer }}</p>
              </div>
              <div class="text-right">
                <p class="font-medium text-gray-900">¥{{ order.amount }}</p>
                <span
                  class="text-xs px-2 py-1 rounded"
                  [class.bg-green-100]="order.status === '已完成'"
                  [class.text-green-700]="order.status === '已完成'"
                  [class.bg-yellow-100]="order.status === '处理中'"
                  [class.text-yellow-700]="order.status === '处理中'"
                >
                  {{ order.status }}
                </span>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="erp-card p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">库存预警</h3>
        <div class="space-y-4">
          @for (item of inventoryAlerts; track item.id) {
            <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p class="font-medium text-gray-900">{{ item.name }}</p>
                <p class="text-sm text-gray-500">SKU: {{ item.sku }}</p>
              </div>
              <div class="text-right">
                <p class="font-medium text-red-600">{{ item.stock }}</p>
                <p class="text-xs text-gray-500">库存不足</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  recentOrders = [
    { id: 'ORD-2024-001', customer: '张三服装厂', amount: '12,800', status: '已完成' },
    { id: 'ORD-2024-002', customer: '李四纺织', amount: '8,500', status: '处理中' },
    { id: 'ORD-2024-003', customer: '王五制衣', amount: '15,200', status: '已完成' },
    { id: 'ORD-2024-004', customer: '赵六面料', amount: '6,800', status: '处理中' },
  ];

  inventoryAlerts = [
    { id: 1, name: '纯棉弹力布', sku: 'COT-001', stock: 120 },
    { id: 2, name: '涤纶仿真丝', sku: 'POL-002', stock: 85 },
    { id: 3, name: '亚麻混纺布', sku: 'LIN-003', stock: 200 },
    { id: 4, name: '雪纺印花布', sku: 'CHA-004', stock: 50 },
  ];
}
