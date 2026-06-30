import { Routes } from '@angular/router';

const ACCOUNT_FEATURE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/account-page/account-page.component').then(m => m.AccountPageComponent)
  },
  {
    path: 'addresses',
    loadComponent: () => import('./pages/addresses/addresses.component').then(m => m.AddressesComponent)
  }
];

export const ACCOUNT_ROUTES = ACCOUNT_FEATURE_ROUTES;
