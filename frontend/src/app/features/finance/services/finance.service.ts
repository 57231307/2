import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import {
  AccountReceivable,
  AccountPayable,
  Payment,
  CreateAccountReceivableRequest,
  CreateAccountPayableRequest,
  CreatePaymentRequest,
  RegisterPaymentRequest,
  AccountReceivableQueryParams,
  AccountPayableQueryParams,
  PaymentQueryParams,
  PageResult
} from '../models/finance.model';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private api = inject(ApiService);
  private basePath = '/api/v1';

  // 应收款相关
  getAccountReceivables(params?: AccountReceivableQueryParams): Observable<PageResult<AccountReceivable>> {
    return this.api.get<PageResult<AccountReceivable>>(`${this.basePath}/account-receivables`, { params: params as Record<string, string | number | boolean> });
  }

  getAccountReceivable(id: string): Observable<AccountReceivable> {
    return this.api.get<AccountReceivable>(`${this.basePath}/account-receivables/${id}`);
  }

  createAccountReceivable(request: CreateAccountReceivableRequest): Observable<AccountReceivable> {
    return this.api.post<AccountReceivable>(`${this.basePath}/account-receivables`, request);
  }

  updateAccountReceivable(id: string, request: CreateAccountReceivableRequest): Observable<AccountReceivable> {
    return this.api.put<AccountReceivable>(`${this.basePath}/account-receivables/${id}`, request);
  }

  registerReceivablePayment(id: string, request: RegisterPaymentRequest): Observable<AccountReceivable> {
    return this.api.put<AccountReceivable>(`${this.basePath}/account-receivables/${id}/pay`, request);
  }

  verifyAccountReceivable(id: string): Observable<AccountReceivable> {
    return this.api.put<AccountReceivable>(`${this.basePath}/account-receivables/${id}/verify`, {});
  }

  deleteAccountReceivable(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/account-receivables/${id}`);
  }

  // 应付款相关
  getAccountPayables(params?: AccountPayableQueryParams): Observable<PageResult<AccountPayable>> {
    return this.api.get<PageResult<AccountPayable>>(`${this.basePath}/account-payables`, { params: params as Record<string, string | number | boolean> });
  }

  getAccountPayable(id: string): Observable<AccountPayable> {
    return this.api.get<AccountPayable>(`${this.basePath}/account-payables/${id}`);
  }

  createAccountPayable(request: CreateAccountPayableRequest): Observable<AccountPayable> {
    return this.api.post<AccountPayable>(`${this.basePath}/account-payables`, request);
  }

  updateAccountPayable(id: string, request: CreateAccountPayableRequest): Observable<AccountPayable> {
    return this.api.put<AccountPayable>(`${this.basePath}/account-payables/${id}`, request);
  }

  registerPayablePayment(id: string, request: RegisterPaymentRequest): Observable<AccountPayable> {
    return this.api.put<AccountPayable>(`${this.basePath}/account-payables/${id}/pay`, request);
  }

  verifyAccountPayable(id: string): Observable<AccountPayable> {
    return this.api.put<AccountPayable>(`${this.basePath}/account-payables/${id}/verify`, {});
  }

  deleteAccountPayable(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/account-payables/${id}`);
  }

  // 收付款记录相关
  getPayments(params?: PaymentQueryParams): Observable<PageResult<Payment>> {
    return this.api.get<PageResult<Payment>>(`${this.basePath}/payments`, { params: params as Record<string, string | number | boolean> });
  }

  getPayment(id: string): Observable<Payment> {
    return this.api.get<Payment>(`${this.basePath}/payments/${id}`);
  }

  createPayment(request: CreatePaymentRequest): Observable<Payment> {
    return this.api.post<Payment>(`${this.basePath}/payments`, request);
  }

  updatePayment(id: string, request: CreatePaymentRequest): Observable<Payment> {
    return this.api.put<Payment>(`${this.basePath}/payments/${id}`, request);
  }

  deletePayment(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/payments/${id}`);
  }
}