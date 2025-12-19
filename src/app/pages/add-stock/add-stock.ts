import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  switchMap,
  finalize,
  of,
  tap,
  catchError,
} from 'rxjs';
import { StockService } from '../../features/portfolio/services/stocks';
import { ChangeDetectorRef } from '@angular/core';

interface Stock {
  symbol: string;
  name: string;
}

@Component({
  selector: 'app-add-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-stock.html',
})
export class AddStock implements OnInit, OnDestroy {
  searchQuery: string = '';
  stocks: Stock[] = [];
  selectedStockValue: string = '';
  loading: boolean = false;
  selectedStock: Stock | null = null;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private stockService: StockService, private cdr: ChangeDetectorRef) {
    console.log('--- AddStockComponent Terload ---');
  }

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((q) => console.log('Query lolos debounce:', q)), // Log untuk cek aliran data
        takeUntil(this.destroy$),
        switchMap((query) => {
          if (!query.trim()) {
            return of([]); // Gunakan of([]) agar tetap berupa Observable
          }
          this.loading = true;
          console.log('Memanggil API untuk:', query);
          // PENTING: catchError harus di dalam sini agar stream utama TIDAK MATI jika API error
          return this.stockService.searchStocks(query).pipe(
            catchError((err) => {
              console.error('API Error:', err);
              return of([]); // Jika error, kembalikan array kosong
            }),
            finalize(() => (this.loading = false))
          );
        })
      )
      .subscribe({
        next: (stocks) => {
          console.log('✅ Data dari API:', stocks);
          this.stocks = stocks;
        },
        error: (err) => {
          console.error('Kritis: Stream Utama Mati!', err);
        },
      });
    // this.stockService.searchStocks('f').subscribe({
    //   next: (stocks) => {
    //     console.log('Data ada di console:', stocks);
    //     this.stocks = stocks;
    //     // 3. Paksa Angular untuk me-render ulang UI
    //     this.cdr.detectChanges();
    //   },
    //   error: (err) => console.error(err),
    // });
  }

  // Method baru menggunakan ngModelChange
  onSearchChange(value: string): void {
    console.log('Input Changes: ', value);
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
    return `${stock.symbol}_${stock.name}`;
  }

  getStockDisplay(stock: Stock): string {
    return `${stock.symbol}`;
  }

  onStockSelected(value: string): void {
    if (value) {
      const [symbol, name] = value.split('_');
      this.searchQuery = `${symbol} - ${name}`;

      // Simpan objek stock yang dipilih agar variabel selectedStock tidak error
      this.selectedStock = { symbol, name };
      this.stocks = [];
    } else {
      this.searchQuery = '';
      this.selectedStock = null;
    }
  }
}
