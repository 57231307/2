import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-finance-list',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header title="财务管理" subtitle="财务数据管理" />
    <div class="erp-card p-6">
      <p class="text-gray-500">财务列表</p>
    </div>
  `
})
export class FinanceListComponent {}
