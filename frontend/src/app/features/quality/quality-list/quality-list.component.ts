import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-quality-list',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header title="质量管理" subtitle="质量检验管理" />
    <div class="erp-card p-6">
      <p class="text-gray-500">质量检验列表</p>
    </div>
  `
})
export class QualityListComponent {}
