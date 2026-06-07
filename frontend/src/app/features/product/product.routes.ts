import { Routes } from '@angular/router';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./product-list/product-list.component').then(m => m.ProductListComponent),
    title: '产品列表'
  },
  {
    path: 'create',
    loadComponent: () => import('./product-form/product-form.component').then(m => m.ProductFormComponent),
    title: '新增产品'
  },
  {
    path: ':id',
    loadComponent: () => import('./product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    title: '产品详情'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./product-form/product-form.component').then(m => m.ProductFormComponent),
    title: '编辑产品'
  }
];
