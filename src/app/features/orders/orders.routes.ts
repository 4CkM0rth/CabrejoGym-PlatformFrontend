import { Routes } from '@angular/router';

const ORDERS_FEATURE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/orders-list/orders-list.component').then(m => m.OrdersListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
  }
];

export const ORDERS_ROUTES = ORDERS_FEATURE_ROUTES;
