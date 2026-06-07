import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header title="库存管理" subtitle="查看和管理库存数据" />
    <div class="erp-card p-6">
      <p class="text-gray-500">库存列表页面</p>
    </div>
  `
})
export class InventoryListComponent {}
