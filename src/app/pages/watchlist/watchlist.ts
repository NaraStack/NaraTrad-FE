import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { Watchlist as WatchlistModel } from '../../shared/models/stock';
import { WatchlistService } from '../../features/watchlist/services/watchlist.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { AddWatchlistDialogComponent } from '../../shared/components/add-watchlist-dialog/add-watchlist-dialog';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { VolumeFormatPipe } from '../../shared/pipes/volume-format.pipe';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    VolumeFormatPipe,
  ],
  templateUrl: './watchlist.html',
  styleUrl: './watchlist.scss',
})
export class Watchlist implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['symbol', 'price', 'change', 'volume', 'action'];
  dataSource = new MatTableDataSource<WatchlistModel>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private watchlistService: WatchlistService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data: WatchlistModel, filter: string) =>
      data.symbol.toLowerCase().includes(filter);
    this.loadWatchlist();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadWatchlist(): void {
    this.watchlistService.getAllWatchlist().subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: () => this.showToast('error', 'Error', 'Failed to load watchlist'),
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddWatchlistDialogComponent, {
      width: '500px',
      disableClose: true,
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
        this.dataSource.data = [...this.dataSource.data, newItem];
        this.showToast('success', 'Success', `${data.symbol} added to watchlist`);
      },
      error: (err) => {
        const message = err.error?.message || 'Failed to add to watchlist';
        this.showToast('error', 'Error', message);
      },
    });
  }

  addToPortfolio(watchlist: WatchlistModel): void {
    // Navigate to add-stock page with symbol prefilled
    this.router.navigate(['/add-stock'], {
      queryParams: { symbol: watchlist.symbol },
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
        this.showToast('success', 'Success', `${watchlist.symbol} removed from watchlist`);
      },
      error: () => this.showToast('error', 'Error', 'Failed to remove from watchlist'),
    });
  }

  private showToast(type: 'success' | 'error', title: string, message: string): void {
    this.snackBar.openFromComponent(ToastComponent, {
      data: { type, title, message },
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}