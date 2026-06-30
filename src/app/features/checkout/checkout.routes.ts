import { Routes } from '@angular/router';

const CHECKOUT_FEATURE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/checkout-page/checkout-page.component').then(m => m.CheckoutPageComponent)
  }
];

export const CHECKOUT_ROUTES = CHECKOUT_FEATURE_ROUTES;
