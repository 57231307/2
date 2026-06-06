import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 尝试恢复会话
  if (!authService.isAuthenticated()) {
    const restored = authService.restoreSession();
    if (!restored) {
      router.navigate(['/login']);
      return false;
    }
  }

  // 检查是否已认证
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
