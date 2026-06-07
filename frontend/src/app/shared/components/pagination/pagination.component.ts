import { Component, input, output, model, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div class="flex items-center justify-between w-full">
        <div class="text-sm text-gray-700">
          共 <span class="font-medium">{{ total() }}</span> 条记录，
          第 <span class="font-medium">{{ current() }}</span> / <span class="font-medium">{{ totalPages() }}</span> 页
        </div>

        <div class="flex items-center gap-2">
          <button
            (click)="onPageChange(1)"
            [disabled]="current() === 1"
            class="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            首页
          </button>
          <button
            (click)="onPageChange(current() - 1)"
            [disabled]="current() === 1"
            class="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>

          @for (page of visiblePages(); track page) {
            @if (page === -1) {
              <span class="px-2 py-1">...</span>
            } @else {
              <button
                (click)="onPageChange(page)"
                class="px-3 py-1 text-sm rounded border"
                [class.bg-primary-600]="page === current()"
                [class.text-white]="page === current()"
                [class.border-primary-600]="page === current()"
                [class.border-gray-300]="page !== current()"
                [class.hover:bg-gray-50]="page !== current()"
              >
                {{ page }}
              </button>
            }
          }

          <button
            (click)="onPageChange(current() + 1)"
            [disabled]="current() === totalPages()"
            class="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
          <button
            (click)="onPageChange(totalPages())"
            [disabled]="current() === totalPages()"
            class="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            末页
          </button>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-700">每页</span>
          <select
            [value]="pageSize()"
            (change)="onPageSizeChange($event)"
            class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            @for (size of pageSizeOptions; track size) {
              <option [value]="size">{{ size }}条</option>
            }
          </select>
        </div>
      </div>
    </div>
  `
})
export class PaginationComponent {
  total = model<number>(0);
  current = model<number>(1);
  pageSize = model<number>(10);

  pageChange = output<number>();
  pageSizeChange = output<number>();

  pageSizeOptions = [10, 20, 50, 100];

  totalPages = computed(() => Math.ceil(this.total() / this.pageSize()) || 1);

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.current();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (current > 3) {
        pages.push(-1);
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push(-1);
      }

      pages.push(total);
    }

    return pages;
  });

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.current()) {
      return;
    }
    this.current.set(page);
    this.pageChange.emit(page);
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const size = Number(select.value);
    this.pageSize.set(size);
    this.current.set(1);
    this.pageSizeChange.emit(size);
  }
}
