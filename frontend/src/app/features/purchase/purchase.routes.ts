import { Routes } from '@angular/router';

export const PURCHASE_ROUTES: Routes = [
  // 采购订单
  {
    path: '',
    loadComponent: () => import('./pages/order-list/order-list.component').then(m => m.OrderListComponent),
    title: '采购订单管理'
  },
  {
    path: 'orders/new',
    loadComponent: () => import('./pages/order-form/order-form.component').then(m => m.OrderFormComponent),
    title: '新建采购订单'
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./pages/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
    title: '采购订单详情'
  },
  {
    path: 'orders/:id/edit',
    loadComponent: () => import('./pages/order-form/order-form.component').then(m => m.OrderFormComponent),
    title: '编辑采购订单'
  },

  // 入库单
  {
    path: 'receipts',
    loadComponent: () => import('./pages/receipt-list/receipt-list.component').then(m => m.ReceiptListComponent),
    title: '入库单管理'
  },
  {
    path: 'receipts/new',
    loadComponent: () => import('./pages/receipt-form/receipt-form.component').then(m => m.ReceiptFormComponent),
    title: '新建入库单'
  },
  {
    path: 'receipts/:id',
    loadComponent: () => import('./pages/receipt-list/receipt-list.component').then(m => m.ReceiptListComponent),
    title: '入库单详情'
  },

  // 退货单
  {
    path: 'returns',
    loadComponent: () => import('./pages/return-list/return-list.component').then(m => m.ReturnListComponent),
    title: '退货单管理'
  },
  {
    path: 'returns/new',
    loadComponent: () => import('./pages/return-form/return-form.component').then(m => m.ReturnFormComponent),
    title: '新建退货单'
  },
  {
    path: 'returns/:id',
    loadComponent: () => import('./pages/return-list/return-list.component').then(m => m.ReturnListComponent),
    title: '退货单详情'
  },
  {
    path: 'returns/:id/edit',
    loadComponent: () => import('./pages/return-form/return-form.component').then(m => m.ReturnFormComponent),
    title: '编辑退货单'
  },

  // 供应商评估
  {
    path: 'evaluations',
    loadComponent: () => import('./pages/supplier-evaluation-list/supplier-evaluation-list.component').then(m => m.SupplierEvaluationListComponent),
    title: '供应商评估管理'
  },
  {
    path: 'evaluations/new',
    loadComponent: () => import('./pages/supplier-evaluation-form/supplier-evaluation-form.component').then(m => m.SupplierEvaluationFormComponent),
    title: '新建供应商评估'
  },
  {
    path: 'evaluations/:id',
    loadComponent: () => import('./pages/supplier-evaluation-form/supplier-evaluation-form.component').then(m => m.SupplierEvaluationFormComponent),
    title: '供应商评估详情'
  },
  {
    path: 'evaluations/:id/edit',
    loadComponent: () => import('./pages/supplier-evaluation-form/supplier-evaluation-form.component').then(m => m.SupplierEvaluationFormComponent),
    title: '编辑供应商评估'
  },

  // 询价单
  {
    path: 'inquiry-list',
    loadComponent: () => import('./pages/inquiry-list/inquiry-list.component').then(m => m.InquiryListComponent),
    title: '询价单管理'
  },
  {
    path: 'inquiry-list/create',
    loadComponent: () => import('./pages/order-form/order-form.component').then(m => m.OrderFormComponent),
    title: '新建询价单'
  },
  {
    path: 'inquiry-list/:id',
    loadComponent: () => import('./pages/order-form/order-form.component').then(m => m.OrderFormComponent),
    title: '询价单详情'
  },
  {
    path: 'inquiry-compare',
    loadComponent: () => import('./pages/inquiry-compare/inquiry-compare.component').then(m => m.InquiryCompareComponent),
    title: '询价单对比'
  },
];
