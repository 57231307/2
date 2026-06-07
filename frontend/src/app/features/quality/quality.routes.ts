import { Routes } from '@angular/router';

export const QUALITY_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'inspections',
    pathMatch: 'full'
  },
  {
    path: 'standards',
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        loadComponent: () => import('./quality-standard-list/quality-standard-list.component').then(m => m.QualityStandardListComponent),
        title: '质检标准管理'
      },
      {
        path: 'new',
        loadComponent: () => import('./quality-standard-form/quality-standard-form.component').then(m => m.QualityStandardFormComponent),
        title: '新建质检标准'
      },
      {
        path: ':id',
        loadComponent: () => import('./quality-standard-form/quality-standard-form.component').then(m => m.QualityStandardFormComponent),
        title: '编辑质检标准'
      }
    ]
  },
  {
    path: 'inspections',
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        loadComponent: () => import('./quality-inspection-list/quality-inspection-list.component').then(m => m.QualityInspectionListComponent),
        title: '质检报告管理'
      },
      {
        path: 'new',
        loadComponent: () => import('./quality-inspection-form/quality-inspection-form.component').then(m => m.QualityInspectionFormComponent),
        title: '新建质检报告'
      },
      {
        path: ':id',
        loadComponent: () => import('./quality-inspection-detail/quality-inspection-detail.component').then(m => m.QualityInspectionDetailComponent),
        title: '质检报告详情'
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./quality-inspection-form/quality-inspection-form.component').then(m => m.QualityInspectionFormComponent),
        title: '编辑质检报告'
      }
    ]
  }
];
