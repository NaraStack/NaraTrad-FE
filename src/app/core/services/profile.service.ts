import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UserResponse } from '../models/auth.model';
import { AuthService } from './auth.service';

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get profile of currently logged in user
   */
  getProfile(): Observable<UserResponse> {
    return this.http.get<UserResponse>(this.apiUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Update profile (full name and email)
   */
  updateProfile(request: UpdateProfileRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(this.apiUrl, request).pipe(
      tap((updatedUser) => {
        // Update user in local storage if email changes
        const currentUser = this.authService.getCurrentUserValue();
        if (currentUser && currentUser.email !== updatedUser.email) {
          const user = {
            ...currentUser,
            email: updatedUser.email,
            fullName: updatedUser.fullName,
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem('naratrad_user', JSON.stringify(user));
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Change password
   */
  changePassword(request: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http
      .put<{ message: string }>(`${this.apiUrl}/password`, request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  private handleError(error: HttpErrorResponse): string {
    if (error.error?.error) {
      return error.error.error;
    }

    if (error.error && typeof error.error === 'object' && !error.error.error) {
      const errorMessages = Object.values(error.error);
      return errorMessages.join(', ');
    }

    return error.message || 'There was an error, please try again.';
  }
}