import { Component, output, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div class="flex items-center gap-4">
        <button
          (click)="toggleSidebar.emit()"
          class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span class="text-lg">☰</span>
        </button>
        <div class="text-sm text-gray-500">
          <span class="font-medium">{{ currentDate }}</span>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <!-- 消息通知 -->
        <button class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative">
          <span class="text-lg">🔔</span>
          <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <!-- 用户信息 -->
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-600 font-medium text-sm">
              {{ user()?.nickname?.charAt(0) || '用户' }}
            </span>
          </div>
          <div class="hidden md:block">
            <div class="text-sm font-medium text-gray-700">{{ user()?.nickname || '未登录' }}</div>
            <div class="text-xs text-gray-500">{{ user()?.username || '' }}</div>
          </div>
        </div>

        <!-- 退出按钮 -->
        <button
          (click)="logout()"
          class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="退出登录"
        >
          <span class="text-lg">🚪</span>
        </button>
      </div>
    </header>
  `
})
export class HeaderComponent {
  toggleSidebar = output<void>();

  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.user;

  get currentDate(): string {
    const now = new Date();
    return now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
