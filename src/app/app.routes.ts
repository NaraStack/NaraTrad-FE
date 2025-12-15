import { Routes } from '@angular/router';
import { Portofolio } from './pages/portofolio/portofolio';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
  { path: 'dashboard', component: Dashboard },
  { path: 'portfolio', component: Portofolio },

  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
