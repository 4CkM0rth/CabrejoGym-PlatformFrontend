import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Category, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getCategories(page: number = 0, size: number = 100): Observable<PaginatedResponse<Category>> {
    return this.http.get<PaginatedResponse<Category>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  createCategory(data: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, data);
  }

  updateCategory(id: number, data: UpdateCategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, data);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parentId?: number;
}
