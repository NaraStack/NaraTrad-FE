import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth guard to protect routes that require authentication
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Not logged in, redirect to login page with return url
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

/**
 * Guest guard to prevent authenticated users from accessing login/register pages
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  // Already logged in, redirect to appropriate dashboard
  const user = authService.getCurrentUserValue();
  if (user?.role === 'ADMIN') {
    router.navigate(['/admin/dashboard']);
  } else {
    router.navigate(['/dashboard']);
  }
  return false;
};