import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Order, PaginatedResponse, CreateOrderRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getUserOrders(page: number = 0, size: number = 20): Observable<PaginatedResponse<Order>> {
    return this.http.get<PaginatedResponse<Order>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/me`);
  }

  getMyOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/me/${id}`);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  createOrder(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, request);
  }

  cancelOrder(orderId: number): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/me/${orderId}/cancel`, {});
  }

  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${orderId}/status`, null, {
      params: { status }
    });
  }
}
