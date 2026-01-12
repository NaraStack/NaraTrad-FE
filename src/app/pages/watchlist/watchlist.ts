import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

import { Watchlist as WatchlistModel } from '../../shared/models/stock';
import { WatchlistService } from '../../features/watchlist/services/watchlist.service';
import { PortfolioService } from '../../features/portfolio/services/portfolio';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { AddWatchlistDialogComponent } from '../../shared/components/add-watchlist-dialog/add-watchlist-dialog';
import { AddToPortfolioDialogComponent } from '../../shared/components/add-to-portfolio-dialog/add-to-portfolio-dialog';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ToastService } from 'app/core/services/toast.service';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './watchlist.html',
  styleUrl: './watchlist.scss',
})
export class Watchlist implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['symbol', 'price', 'change', 'action'];
  dataSource = new MatTableDataSource<WatchlistModel>();
  portfolioSymbols: Set<string> = new Set();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private watchlistService: WatchlistService,
    private portfolioService: PortfolioService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data: WatchlistModel, filter: string) =>
      data.symbol.toLowerCase().includes(filter);
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData(): void {
    forkJoin({
      watchlist: this.watchlistService.getAllWatchlist(),
      portfolio: this.portfolioService.getStocks(),
    }).subscribe({
      next: ({ watchlist, portfolio }) => {
        // Store portfolio symbols for validation
        this.portfolioSymbols = new Set(portfolio.map((s) => s.symbol));
        this.dataSource.data = watchlist;
      },
      error: () => {
        // TOAST ERROR
        this.toast.showError('Error', 'Failed to load data', 4000);
      },
    });
  }

  loadWatchlist(): void {
    this.watchlistService.getAllWatchlist().subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: () => {
        // TOAST ERROR
        this.toast.showError('Error', 'Failed to load watchlist', 4000);
      },
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  openAddDialog(prefilledSymbol?: string): void {
    // Get current watchlist symbols
    const watchlistSymbols = new Set(this.dataSource.data.map((w) => w.symbol));

    const dialogRef = this.dialog.open(AddWatchlistDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        portfolioSymbols: this.portfolioSymbols,
        watchlistSymbols: watchlistSymbols,
        prefilledSymbol: prefilledSymbol,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addToWatchlist(result);
      }
    });
  }

  addToWatchlist(data: { symbol: string; targetPrice?: number }): void {
    this.watchlistService.addToWatchlist(data).subscribe({
      next: (newItem) => {
        // Tambahkan item baru ke datasource
        this.dataSource.data = [...this.dataSource.data, newItem];

        // TOAST SUCCESS
        this.toast.showSuccess('Success', `${data.symbol} added to watchlist`, 3000);
      },
      error: (err) => {
        const message = err.error?.message || 'Failed to add to watchlist';

        // TOAST ERROR
        this.toast.showError('Error', message, 4000);
      },
    });
  }

  addToPortfolio(watchlist: WatchlistModel): void {
    // Open dialog to add stock to portfolio with pre-filled symbol
    const dialogRef = this.dialog.open(AddToPortfolioDialogComponent, {
      width: '500px',
      disableClose: true,
      data: { symbol: watchlist.symbol },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Stock was successfully added to portfolio, remove from watchlist
        this.removeFromWatchlistAfterAddingToPortfolio(watchlist);
      }
    });
  }

  private removeFromWatchlistAfterAddingToPortfolio(watchlist: WatchlistModel): void {
    this.watchlistService.removeFromWatchlist(watchlist.id).subscribe({
      next: () => {
        // Remove from dataSource
        this.dataSource.data = this.dataSource.data.filter((w) => w.id !== watchlist.id);

        // Show success toast
        this.toast.showSuccess(
          'Success',
          `${watchlist.symbol} removed from watchlist (now in portfolio)`,
          3000
        );
      },
      error: () => {
        // If removal fails, just reload data to keep things in sync
        this.loadWatchlist();
        this.toast.showError(
          'Warning',
          'Stock added to portfolio but could not remove from watchlist',
          4000
        );
      },
    });
  }

  confirmDelete(watchlist: WatchlistModel): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '360px',
      disableClose: true,
      data: {
        title: 'Remove from Watchlist',
        message: `Are you sure you want to remove ${watchlist.symbol} from your watchlist?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteFromWatchlist(watchlist);
      }
    });
  }

  private deleteFromWatchlist(watchlist: WatchlistModel): void {
    this.watchlistService.removeFromWatchlist(watchlist.id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter((w) => w.id !== watchlist.id);

        // TOAST SUCCESS
        this.toast.showSuccess('Success', `${watchlist.symbol} removed from watchlist`, 3000);
      },
      error: () => {
        // TOAST ERROR
        this.toast.showError('Error', 'Failed to remove from watchlist', 4000);
      },
    });
  }

  // private showToast(type: 'success' | 'error', title: string, message: string): void {
  //   this.snackBar.openFromComponent(ToastComponent, {
  //     data: { type, title, message },
  //     duration: 3000,
  //     horizontalPosition: 'end',
  //     verticalPosition: 'top',
  //     panelClass: ['custom-snackbar'],
  //   });
  // }
}