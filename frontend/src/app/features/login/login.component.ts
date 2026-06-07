import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-semibold text-primary-600">面料ERP系统</h1>
            <p class="text-gray-500 mt-2">请登录您的账户</p>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label class="erp-label">用户名</label>
              <input
                type="text"
                [(ngModel)]="username"
                name="username"
                class="erp-input"
                placeholder="请输入用户名"
                required
              />
            </div>

            <div>
              <label class="erp-label">密码</label>
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                class="erp-input"
                placeholder="请输入密码"
                required
              />
            </div>

            @if (error()) {
              <div class="text-red-500 text-sm">{{ error() }}</div>
            }

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full erp-btn erp-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (loading()) {
                <span class="flex items-center justify-center gap-2">
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  登录中...
                </span>
              } @else {
                登录
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = signal(false);
  error = signal('');

  async onSubmit(): Promise<void> {
    if (!this.username || !this.password) {
      this.error.set('请输入用户名和密码');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.authService.login({
        username: this.username,
        password: this.password
      });
      this.router.navigate(['/dashboard']);
    } catch (err: unknown) {
      const error = err as { message?: string };
      this.error.set(error.message || '登录失败，请检查用户名和密码');
    } finally {
      this.loading.set(false);
    }
  }
}
