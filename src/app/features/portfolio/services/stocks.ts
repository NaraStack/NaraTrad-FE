import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Stock {
  symbol: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class StockService {
  private readonly API_URL = 'http://localhost:8080/api/portfolio';

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
}
