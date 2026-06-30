import { Routes } from '@angular/router';

const HOME_FEATURE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home-page/home-page.component').then(m => m.HomePageComponent)
  }
];

export const HOME_ROUTES = HOME_FEATURE_ROUTES;
