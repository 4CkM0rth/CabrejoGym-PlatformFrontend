import { Routes } from '@angular/router';

const CART_FEATURE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/cart-page/cart-page.component').then(m => m.CartPageComponent)
  }
];

export const CART_ROUTES = CART_FEATURE_ROUTES;
