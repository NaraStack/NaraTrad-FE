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
import { Router, RouterModule } from '@angular/router';

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
    // private router: Router,
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
            return of([]); // Gunakan of([]) agar tetap berupa Observable
          }
          this.loading = true;
          // PENTING: catchError harus di dalam sini agar stream utama TIDAK MATI jika API error
          return this.stockService.searchStocks(query).pipe(
            catchError((err) => {
              return of([]); // Jika error, kembalikan array kosong
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
          console.error('Kritis: Stream Utama Mati!', err);
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

  // Menambahkan method yang hilang sesuai error template
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

      // 🔥 TAMBAHAN: fetch price dari API
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
          // ✅ redirect hanya setelah sukses
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
