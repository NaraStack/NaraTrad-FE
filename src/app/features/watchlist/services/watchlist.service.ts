import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Watchlist, WatchlistRequest } from '../../../shared/models/stock';

@Injectable({
  providedIn: 'root',
})
export class WatchlistService {
  private apiUrl = 'http://localhost:8080/api/watchlist';

  constructor(private http: HttpClient) {}

  /**
   * GET all watchlist items with real-time prices
   */
  getAllWatchlist(): Observable<Watchlist[]> {
    return this.http.get<Watchlist[]>(this.apiUrl);
  }

  /**
   * POST add a stock symbol to watchlist
   */
  addToWatchlist(request: WatchlistRequest): Observable<Watchlist> {
    return this.http.post<Watchlist>(this.apiUrl, request);
  }

  /**
   * PUT update target price for a watchlist item
   */
  updateTargetPrice(id: number, targetPrice: number): Observable<Watchlist> {
    return this.http.put<Watchlist>(`${this.apiUrl}/${id}/target-price`, { targetPrice });
  }

  /**
   * DELETE remove a stock from watchlist
   */
  removeFromWatchlist(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}