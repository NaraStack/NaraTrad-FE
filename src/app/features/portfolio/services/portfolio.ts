import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock } from '../../../shared/models/stock'; 
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  private apiUrl = 'http://localhost:8080/api/portfolio';

  constructor(private http: HttpClient) {}


  getStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.apiUrl);
  }

  deleteStock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchStocks(symbol: string): Observable<Stock[]> {
    const params = new HttpParams().set('query', symbol);
    return this.http.get<Stock[]>(`${this.apiUrl}/search`, { params });
  }
}
