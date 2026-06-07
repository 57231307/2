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
  },
  {
    path: 'contacts',
    loadComponent: () => import('./pages/contact-list/contact-list.component').then(m => m.ContactListComponent),
    title: '客户联系人管理'
  },
  {
    path: 'contacts/create',
    loadComponent: () => import('./pages/contact-form/contact-form.component').then(m => m.ContactFormComponent),
    title: '新增联系人'
  },
  {
    path: 'contacts/:id',
    loadComponent: () => import('./pages/contact-form/contact-form.component').then(m => m.ContactFormComponent),
    title: '编辑联系人'
  }
];
