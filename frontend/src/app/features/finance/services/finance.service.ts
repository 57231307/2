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

  // 应收款账龄分析
  getArAgingReport(customerId?: string): Observable<any> {
    if (customerId) {
      return this.api.get<any>(`${this.basePath}/account-receivables/aging-report`, { params: { customerId } });
    }
    return this.api.get<any>(`${this.basePath}/account-receivables/aging-report`);
  }

  getArOverdueAlerts(): Observable<any> {
    return this.api.get<any>(`${this.basePath}/account-receivables/overdue-alerts`);
  }

  // 应付款账龄分析
  getApAgingReport(supplierId?: string): Observable<any> {
    if (supplierId) {
      return this.api.get<any>(`${this.basePath}/account-payables/aging-report`, { params: { supplierId } });
    }
    return this.api.get<any>(`${this.basePath}/account-payables/aging-report`);
  }

  getApOverdueAlerts(): Observable<any> {
    return this.api.get<any>(`${this.basePath}/account-payables/overdue-alerts`);
  }

  // 成本核算
  calculateActualCost(orderId: string): Observable<any> {
    return this.api.post<any>(`${this.basePath}/cost-accounting/calculate`, { orderId });
  }

  getCostVariance(orderId: string): Observable<any> {
    return this.api.get<any>(`${this.basePath}/cost-accounting/variance/${orderId}`);
  }

  getCostReport(productionOrderId: string): Observable<any> {
    return this.api.get<any>(`${this.basePath}/cost-accounting/report/${productionOrderId}`);
  }

  // 成本差异分析
  getCostVarianceList(params: any): Observable<any> {
    return this.api.get<any>(`${this.basePath}/cost-variances`, { params });
  }

  getCostVarianceById(id: string): Observable<any> {
    return this.api.get<any>(`${this.basePath}/cost-variances/${id}`);
  }

  createCostVariance(data: any): Observable<any> {
    return this.api.post<any>(`${this.basePath}/cost-variances`, data);
  }

  updateCostVariance(id: string, data: any): Observable<any> {
    return this.api.put<any>(`${this.basePath}/cost-variances/${id}`, data);
  }

  deleteCostVariance(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/cost-variances/${id}`);
  }

  // 财务报表
  getProfitLossReport(startDate: string, endDate: string): Observable<any> {
    return this.api.get<any>(`${this.basePath}/financial-reports/profit-loss`, { params: { startDate, endDate } });
  }

  getBalanceSheetReport(asOfDate: string): Observable<any> {
    return this.api.get<any>(`${this.basePath}/financial-reports/balance-sheet`, { params: { asOfDate } });
  }

  getCashFlowReport(startDate: string, endDate: string): Observable<any> {
    return this.api.get<any>(`${this.basePath}/financial-reports/cash-flow`, { params: { startDate, endDate } });
  }
}