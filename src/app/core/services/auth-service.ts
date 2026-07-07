import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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
}
