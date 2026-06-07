import { Routes } from '@angular/router';

export const SYSTEM_ROUTES: Routes = [
  {
    path: 'departments',
    loadComponent: () => import('./pages/department-list/department-list.component').then(m => m.DepartmentListComponent),
    title: '部门管理'
  },
  {
    path: 'parameters',
    loadComponent: () => import('./pages/parameter-config/parameter-config.component').then(m => m.ParameterConfigComponent),
    title: '系统参数配置'
  },
  {
    path: 'code-rules',
    loadComponent: () => import('./pages/code-rule-list/code-rule-list.component').then(m => m.CodeRuleListComponent),
    title: '编码规则配置'
  }
];
