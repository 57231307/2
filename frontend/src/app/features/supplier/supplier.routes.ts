import { Routes } from '@angular/router';

export const SUPPLIER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./supplier-list/supplier-list.component').then(m => m.SupplierListComponent),
    title: '供应商管理'
  },
  {
    path: 'create',
    loadComponent: () => import('./supplier-form/supplier-form.component').then(m => m.SupplierFormComponent),
    title: '新增供应商'
  },
  {
    path: ':id',
    loadComponent: () => import('./supplier-form/supplier-form.component').then(m => m.SupplierFormComponent),
    title: '编辑供应商'
  }
];
