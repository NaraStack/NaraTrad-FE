import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Stock } from '../../../shared/models/stock';
import { STOCK_MOCK } from '../../../shared/mocks/stock.mock';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  private apiUrl = '/api/stocks';

  constructor(private http: HttpClient) {}

  getStocks(): Observable<Stock[]> {
    // BACKEND BELUM ADA , klo ada tinggal ganti return
    return of(STOCK_MOCK);
  }
}
