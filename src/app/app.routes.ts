import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES)
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes').then(m => m.PRODUCTS_ROUTES)
  },
  {
    path: 'branches',
    loadChildren: () => import('./features/branches/branches.routes').then(m => m.BRANCHES_ROUTES)
  },
  {
    path: 'cart',
    loadChildren: () => import('./features/cart/cart.routes').then(m => m.CART_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'checkout',
    loadChildren: () => import('./features/checkout/checkout.routes').then(m => m.CHECKOUT_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    loadChildren: () => import('./features/orders/orders.routes').then(m => m.ORDERS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'account',
    loadChildren: () => import('./features/account/account.routes').then(m => m.ACCOUNT_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard, roleGuard(["ADMIN"])]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
