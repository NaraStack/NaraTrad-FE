import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/auth.model';

/**
 * Role guard factory to protect routes based on user role
 */
export const roleGuard = (allowedRoles: Role[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.getCurrentUserValue();

    if (user && allowedRoles.includes(user.role)) {
      return true;
    }

    // User doesn't have required role, redirect to appropriate dashboard
    if (user?.role === Role.ADMIN) {
      router.navigate(['/admin/dashboard']);
    } else if (user?.role === Role.USER) {
      router.navigate(['/dashboard']);
    } else {
      router.navigate(['/login']);
    }

    return false;
  };
};