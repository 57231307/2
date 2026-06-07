import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { InventoryCheckService, InventoryCheck, InventoryCheckItem, SubmitCheckDto } from '../../services/inventory-check.service';

@Component({
  selector: 'app-check-execute',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">执行盘点</h1>
        <a [routerLink]="['/inventory/checks', checkId]" class="text-gray-600 hover:text-gray-800">
          返回详情
        </a>
      </div>

      @if (check()) {
        <!-- 盘点单信息 -->
        <div class="bg-white rounded-lg shadow p-4 mb-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-gray-500">盘点单号：</span>
              <span class="font-medium">{{ check()!.checkNo }}</span>
            </div>
            <div>
              <span class="text-gray-500">盘点类型：</span>
              <span class="font-medium">{{ check()!.checkType === 'FULL' ? '全盘' : '抽盘' }}</span>
            </div>
            <div>
              <span class="text-gray-500">盘点日期：</span>
              <span class="font-medium">{{ check()!.checkDate | date:'yyyy-MM-dd' }}</span>
            </div>
            <div>
              <span class="text-gray-500">负责人：</span>
              <span class="font-medium">{{ check()!.manager || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 盘点明细 -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 class="font-medium text-gray-700">盘点明细（共 {{ items().length }} 项）</h3>
          </div>
          
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">批次编码</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">账面数量</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">实盘数量</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">差异</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">备注</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (item of items(); track item.id; let i = $index) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-900">{{ item.batchId }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ item.bookQuantity | number:'1.0-4' }}</td>
                  <td class="px-4 py-3">
                    <input type="number" 
                           [(ngModel)]="item.actualQuantity"
                           [name]="'actual-' + i"
                           min="0"
                           step="0.0001"
                           class="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                           (input)="calculateDifference(item)">
                  </td>
                  <td class="px-4 py-3">
                    <span [class]="getDifferenceClass(item.differenceQuantity)">
                      {{ item.differenceQuantity > 0 ? '+' : '' }}{{ item.differenceQuantity | number:'1.0-4' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <input type="text"
                           [(ngModel)]="item.notes"
                           [name]="'notes-' + i"
                           placeholder="备注"
                           class="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-4 py-8 text-center text-gray-500">暂无盘点明细</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- 差异汇总 -->
        <div class="bg-white rounded-lg shadow p-4 mt-4">
          <h3 class="font-medium text-gray-700 mb-3">差异汇总</h3>
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-green-600 text-lg font-bold">{{ getPositiveCount() }}</div>
              <div class="text-gray-500">盘盈</div>
            </div>
            <div class="text-center p-3 bg-red-50 rounded-lg">
              <div class="text-red-600 text-lg font-bold">{{ getNegativeCount() }}</div>
              <div class="text-gray-500">盘亏</div>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-gray-600 text-lg font-bold">{{ items().length }}</div>
              <div class="text-gray-500">总项数</div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end space-x-4 mt-6">
          <a [routerLink]="['/inventory/checks', checkId]" 
             class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            取消
          </a>
          <button (click)="onSubmit()" 
                  [disabled]="!hasChanges()"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed">
            提交盘点结果
          </button>
        </div>
      } @else {
        <div class="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          加载中...
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckExecuteComponent implements OnInit {
  private checkService = inject(InventoryCheckService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  check = signal<InventoryCheck | null>(null);
  items = signal<InventoryCheckItem[]>([]);
  checkId = '';
  originalItems: InventoryCheckItem[] = [];

  ngOnInit(): void {
    this.checkId = this.route.snapshot.paramMap.get('id') || '';
    if (this.checkId) {
      this.loadCheck();
    }
  }

  loadCheck(): void {
    this.checkService.getCheckById(this.checkId).subscribe({
      next: (check) => {
        this.check.set(check);
        if (check.items) {
          this.items.set(check.items.map(item => ({ ...item })));
          this.originalItems = check.items.map(item => ({ ...item }));
        }
      },
      error: (err) => console.error('加载盘点单失败', err)
    });
  }

  calculateDifference(item: InventoryCheckItem): void {
    item.differenceQuantity = Number(item.actualQuantity) - Number(item.bookQuantity);
  }

  getDifferenceClass(diff: number): string {
    if (diff > 0) return 'text-green-600 font-medium';
    if (diff < 0) return 'text-red-600 font-medium';
    return 'text-gray-600';
  }

  getPositiveCount(): number {
    return this.items().filter(item => Number(item.differenceQuantity) > 0).length;
  }

  getNegativeCount(): number {
    return this.items().filter(item => Number(item.differenceQuantity) < 0).length;
  }

  hasChanges(): boolean {
    const currentItems = this.items();
    return currentItems.some((item, index) => {
      return Number(item.actualQuantity) !== Number(this.originalItems[index]?.actualQuantity);
    });
  }

  onSubmit(): void {
    const submitData: SubmitCheckDto = {
      items: this.items().map(item => ({
        batchId: item.batchId,
        actualQuantity: Number(item.actualQuantity),
        notes: item.notes
      }))
    };

    this.checkService.submitCheck(this.checkId, submitData.items).subscribe({
      next: () => this.router.navigate(['/inventory/checks', this.checkId]),
      error: (err) => console.error('提交失败', err)
    });
  }
}
