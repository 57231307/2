import { Routes } from '@angular/router';

export const COLOR_FORMULA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./color-formula-list/color-formula-list.component').then(m => m.ColorFormulaListComponent),
    title: '颜色配方'
  },
  {
    path: 'create',
    loadComponent: () => import('./color-formula-form/color-formula-form.component').then(m => m.ColorFormulaFormComponent),
    title: '新增配方'
  },
  {
    path: ':id',
    loadComponent: () => import('./color-formula-form/color-formula-form.component').then(m => m.ColorFormulaFormComponent),
    title: '编辑配方'
  },
  // 配色结果
  {
    path: 'matching-results',
    loadComponent: () => import('./pages/matching-result-list/matching-result-list.component').then(m => m.MatchingResultListComponent),
    title: '配色结果记录'
  },
  {
    path: 'matching-results/create',
    loadComponent: () => import('./pages/matching-result-form/matching-result-form.component').then(m => m.MatchingResultFormComponent),
    title: '新建配色结果'
  },
  {
    path: 'matching-results/:id',
    loadComponent: () => import('./pages/matching-result-form/matching-result-form.component').then(m => m.MatchingResultFormComponent),
    title: '配色结果详情'
  },
];
