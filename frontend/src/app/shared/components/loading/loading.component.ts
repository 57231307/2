import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    @if (show()) {
      <div class="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
          <div class="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          @if (text()) {
            <span class="text-gray-700">{{ text() }}</span>
          } @else {
            <span class="text-gray-700">加载中...</span>
          }
        </div>
      </div>
    }
  `
})
export class LoadingComponent {
  show = input<boolean>(false);
  text = input<string>('');
}
