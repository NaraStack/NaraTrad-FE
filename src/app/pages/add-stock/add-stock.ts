import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  switchMap,
  finalize,
  of,
  catchError,
} from 'rxjs';
import { StockService } from '../../features/portfolio/services/stocks';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

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
    // RouterModule
  ],
  templateUrl: './add-stock.html',
  styleUrl: './add-stock.scss',
})
export class AddStock implements OnInit, OnDestroy {
  searchQuery: string = '';
  stocks: Stock[] = [];
  selectedStockValue: string = '';
  loading: boolean = false;
  selectedStock: string | null = null;
  stockPrice: string | null = null;
  priceLoading: boolean = false;
  totalPrice: string | null = null;
  quantity: string = '';
  // group!: FormGroup;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private stockService: StockService
  ) {}

  ngOnInit(): void {
    // Check for query params (from watchlist navigation)
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['symbol']) {
        const symbol = params['symbol'];
        this.selectedStock = symbol;
        this.selectedStockValue = symbol;
        // Fetch price for prefilled symbol
        this.onStockSelected(symbol);
      }
    });

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
            catchError((err) => {
              return of([]);
            }),
            finalize(() => (this.loading = false))
          );
        })
      )
      .subscribe({
        next: (stocks) => {
          this.stocks = stocks;
        },
        error: (err) => {
          console.error('Critical: Main stream died!', err);
        },
      });
  }

  // Method baru menggunakan ngModelChange
  onSearchChange(value: string): void {
    this.searchQuery = value;
    if (value && value.length >= 1) {
      this.searchSubject.next(value);
    } else {
      this.stocks = [];
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(): void {
    if (this.searchQuery.length >= 1) {
      this.searchSubject.next(this.searchQuery);
    } else {
      this.stocks = [];
    }
  }

  // Add missing methods according to error template
  fetchSuggestions(): void {
    this.onSearch();
  }

  getStockValue(stock: Stock): string {
    return `${stock.symbol}`;
  }

  getStockDisplay(stock: Stock): string {
    return `${stock.symbol}`;
  }

  onStockSelected(value: string): void {
    if (value) {
      const symbol = value;
      this.selectedStock = symbol;

      // fetch price from API
      this.priceLoading = true;
      this.stockService
        .stockPrice(symbol)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (price) => {
            console.log('Fetched price: ', price);
            this.stockPrice = price.toString();
          },
          error: () => {
            this.stockPrice = null;
          },
          complete: () => {
            this.priceLoading = false;
          },
        });
    } else {
      this.searchQuery = '';
      this.selectedStock = null;
      this.stockPrice = null;
    }
  }

  calculateTotalPrice(): void {
    const qty = Number(this.quantity);
    const price = Number(this.stockPrice);
    if (this.quantity && this.stockPrice) {
      const total = qty * price;
      this.totalPrice = total.toString();
    }
  }

  onSubmit(): void {
    if (!this.selectedStock || !this.quantity) return;

    this.stockService
      .createStock(this.selectedStock, Number(this.quantity))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Stock added successfully!');
          // redirect only after success
          // this.router.navigate(['/portfolio'], {
          //   state: { created: true },
          // });
        },
        error: (err) => {
          console.error('Failed to add stock!', err);
        },
      });
  }
}