import { Component, OnInit, OnDestroy, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  finalize,
  catchError,
} from 'rxjs/operators';
import { StockService } from '../../features/portfolio/services/stocks';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ToastComponent } from 'app/shared/components/toast/toast.component';
import { ToastService } from 'app/core/services/toast.service';

interface Stock {
  symbol: string;
  name: string;
}

@Component({
  selector: 'app-add-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToastComponent,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './add-stock.html',
  styleUrls: ['./add-stock.scss'],
})
export class AddStock implements OnInit, OnDestroy {
  searchQuery: string = '';
  stocks: Stock[] = [];
  selectedStock: string | null = null;
  stockPrice: string | null = null;
  priceLoading: boolean = false;
  totalPrice: string | null = null;
  quantity: string = '';
  loading: boolean = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private stockService: StockService,
    private toast: ToastService,
    @Optional() private dialogRef: MatDialogRef<AddStock> | null,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { symbol?: string } | null
  ) {
    // If data is null, initialize it
    if (!this.data) {
      this.data = {};
    }
  }

  ngOnInit(): void {
    // Prefill symbol jika dikirim dari parent
    if (this.data?.symbol) {
      this.selectedStock = this.data.symbol;
      this.searchQuery = this.data.symbol;
      this.fetchStockPrice(this.data.symbol);
    }

    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap((query) => {
          if (!query.trim()) return of([]);
          this.loading = true;
          return this.stockService.searchStocks(query).pipe(
            catchError(() => of([])),
            finalize(() => (this.loading = false))
          );
        })
      )
      .subscribe((stocks) => (this.stocks = stocks));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string): void {
    this.searchQuery = value;
    if (value && value.length >= 1) this.searchSubject.next(value);
    else this.stocks = [];
  }

  onStockSelected(symbol: string): void {
    this.selectedStock = symbol;
    this.fetchStockPrice(symbol);
  }

  private fetchStockPrice(symbol: string): void {
    this.priceLoading = true;
    this.stockService
      .stockPrice(symbol)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (price) => (this.stockPrice = price.toString()),
        error: () => (this.stockPrice = null),
        complete: () => (this.priceLoading = false),
      });
  }

  calculateTotalPrice(): void {
    const qty = Number(this.quantity);
    const price = Number(this.stockPrice);
    if (qty && price) this.totalPrice = (qty * price).toString();
  }

  onSubmit(): void {
    if (!this.selectedStock || !this.quantity) return;

    this.loading = true;
    this.stockService
      .createStock(this.selectedStock, Number(this.quantity))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: () => {
          this.toast.showSuccess(
            'Stock added!',
            'Stock successfully added to your portfolio.',
            2000
          );
          if (this.dialogRef) {
            this.dialogRef.close({ symbol: this.selectedStock, quantity: this.quantity });
          }
        },
        error: (err) => {
          console.error(err);
          this.toast.showError('Failed to add stock', 'Please try again later.', 4000);
        },
      });
  }

  onCancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  getStockValue(stock: Stock): string {
    return stock.symbol;
  }

  getStockDisplay(stock: Stock): string {
    return `${stock.symbol} - ${stock.name || ''}`;
  }
}