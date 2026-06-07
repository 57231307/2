import { Routes } from '@angular/router';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./customer-list/customer-list.component').then(m => m.CustomerListComponent),
    title: '客户管理'
  },
  {
    path: 'create',
    loadComponent: () => import('./customer-form/customer-form.component').then(m => m.CustomerFormComponent),
    title: '新增客户'
  },
  {
    path: ':id',
    loadComponent: () => import('./customer-form/customer-form.component').then(m => m.CustomerFormComponent),
    title: '编辑客户'
  }
];
