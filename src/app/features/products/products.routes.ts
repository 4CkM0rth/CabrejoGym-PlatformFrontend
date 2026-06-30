import { Routes } from '@angular/router';

const PRODUCTS_FEATURE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/products-list/products-list.component').then(m => m.ProductsListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  }
];

export const PRODUCTS_ROUTES = PRODUCTS_FEATURE_ROUTES;
