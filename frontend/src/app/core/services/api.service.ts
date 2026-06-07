import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface ApiOptions {
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  get<T>(path: string, options?: ApiOptions): Observable<T> {
    const httpParams = this.buildParams(options?.params);
    const httpHeaders = this.buildHeaders(options?.headers);
    return this.http.get<T>(`${this.baseUrl}${path}`, {
      params: httpParams,
      headers: httpHeaders
    });
  }

  post<T>(path: string, body: unknown, options?: ApiOptions): Observable<T> {
    const httpHeaders = this.buildHeaders(options?.headers);
    return this.http.post<T>(`${this.baseUrl}${path}`, body, {
      headers: httpHeaders
    });
  }

  put<T>(path: string, body: unknown, options?: ApiOptions): Observable<T> {
    const httpHeaders = this.buildHeaders(options?.headers);
    return this.http.put<T>(`${this.baseUrl}${path}`, body, {
      headers: httpHeaders
    });
  }

  patch<T>(path: string, body: unknown, options?: ApiOptions): Observable<T> {
    const httpHeaders = this.buildHeaders(options?.headers);
    return this.http.patch<T>(`${this.baseUrl}${path}`, body, {
      headers: httpHeaders
    });
  }

  delete<T>(path: string, options?: ApiOptions): Observable<T> {
    const httpParams = this.buildParams(options?.params);
    const httpHeaders = this.buildHeaders(options?.headers);
    return this.http.delete<T>(`${this.baseUrl}${path}`, {
      params: httpParams,
      headers: httpHeaders
    });
  }

  download(path: string, filename: string): void {
    this.http.get(`${this.baseUrl}${path}`, { responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  private buildParams(params?: Record<string, string | number | boolean>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, String(params[key]));
      });
    }
    return httpParams;
  }

  private buildHeaders(headers?: Record<string, string>): HttpHeaders {
    let httpHeaders = new HttpHeaders();
    if (headers) {
      Object.keys(headers).forEach(key => {
        httpHeaders = httpHeaders.set(key, headers[key]);
      });
    }
    return httpHeaders;
  }
}
