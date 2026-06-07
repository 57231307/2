import { Routes } from '@angular/router';

export const SALES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./sales-list/sales-list.component').then(m => m.SalesListComponent),
    title: '销售订单'
  },
  {
    path: 'create',
    loadComponent: () => import('./sales-form/sales-form.component').then(m => m.SalesFormComponent),
    title: '新建订单'
  },
  {
    path: 'quotations',
    loadComponent: () => import('./pages/quotation-list/quotation-list.component').then(m => m.QuotationListComponent),
    title: '报价单列表'
  },
  {
    path: 'quotations/new',
    loadComponent: () => import('./pages/quotation-form/quotation-form.component').then(m => m.QuotationFormComponent),
    title: '新建报价单'
  },
  {
    path: 'quotations/:id',
    loadComponent: () => import('./pages/quotation-detail/quotation-detail.component').then(m => m.QuotationDetailComponent),
    title: '报价单详情'
  },
  {
    path: 'quotations/:id/edit',
    loadComponent: () => import('./pages/quotation-form/quotation-form.component').then(m => m.QuotationFormComponent),
    title: '编辑报价单'
  }
];
