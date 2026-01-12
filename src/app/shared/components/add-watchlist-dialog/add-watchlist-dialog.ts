import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, switchMap, of, catchError, finalize } from 'rxjs';
import { StockService } from '../../../features/portfolio/services/stocks';

interface Stock {
  symbol: string;
  name: string;
}

interface DialogData {
  portfolioSymbols?: Set<string>;
  watchlistSymbols?: Set<string>;
  prefilledSymbol?: string;
}

@Component({
  selector: 'app-add-watchlist-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './add-watchlist-dialog.html',
  styleUrls: ['./add-watchlist-dialog.scss'],
})
export class AddWatchlistDialogComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  stocks: Stock[] = [];
  selectedStock: string | null = null;
  targetPrice: number | null = null;
  loading: boolean = false;
  portfolioSymbols: Set<string>;
  watchlistSymbols: Set<string>;
  isQuickAdd: boolean = false; // For pre-filled symbol scenario

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<AddWatchlistDialogComponent>,
    private stockService: StockService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.portfolioSymbols = data?.portfolioSymbols || new Set();
    this.watchlistSymbols = data?.watchlistSymbols || new Set();

    // If prefilledSymbol is provided, this is a quick add scenario
    if (data?.prefilledSymbol) {
      this.isQuickAdd = true;
      this.selectedStock = data.prefilledSymbol;
      this.searchQuery = data.prefilledSymbol;
    }
  }

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap((query) => {
          if (!query.trim()) {
            return of([]);
          }
          this.loading = true;
          return this.stockService.searchStocks(query).pipe(
            catchError(() => of([])),
            finalize(() => (this.loading = false))
          );
        })
      )
      .subscribe({
        next: (stocks) => {
          // Filter out stocks that are already in portfolio or watchlist
          this.stocks = stocks.filter(
            (s) => !this.portfolioSymbols.has(s.symbol) && !this.watchlistSymbols.has(s.symbol)
          );
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string): void {
    this.searchQuery = value;
    if (value && value.length >= 1) {
      this.searchSubject.next(value);
    } else {
      this.stocks = [];
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (!this.selectedStock) return;

    this.dialogRef.close({
      symbol: this.selectedStock,
      targetPrice: this.targetPrice,
    });
  }

  /**
   * Get stock display string for dropdown/UI
   */
  getStockDisplay(stock: Stock): string {
    return `${stock.symbol} - ${stock.name || ''}`;
  }

  /**
   * Get stock value for selection
   */
  getStockValue(stock: Stock): string {
    return stock.symbol;
  }

  /**
   * Handle stock selection from dropdown
   */
  onStockSelected(symbol: string): void {
    this.selectedStock = symbol;
    this.stocks = []; // Close dropdown
  }
}