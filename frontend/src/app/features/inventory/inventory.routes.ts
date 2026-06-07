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
  }
];
