import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from 'environments/environment.prod';
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

  constructor(private http: HttpClient, private authService: AuthService) {}

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
      .put<{ message: string }>(`${this.apiUrl}/password`, request, {
        observe: 'response',
      })
      .pipe(
        tap((response) => {
          console.log('Password change full response:', response);
          console.log('Status:', response.status);
          console.log('Body:', response.body);
        }),
        map((response) => {
          // Handle various possible response formats
          if (response.body) {
            return response.body;
          }
          // Fallback if body is empty but status is 200
          return { message: 'Password changed successfully' };
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Password change error:', error);
          console.error('Error status:', error.status);
          console.error('Error body:', error.error);
          return throwError(() => this.handleError(error));
        })
      );
  }

  private handleError(error: HttpErrorResponse): string {
    // Priority 1: Check for 'message' field in error.error (backend error message)
    if (error.error?.message) {
      return error.error.message;
    }

    // Priority 2: Check for 'error' field in error.error
    if (error.error?.error) {
      return error.error.error;
    }

    // Priority 3: Handle validation errors (object with multiple fields)
    if (
      error.error &&
      typeof error.error === 'object' &&
      !error.error.error &&
      !error.error.message
    ) {
      const errorMessages = Object.values(error.error).filter((val) => typeof val === 'string');
      if (errorMessages.length > 0) {
        return errorMessages.join(', ');
      }
    }

    // Fallback: Generic error message
    return error.message || 'There was an error, please try again.';
  }
}
