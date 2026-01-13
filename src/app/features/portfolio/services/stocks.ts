import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment.prod';

export interface Stock {
  symbol: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class StockService {
  private readonly API_URL = `${environment.apiUrl}/portfolio`;
  constructor(private http: HttpClient) {}

  searchStocks(query: string): Observable<Stock[]> {
    const url = `${this.API_URL}/search?query=${encodeURIComponent(query)}`;
    return this.http.get<any[]>(url).pipe(
      map((response) =>
        response.map((item) => ({
          symbol: item.symbol,
          name: item.name,
        }))
      )
    );
  }

  stockPrice(symbol: string): Observable<number> {
    const url = `${this.API_URL}/price/${encodeURIComponent(symbol)}`;
    return this.http.get<any>(url);
  }

  createStock(symbol: string, quantity: number): Observable<Stock> {
    const url = `${this.API_URL}`;
    return this.http.post<Stock>(url, { symbol, quantity });
  }
}
