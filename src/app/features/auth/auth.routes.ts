import { Routes } from '@angular/router';

const AUTH_FEATURE_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

export const AUTH_ROUTES = AUTH_FEATURE_ROUTES;
