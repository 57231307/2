import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./inventory-list/inventory-list.component').then(m => m.InventoryListComponent),
    title: '库存列表'
  },
  {
    path: 'adjust',
    loadComponent: () => import('./inventory-adjust/inventory-adjust.component').then(m => m.InventoryAdjustComponent),
    title: '库存调整'
  },
  {
    path: 'alerts',
    loadComponent: () => import('./pages/alert-list/alert-list.component').then(m => m.AlertListComponent),
    title: '库存预警'
  },
  {
    path: 'transfers',
    loadComponent: () => import('./pages/transfer-list/transfer-list.component').then(m => m.TransferListComponent),
    title: '调拨单列表'
  },
  {
    path: 'transfers/new',
    loadComponent: () => import('./pages/transfer-form/transfer-form.component').then(m => m.TransferFormComponent),
    title: '新建调拨单'
  },
  {
    path: 'transfers/:id',
    loadComponent: () => import('./pages/transfer-detail/transfer-detail.component').then(m => m.TransferDetailComponent),
    title: '调拨单详情'
  },
  {
    path: 'checks',
    loadComponent: () => import('./pages/check-list/check-list.component').then(m => m.CheckListComponent),
    title: '盘点单列表'
  },
  {
    path: 'checks/new',
    loadComponent: () => import('./pages/check-form/check-form.component').then(m => m.CheckFormComponent),
    title: '新建盘点单'
  },
  {
    path: 'checks/:id',
    loadComponent: () => import('./pages/check-detail/check-detail.component').then(m => m.CheckDetailComponent),
    title: '盘点单详情'
  },
  {
    path: 'checks/:id/edit',
    loadComponent: () => import('./pages/check-form/check-form.component').then(m => m.CheckFormComponent),
    title: '编辑盘点单'
  },
  {
    path: 'checks/:id/execute',
    loadComponent: () => import('./pages/check-execute/check-execute.component').then(m => m.CheckExecuteComponent),
    title: '执行盘点'
  },
  {
    path: 'checks/:id/report',
    loadComponent: () => import('./pages/check-report/check-report.component').then(m => m.CheckReportComponent),
    title: '盘点报告'
  }
];
