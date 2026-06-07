import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header title="销售管理" subtitle="管理销售订单" />
    <div class="erp-card p-6">
      <p class="text-gray-500">销售订单列表</p>
    </div>
  `
})
export class SalesListComponent {}
