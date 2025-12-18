import { Routes } from '@angular/router';
import { Portofolio } from './pages/portofolio/portofolio';
import { Dashboard } from './pages/dashboard/dashboard';
import { AddStockComponent } from './pages/add-stock/add-stock';

export const routes: Routes = [
  { path: 'dashboard', component: Dashboard },
  { path: 'portfolio', component: Portofolio },
  { path: 'watchlist', component: Dashboard },
  { path: 'settings', component: Dashboard },
  { path: 'add-stock', component: AddStockComponent },

  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
