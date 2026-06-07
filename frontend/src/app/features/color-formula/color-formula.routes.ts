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
  }
];
