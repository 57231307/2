import { Routes } from '@angular/router';

export const PRODUCTION_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'orders',
    pathMatch: 'full',
  },
  // 生产工单
  {
    path: 'orders',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/order-list/order-list.component').then(m => m.ProductionOrderListComponent),
        title: '生产工单',
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/order-form/order-form.component').then(m => m.ProductionOrderFormComponent),
        title: '新建工单',
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/order-detail/order-detail.component').then(m => m.ProductionOrderDetailComponent),
        title: '工单详情',
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/order-form/order-form.component').then(m => m.ProductionOrderFormComponent),
        title: '编辑工单',
      },
    ],
  },
  // 领料单
  {
    path: 'requisitions',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/requisition-list/requisition-list.component').then(m => m.RequisitionListComponent),
        title: '领料单',
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/requisition-form/requisition-form.component').then(m => m.RequisitionFormComponent),
        title: '新建领料单',
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/requisition-detail/requisition-detail.component').then(m => m.RequisitionDetailComponent),
        title: '领料单详情',
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/requisition-form/requisition-form.component').then(m => m.RequisitionFormComponent),
        title: '编辑领料单',
      },
    ],
  },
  // 入库单
  {
    path: 'receipts',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/receipt-list/receipt-list.component').then(m => m.ReceiptListComponent),
        title: '入库单',
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/receipt-form/receipt-form.component').then(m => m.ReceiptFormComponent),
        title: '新建入库单',
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/receipt-detail/receipt-detail.component').then(m => m.ReceiptDetailComponent),
        title: '入库单详情',
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/receipt-form/receipt-form.component').then(m => m.ReceiptFormComponent),
        title: '编辑入库单',
      },
    ],
  },
];
