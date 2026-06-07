import { Routes } from '@angular/router';

export const PATTERN_ROUTES: Routes = [
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
  }
];
