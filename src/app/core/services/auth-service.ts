import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  BehaviorSubject,
  catchError,
  filter,
  Observable,
  of,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';
import { signUpRequest, User } from '../models/user.models';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageResponse, LoginRequest, AuthResponse } from '../models/user.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromLocalStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isRefreshing = false;
  private refreshResult$ = new BehaviorSubject<{ success: boolean; token?: string } | null>(null);

  constructor(
    private https: HttpClient,
    private router: Router,
  ) {}

  private getUserFromLocalStorage(): User | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  forgotPassword(email: string): Observable<MessageResponse> {
    return this.https.post<MessageResponse>(`${this.baseUrl}/forgotPassword`, { email });
  }

  signUp(request: signUpRequest): Observable<MessageResponse> {
    return this.https.post<MessageResponse>(`${this.baseUrl}/registerUser`, request);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.https
      .post<AuthResponse>(`${this.baseUrl}/login`, request)
      .pipe(tap((response) => this.handleAuthSuccess(response)));
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);

    const user: User = {
      id: response.id,
      name: response.name,
      email: response.email,
      role: response.role,
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  refreshAccessToken(): Observable<AuthResponse> {
    if (this.isRefreshing) {
      return this.refreshResult$.pipe(
        filter((result) => result !== null),
        take(1),
        switchMap((result) => {
          if (result!.success && result.token) {
            return of({ accessToken: result!.token } as AuthResponse);
          }
          return throwError(() => new Error('Token refresh failed'));
        }),
      );
    }
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    this.isRefreshing = true;
    this.refreshResult$.next(null);

    return this.https.post<AuthResponse>(`${this.baseUrl}/refreshToken`, { refreshToken }).pipe(
      tap((response) => {
        localStorage.setItem('accessToken', response.accessToken);

        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }

        this.refreshResult$.next({ success: true, token: response.accessToken });
      }),
      catchError((error) => {
        this.isRefreshing = false;
        this.refreshResult$.next({ success: false });
        this.logout();
        return throwError(() => error);
      }),
    );
  }

  refreshAccessTokenAsync(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.refreshAccessToken().subscribe({
        next: (response) => {
          resolve(response.accessToken);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): 'USER' | 'ADMIN' | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }
}
