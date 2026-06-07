import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorMessage {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorsSignal = signal<ErrorMessage[]>([]);
  readonly errors = this.errorsSignal.asReadonly();

  handleError(error: HttpErrorResponse): void {
    let message = '未知错误';

    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else {
      switch (error.status) {
        case 400:
          message = error.error?.message || '请求参数错误';
          break;
        case 401:
          message = '登录已过期，请重新登录';
          break;
        case 403:
          message = '没有权限访问该资源';
          break;
        case 404:
          message = '请求的资源不存在';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        default:
          message = error.error?.message || `请求失败: ${error.status}`;
      }
    }

    this.addError(message);
  }

  addError(message: string, type: ErrorMessage['type'] = 'error'): void {
    const error: ErrorMessage = {
      id: crypto.randomUUID(),
      message,
      type,
      timestamp: Date.now()
    };
    this.errorsSignal.update(errors => [...errors, error]);
    this.removeAfterDelay(error.id);
  }

  removeError(id: string): void {
    this.errorsSignal.update(errors => errors.filter(e => e.id !== id));
  }

  clearErrors(): void {
    this.errorsSignal.set([]);
  }

  private removeAfterDelay(id: string, delay: number = 5000): void {
    setTimeout(() => this.removeError(id), delay);
  }
}
