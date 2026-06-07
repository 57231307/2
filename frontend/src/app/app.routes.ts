import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: '工作台'
      },
      {
        path: 'product',
        loadChildren: () => import('./features/product/product.routes').then(m => m.PRODUCT_ROUTES)
      },
      {
        path: 'inventory',
        loadChildren: () => import('./features/inventory/inventory.routes').then(m => m.INVENTORY_ROUTES)
      },
      {
        path: 'sales',
        loadChildren: () => import('./features/sales/sales.routes').then(m => m.SALES_ROUTES)
      },
      {
        path: 'purchase',
        loadChildren: () => import('./features/purchase/purchase.routes').then(m => m.PURCHASE_ROUTES)
      },
      {
        path: 'production',
        loadChildren: () => import('./features/production/production.routes').then(m => m.PRODUCTION_ROUTES)
      },
      {
        path: 'quality',
        loadChildren: () => import('./features/quality/quality.routes').then(m => m.QUALITY_ROUTES)
      },
      {
        path: 'finance',
        loadChildren: () => import('./features/finance/finance.routes').then(m => m.FINANCE_ROUTES)
      },
      {
        path: 'customer',
        loadChildren: () => import('./features/customer/customer.routes').then(m => m.CUSTOMER_ROUTES)
      },
      {
        path: 'supplier',
        loadChildren: () => import('./features/supplier/supplier.routes').then(m => m.SUPPLIER_ROUTES)
      },
      {
        path: 'pattern',
        loadChildren: () => import('./features/pattern/pattern.routes').then(m => m.PATTERN_ROUTES)
      },
      {
        path: 'color-formula',
        loadChildren: () => import('./features/color-formula/color-formula.routes').then(m => m.COLOR_FORMULA_ROUTES)
      },
      {
        path: 'system',
        loadChildren: () => import('./features/system/system.routes').then(m => m.SYSTEM_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
