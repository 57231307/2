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
  }
];
