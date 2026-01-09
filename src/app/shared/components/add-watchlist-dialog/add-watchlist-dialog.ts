import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, switchMap, of, catchError, finalize } from 'rxjs';
import { StockService } from '../../../features/portfolio/services/stocks';

interface Stock {
  symbol: string;
  name: string;
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

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<AddWatchlistDialogComponent>,
    private stockService: StockService
  ) {}

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
          this.stocks = stocks;
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

  onStockSelected(value: string): void {
    if (value) {
      this.selectedStock = value;
    } else {
      this.selectedStock = null;
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
}