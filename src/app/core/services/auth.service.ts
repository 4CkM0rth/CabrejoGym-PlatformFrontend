import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '@environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(request: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, request);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => {
          this.saveToken(response.accessToken);
        }),
        tap(response => {
          // Cargar usuario después de guardar el token
          this.loadCurrentUser().subscribe();
        })
      );
  }

  loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/me`)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          localStorage.setItem('user', JSON.stringify(user));
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasAdminRole(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private loadUserFromStorage(): User | null {
    try {
      const userJson = localStorage.getItem('user');
      if (!userJson || userJson === 'undefined' || userJson === 'null') {
        return null;
      }
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Error loading user from storage:', error);
      localStorage.removeItem('user');
      return null;
    }
  }
}
