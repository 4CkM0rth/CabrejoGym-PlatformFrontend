import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (roles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.getCurrentUser();
    
    if (!user) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (user.role && roles.includes(user.role)) {
      return true;
    }

    router.navigate(['/home']);
    return false;
  };
};
