import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock } from '../../../shared/models/stock';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  private apiUrl = 'http://localhost:8080/api/portfolio';

  constructor(private http: HttpClient) {}

  // GET semua saham (untuk tabel dashboard)
  getStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.apiUrl);
  }

  // GET dashboard lengkap (jika ingin data lebih lengkap)
  getDashboard(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/dashboard`);
  }

  // DELETE stock by id
  deleteStock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // POST add atau update stock
  addOrUpdateStock(stock: { symbol: string; quantity: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}`, stock);
  }

  // GET calculate total value per stock
  calculateStockValue(symbol: string, quantity: number): Observable<{ totalValue: number }> {
    const params = new HttpParams()
      .set('symbol', symbol)
      .set('quantity', quantity.toString());
    return this.http.get<{ totalValue: number }>(`${this.apiUrl}/calculate`, { params });
  }

  // GET search symbol untuk dropdown
  searchSymbol(symbol: string): Observable<string[]> {
    const params = new HttpParams().set('symbol', symbol);
    return this.http.get<string[]>(`${this.apiUrl}/search`, { params });
  }

  // GET harga stock by symbol
  getStockPrice(symbol: string): Observable<{ price: number }> {
    return this.http.get<{ price: number }>(`${this.apiUrl}/price/${symbol}`);
  }

  // GET portfolio summary
  getPortfolioSummary(): Observable<{ totalPortfolioValue: number; totalStocksOwned: number }> {
    return this.http.get<{ totalPortfolioValue: number; totalStocksOwned: number }>(`${this.apiUrl}/summary`);
  }
}
