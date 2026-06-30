import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { User, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(page: number = 0, size: number = 20): Observable<PaginatedResponse<User>> {
    return this.http.get<PaginatedResponse<User>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  changeRole(id: number, role: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/role`, { role });
  }

  changeEmail(id: number, email: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/email`, { email });
  }

  resetPassword(id: number, newPassword: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/password`, { newPassword });
  }
}
