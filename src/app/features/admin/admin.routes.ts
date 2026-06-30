import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/admin-dashboard/admin-dashboard.component').then(
            m => m.AdminDashboardComponent
          )
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/products-management/products-management.component').then(
            m => m.ProductsManagementComponent
          )
      },
      {
        path: 'branches',
        loadComponent: () =>
          import('./pages/branches-management/branches-management.component').then(
            m => m.BranchesManagementComponent
          )
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./pages/orders-management/orders-management.component').then(
            m => m.OrdersManagementComponent
          )
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users-management/users-management.component').then(
            m => m.UsersManagementComponent
          )
      },
      {
        path: 'brands',
        loadComponent: () =>
          import('./pages/brands-management/brands-management.component').then(
            m => m.BrandsManagementComponent
          )
      }
    ]
  }
];
