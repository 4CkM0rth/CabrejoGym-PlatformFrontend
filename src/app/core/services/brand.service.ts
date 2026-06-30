import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Brand } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private apiUrl = `${environment.apiUrl}/brands`;

  constructor(private http: HttpClient) {}

  getAllBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(this.apiUrl);
  }

  getActiveBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.apiUrl}/active`);
  }

  getBrandById(id: number): Observable<Brand> {
    return this.http.get<Brand>(`${this.apiUrl}/${id}`);
  }

  createBrand(brand: { name: string; description?: string; logoUrl?: string }): Observable<Brand> {
    return this.http.post<Brand>(this.apiUrl, brand);
  }

  updateBrand(id: number, brand: { name?: string; description?: string; logoUrl?: string; active?: boolean }): Observable<Brand> {
    return this.http.put<Brand>(`${this.apiUrl}/${id}`, brand);
  }

  deleteBrand(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
