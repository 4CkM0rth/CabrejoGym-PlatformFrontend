import { Routes } from '@angular/router';

const BRANCHES_FEATURE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/branches-list/branches-list.component').then(m => m.BranchesListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/branch-detail/branch-detail.component').then(m => m.BranchDetailComponent)
  }
];

export const BRANCHES_ROUTES = BRANCHES_FEATURE_ROUTES;
