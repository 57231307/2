import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            @for (column of columns(); track column.key) {
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                [style.width]="column.width || 'auto'"
                [style.text-align]="column.align || 'left'"
              >
                {{ column.label }}
              </th>
            }
            @if (showActions()) {
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            }
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          @if (loading()) {
            <tr>
              <td [attr.colspan]="columns().length + (showActions() ? 1 : 0)" class="px-4 py-8 text-center text-gray-500">
                <div class="flex items-center justify-center gap-2">
                  <div class="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>加载中...</span>
                </div>
              </td>
            </tr>
          } @else if (data().length === 0) {
            <tr>
              <td [attr.colspan]="columns().length + (showActions() ? 1 : 0)" class="px-4 py-8 text-center text-gray-500">
                暂无数据
              </td>
            </tr>
          } @else {
            @for (row of data(); track trackFn()(row); let i = $index) {
              <tr
                class="hover:bg-gray-50 transition-colors"
                [class.bg-gray-50]="i % 2 === 1"
              >
                @for (column of columns(); track column.key) {
                  <td
                    class="px-4 py-3 text-sm text-gray-900"
                    [style.text-align]="column.align || 'left'"
                  >
                    <ng-content [select]="'[slot=' + column.key + ']'" />
                    {{ getValue(row, column.key) }}
                  </td>
                }
                @if (showActions()) {
                  <td class="px-4 py-3 text-right text-sm">
                    <ng-content select="[slot=actions]" />
                  </td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `
})
export class DataTableComponent<T> {
  columns = input.required<TableColumn[]>();
  data = input.required<T[]>();
  loading = input<boolean>(false);
  showActions = input<boolean>(false);
  trackFn = input<(row: T) => unknown>((row) => row);

  getValue(row: T, key: string): unknown {
    return (row as Record<string, unknown>)[key];
  }
}
