import { Routes } from '@angular/router';

export const PATTERN_ROUTES: Routes = [
  // 花型管理
  {
    path: '',
    loadComponent: () => import('./pattern-list/pattern-list.component').then(m => m.PatternListComponent),
    title: '花型管理'
  },
  {
    path: 'create',
    loadComponent: () => import('./pattern-form/pattern-form.component').then(m => m.PatternFormComponent),
    title: '新增花型'
  },
  {
    path: ':id',
    loadComponent: () => import('./pattern-form/pattern-form.component').then(m => m.PatternFormComponent),
    title: '编辑花型'
  },

  // 花型设计记录
  {
    path: 'designs',
    loadComponent: () => import('./pages/design-list/design-list.component').then(m => m.DesignListComponent),
    title: '花型设计记录'
  },
  {
    path: 'designs/new',
    loadComponent: () => import('./pages/design-form/design-form.component').then(m => m.DesignFormComponent),
    title: '新花型设计'
  },
  {
    path: 'designs/:id',
    loadComponent: () => import('./pages/design-detail/design-detail.component').then(m => m.DesignDetailComponent),
    title: '花型设计详情'
  },
  {
    path: 'designs/:id/edit',
    loadComponent: () => import('./pages/design-form/design-form.component').then(m => m.DesignFormComponent),
    title: '编辑花型设计'
  },
];
