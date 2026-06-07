import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private prefix = 'fabric_erp_';

  set(key: string, value: unknown): void {
    const data = JSON.stringify(value);
    localStorage.setItem(this.prefix + key, data);
  }

  get<T>(key: string, defaultValue?: T): T | null {
    const data = localStorage.getItem(this.prefix + key);
    if (data === null) {
      return defaultValue ?? null;
    }
    try {
      return JSON.parse(data) as T;
    } catch {
      return defaultValue ?? null;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  has(key: string): boolean {
    return localStorage.getItem(this.prefix + key) !== null;
  }

  setSession(key: string, value: unknown): void {
    const data = JSON.stringify(value);
    sessionStorage.setItem(this.prefix + key, data);
  }

  getSession<T>(key: string, defaultValue?: T): T | null {
    const data = sessionStorage.getItem(this.prefix + key);
    if (data === null) {
      return defaultValue ?? null;
    }
    try {
      return JSON.parse(data) as T;
    } catch {
      return defaultValue ?? null;
    }
  }

  removeSession(key: string): void {
    sessionStorage.removeItem(this.prefix + key);
  }

  clearSession(): void {
    sessionStorage.clear();
  }
}
