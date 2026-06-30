import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map, catchError, of } from 'rxjs';
import { environment } from '@environments/environment';
import { Cart, CartItem } from '../models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.initializeEmptyCart();
  }

  private initializeEmptyCart(): void {
    const emptyCart: Cart = {
      id: 0,
      items: [],
      subtotal: 0,
      totalItems: 0
    };
    this.cartSubject.next(emptyCart);
  }

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl)
      .pipe(
        tap(cart => this.cartSubject.next(cart)),
        catchError(error => {
          if (error.status === 401) {
            this.initializeEmptyCart();
            return of(this.cartSubject.value!);
          }
          throw error;
        })
      );
  }

  addToCart(productId: number, quantity: number, variantId?: number): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/items`, { productId, quantity, variantId })
      .pipe(tap(cart => this.cartSubject.next(cart)));
  }

  updateCartItem(itemId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/items/${itemId}`, { quantity })
      .pipe(tap(cart => this.cartSubject.next(cart)));
  }

  removeFromCart(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/items/${itemId}`)
      .pipe(tap(cart => this.cartSubject.next(cart)));
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.apiUrl)
      .pipe(tap(() => this.initializeEmptyCart()));
  }

  getTotalItems(): Observable<number> {
    return this.cart$.pipe(
      map(cart => cart ? cart.totalItems : 0)
    );
  }

  reloadCart(): void {
    if (this.authService.isAuthenticated()) {
      this.getCart().subscribe();
    }
  }

  resetCart(): void {
    this.initializeEmptyCart();
  }
}
