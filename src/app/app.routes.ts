import { Routes } from '@angular/router';
import { AdminDashboard } from './pages/admin/dashboard/admin-dashboard';
import { Portofolio } from './pages/portofolio/portofolio';
import { Dashboard } from './pages/dashboard/dashboard';
import { AddStock } from './pages/add-stock/add-stock';
import { Watchlist } from './pages/watchlist/watchlist';
import { Settings } from './pages/settings/settings';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './core/models/auth.model';

export const routes: Routes = [
  // AUTH (NO LAYOUT)
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [guestGuard],
  },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // USER AREA
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [roleGuard([Role.USER])],
      },
      { path: 'portfolio', component: Portofolio },
      { path: 'watchlist', component: Watchlist },
      { path: 'settings', component: Settings },
      { path: 'add-stock', component: AddStock },
    ],
  },

  // ADMIN AREA
  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [authGuard, roleGuard([Role.ADMIN])],
    children: [
      {
        path: 'dashboard',
        component: AdminDashboard,
      },
      {
        path: 'settings',
        component: Settings,
      },
    ],
  },

  // DEFAULT
  { path: '**', redirectTo: 'login' },
];