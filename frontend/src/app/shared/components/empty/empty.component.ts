import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-12 text-center">
      <div class="text-6xl mb-4">{{ icon() }}</div>
      <h3 class="text-lg font-medium text-gray-900 mb-1">{{ title() }}</h3>
      @if (description()) {
        <p class="text-sm text-gray-500 max-w-sm">{{ description() }}</p>
      }
      <div class="mt-4">
        <ng-content />
      </div>
    </div>
  `
})
export class EmptyComponent {
  icon = input<string>('📭');
  title = input<string>('暂无数据');
  description = input<string>('');
}
