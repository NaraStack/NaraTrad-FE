import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock, DashboardData, PerformanceChartDTO } from '../../../shared/models/stock';
import { HttpParams } from '@angular/common/http';
import { environment } from 'environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  // private apiUrl = 'http://localhost:8080/api/portfolio';
  private apiUrl = `${environment.apiUrl}/portfolio`;

  constructor(private http: HttpClient) {}

  // GET semua saham (untuk tabel dashboard)
  getStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.apiUrl);
  }

  // GET dashboard lengkap (jika ingin data lebih lengkap)
  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`);
  }

  // DELETE stock by id
  deleteStock(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  updateStock(symbol: string, quantity: number): Observable<{ newQuantity: number }> {
    const url = `${this.apiUrl}/update-stock/${encodeURIComponent(symbol)}`;
    return this.http.put<{ newQuantity: number }>(url, {
      addedQuantity: quantity,
    });
  }

  // POST add atau update stock
  addOrUpdateStock(stock: { symbol: string; quantity: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}`, stock);
  }

  // GET calculate total value per stock
  calculateStockValue(symbol: string, quantity: number): Observable<{ totalValue: number }> {
    const params = new HttpParams().set('symbol', symbol).set('quantity', quantity.toString());
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
    return this.http.get<{ totalPortfolioValue: number; totalStocksOwned: number }>(
      `${this.apiUrl}/summary`
    );
  }

  // GET performance chart data
  getPerformanceChart(): Observable<PerformanceChartDTO> {
    return this.http.get<PerformanceChartDTO>(`${this.apiUrl}/performance`);
  }
}
