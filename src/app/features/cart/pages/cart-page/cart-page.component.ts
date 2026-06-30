import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from '@core/services/cart.service';
import { Cart, CartItem } from '@core/models';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule
  ],
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss']
})
export class CartPageComponent implements OnInit {
  locale = 'es-CO'; // Colombia usa punto como separador de miles
  cart$ = this.cartService.cart$;
  displayedColumns = ['product', 'price', 'quantity', 'subtotal', 'actions'];

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe();
  }

  updateQuantity(itemId: number, quantity: string): void {
    const qty = parseInt(quantity, 10);
    if (qty > 0) {
      this.cartService.updateCartItem(itemId, qty).subscribe();
    }
  }

  removeItem(itemId: number): void {
    this.cartService.removeFromCart(itemId).subscribe();
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  clearCart(): void {
    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      this.cartService.clearCart().subscribe();
    }
  }
}
