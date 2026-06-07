import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '@env/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  roles: string[];
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserInfo;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_info';

  private userSignal = signal<UserInfo | null>(this.getUserFromStorage());
  private loadingSignal = signal<boolean>(false);

  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.userSignal());
  readonly loading = this.loadingSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(request: LoginRequest): Promise<AuthResponse> {
    this.loadingSignal.set(true);
    return new Promise((resolve, reject) => {
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request)
        .subscribe({
          next: (response) => {
            this.setToken(response.token);
            this.setUser(response.user);
            this.loadingSignal.set(false);
            resolve(response);
          },
          error: (err) => {
            this.loadingSignal.set(false);
            reject(err);
          }
        });
    });
  }

  logout(): void {
    this.removeToken();
    this.removeUser();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getUser(): UserInfo | null {
    return this.userSignal();
  }

  setUser(user: UserInfo): void {
    this.userSignal.set(user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  hasRole(role: string): boolean {
    const user = this.userSignal();
    return user?.roles.includes(role) ?? false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.userSignal();
    return user?.roles.some(r => roles.includes(r)) ?? false;
  }

  private getUserFromStorage(): UserInfo | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private removeUser(): void {
    this.userSignal.set(null);
    localStorage.removeItem(this.USER_KEY);
  }

  refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    return new Promise((resolve, reject) => {
      this.http.post<{ token: string }>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
        .subscribe({
          next: (response) => {
            this.setToken(response.token);
            resolve(response.token);
          },
          error: (err) => {
            this.logout();
            reject(err);
          }
        });
    });
  }
}
