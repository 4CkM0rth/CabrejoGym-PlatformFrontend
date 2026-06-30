import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Product, PaginatedResponse, Category, Brand, PublicationStatus } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(page: number = 0, size: number = 20): Observable<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  searchProducts(query: string, page: number = 0, size: number = 20): Observable<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>(`${this.apiUrl}/search?query=${query}&page=${page}&size=${size}`);
  }

  filterProducts(
    categoryId?: number,
    brandId?: number,
    minPrice?: number,
    maxPrice?: number,
    status?: PublicationStatus,
    inStock?: boolean,
    page: number = 0,
    size: number = 20,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc'
  ): Observable<PaginatedResponse<Product>> {
    let params = `?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`;
    if (categoryId) params += `&categoryId=${categoryId}`;
    if (brandId) params += `&brandId=${brandId}`;
    if (minPrice) params += `&minPrice=${minPrice}`;
    if (maxPrice) params += `&maxPrice=${maxPrice}`;
    if (status) params += `&status=${status}`;
    if (inStock !== undefined) params += `&inStock=${inStock}`;

    return this.http.get<PaginatedResponse<Product>>(`${this.apiUrl}/advanced-search${params}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`);
  }

  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${environment.apiUrl}/brands`);
  }

  updateProduct(id: number, data: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, data);
  }

  updateStock(id: number, stock: number): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}/stock`, { stock });
  }

  publishProduct(id: number): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${id}/publish`, {});
  }

  unpublishProduct(id: number): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${id}/unpublish`, {});
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createProduct(data: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, data);
  }

  uploadProductImage(productId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPrimary', 'true');
    formData.append('displayOrder', '0');
    
    return this.http.post(`${this.apiUrl}/${productId}/images/upload`, formData);
  }

  addProductImage(productId: number, imageUrl: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productId}/images`, {
      url: imageUrl,
      isPrimary: true,
      displayOrder: 0
    });
  }

  setPrimaryImage(imageId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/images/${imageId}/set-primary`, {});
  }

  deleteProductImage(imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/images/${imageId}`);
  }

  // Variant methods
  getVariants(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${productId}/variants`);
  }

  createVariant(productId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productId}/variants`, data);
  }

  updateVariant(variantId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/variants/${variantId}`, data);
  }

  deleteVariant(variantId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/variants/${variantId}`);
  }
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  hasDiscount?: boolean;
  discountPercent?: number;
  stock: number;
  categoryId: number;
  brandId?: number;
  sku?: string;
  hasVariants?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  hasDiscount?: boolean;
  discountPercent?: number;
  stock?: number;
  categoryId?: number;
  brandId?: number;
  status?: PublicationStatus;
  hasVariants?: boolean;
}
