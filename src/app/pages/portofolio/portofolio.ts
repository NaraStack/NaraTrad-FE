import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';

import { Stock } from '../../shared/models/stock';
import { PortfolioService } from '../../features/portfolio/services/portfolio';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastComponent } from 'app/shared/components/toast/toast.component';
import { ToastService } from 'app/core/services/toast.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

import { AddStock } from '../add-stock/add-stock';
import { UpdateStockComponent } from 'app/shared/components/update-stock/update-stock.component';
@Component({
  selector: 'app-portofolio',
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
    RouterModule,
    ToastComponent,
    MatSnackBarModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './portofolio.html',
  styleUrls: ['./portofolio.scss'],
})
export class Portofolio implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = ['symbol', 'price', 'change', 'quantity', 'action'];
  dataSource = new MatTableDataSource<Stock>();
  stocks: Stock[] = [];
  isLoading = true;
  private destroy$ = new Subject<void>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private portfolioService: PortfolioService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data: Stock, filter: string) =>
      data.symbol.toLowerCase().includes(filter);

    this.loadStocks();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  private loadStocks(): void {
    this.isLoading = true;
    this.portfolioService.getStocks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
          this.isLoading = false;
        },
        error: () => {
          alert('Failed to load stocks');
          this.isLoading = false;
        },
      });
  }

  confirmDelete(stock: Stock): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '360px',
      disableClose: true,
      data: {
        title: 'Delete Stock',
        message: `Are you sure you want to delete ${stock.symbol}? This action cannot be undone.`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.deleteStock(stock);
    });
  }

  private deleteStock(stock: Stock): void {
    this.portfolioService.deleteStock(stock.id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter((s) => s.id !== stock.id);
        this.toast.showSuccess(
          'Stock deleted!',
          'Stock successfully removed from your portfolio.',
          1000
        );
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.toast.showError('Failed to delete stock', 'Please try again later.', 4000);
      },
    });
  }

  // OPEN DIALOG ADD STOCK
  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddStock, {
      width: '500px',
      disableClose: true,
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const qty = Number(result.quantity);
        const price = Number(result.price || 0);

        const newStock: Stock = {
          id: Date.now(),
          symbol: result.symbol,
          quantity: qty,
          price: price,
          change: 0,
          totalValue: price * qty,
          previousClose: 0,
          priceChange: 0,
          purchasePrice: price,
          createdAt: new Date().toISOString(),
          totalInvestment: price * qty,
          gainLoss: 0,
          gainLossPercent: 0,
        };

        // Tambahkan stock baru ke tabel portfolio
        this.dataSource.data = [newStock, ...this.dataSource.data];

        this.toast.showSuccess(
          'Stock added!',
          `Stock ${result.symbol} berhasil ditambahkan ke portfolio`,
          2000
        );
      }
    });
  }
  // OPEN DIALOG UPDATE STOCK

  openUpdateDialog(stock: Stock): void {
    const dialogRef = this.dialog.open(UpdateStockComponent, {
      width: '500px',
      data: { stock },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const index = this.dataSource.data.findIndex((s) => s.symbol === result.symbol);

      if (index !== -1) {
        this.dataSource.data[index] = {
          ...this.dataSource.data[index],
          quantity: result.quantity,
        };

        this.dataSource.data = [...this.dataSource.data];
      }
    });
  }

  exportToCSV(): void {
    const data = this.dataSource.data;

    if (!data || data.length === 0) {
      this.toast.showError('No data', 'Portfolio is empty, cannot export.', 2000);
      return;
    }

    // Buat header CSV
    const headers = ['Symbol', 'Price', 'Change', 'Quantity', 'Total Value'];
    const csvRows = [headers.join(',')];

    // Loop tiap stock
    data.forEach((stock) => {
      const row = [stock.symbol, stock.price, stock.change, stock.quantity, stock.totalValue];
      csvRows.push(row.join(','));
    });

    // Gabungkan semua baris jadi string CSV
    const csvString = csvRows.join('\r\n');

    // Buat blob dan trigger download
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}