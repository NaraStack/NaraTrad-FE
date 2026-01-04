import { Routes } from '@angular/router';
import { Portofolio } from './pages/portofolio/portofolio';
import { Dashboard } from './pages/dashboard/dashboard';
import { AddStock } from './pages/add-stock/add-stock';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthGuard } from './auth/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

export const routes: Routes = [
  // LOGIN (TANPA SIDEBAR)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  //  MAIN APP (PAKAI SIDEBAR)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'portfolio', component: Portofolio },
      { path: 'watchlist', component: Dashboard },
      { path: 'settings', component: Dashboard },
      { path: 'add-stock', component: AddStock },
    ],
  },

  // 🚑 DEFAULT
  { path: '**', redirectTo: 'login' },
];
