import { Routes } from '@angular/router';

export const FINANCE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'receivables',
    pathMatch: 'full'
  },
  {
    path: 'receivables',
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        loadComponent: () => import('./account-receivable-list/account-receivable-list.component').then(m => m.AccountReceivableListComponent),
        title: '应收款管理'
      },
      {
        path: 'new',
        loadComponent: () => import('./account-receivable-list/account-receivable-list.component').then(m => m.AccountReceivableListComponent),
        title: '新建应收款'
      },
      {
        path: ':id',
        loadComponent: () => import('./account-receivable-list/account-receivable-list.component').then(m => m.AccountReceivableListComponent),
        title: '应收款详情'
      }
    ]
  },
  {
    path: 'ar-aging',
    loadComponent: () => import('./pages/ar-aging/ar-aging.component').then(m => m.ArAgingComponent),
    title: '应收款账龄分析'
  },
  {
    path: 'ap-aging',
    loadComponent: () => import('./pages/ap-aging/ap-aging.component').then(m => m.ApAgingComponent),
    title: '应付款账龄分析'
  },
  {
    path: 'cost-accounting',
    loadComponent: () => import('./pages/cost-accounting/cost-accounting.component').then(m => m.CostAccountingComponent),
    title: '成本核算'
  },
  {
    path: 'payables',
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        loadComponent: () => import('./account-payable-list/account-payable-list.component').then(m => m.AccountPayableListComponent),
        title: '应付款管理'
      },
      {
        path: 'new',
        loadComponent: () => import('./account-payable-list/account-payable-list.component').then(m => m.AccountPayableListComponent),
        title: '新建应付款'
      },
      {
        path: ':id',
        loadComponent: () => import('./account-payable-list/account-payable-list.component').then(m => m.AccountPayableListComponent),
        title: '应付款详情'
      }
    ]
  },
  {
    path: 'payments',
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        loadComponent: () => import('./payment-list/payment-list.component').then(m => m.PaymentListComponent),
        title: '收付款记录'
      },
      {
        path: 'new',
        loadComponent: () => import('./payment-form/payment-form.component').then(m => m.PaymentFormComponent),
        title: '新建收付款'
      },
      {
        path: ':id',
        loadComponent: () => import('./payment-list/payment-list.component').then(m => m.PaymentListComponent),
        title: '收付款详情'
      }
    ]
  }
];
