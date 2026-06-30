import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { EMPTY, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { CartService } from '@core/services/cart.service';
import { OrderService } from '@core/services/order.service';
import { AddressService } from '@core/services/address.service';
import { NotificationService } from '@core/services/notification.service';
import { CreateOrderRequest } from '@core/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatRadioModule
  ],
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.scss']
})
export class CheckoutPageComponent implements OnInit {
  locale = 'es-CO'; // Colombia usa punto como separador de miles
  addressForm!: FormGroup;
  paymentForm!: FormGroup;
  cart$ = this.cartService.cart$;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private addressService: AddressService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.initForms();
  }

  get paymentMethodLabel(): string {
    const labels: Record<string, string> = {
      CREDIT_CARD: 'Tarjeta de Crédito',
      DEBIT_CARD: 'Tarjeta de Débito',
      PAYPAL: 'PayPal',
      BANK_TRANSFER: 'Transferencia Bancaria'
    };
    return labels[this.paymentForm.get('paymentMethod')?.value] ?? '';
  }

  ngOnInit(): void {
    this.cartService.getCart().subscribe();
  }

  private initForms(): void {
    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['Colombia', Validators.required],
      phone: ['', Validators.required]
    });

    this.paymentForm = this.fb.group({
      paymentMethod: ['CREDIT_CARD', Validators.required]
    });
  }

  placeOrder(): void {
    if (!this.addressForm.valid || !this.paymentForm.valid) {
      return;
    }

    this.cart$
      .pipe(
        switchMap(cart => {
          if (!cart || cart.items.length === 0) {
            this.notificationService.error('El carrito está vacío');
            return EMPTY;
          }

          const orderRequest: CreateOrderRequest = {
            items: cart.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            }))
          };

          return this.orderService.createOrder(orderRequest);
        }),
        switchMap(order =>
          this.cartService.clearCart().pipe(
            map(() => order),
            catchError(() => of(order))
          )
        )
      )
      .subscribe({
        next: order => this.router.navigate(['/orders', order.id]),
        error: error => {
          this.notificationService.error(
            'Error al crear la orden: ' + (error.error?.message || 'Error desconocido')
          );
        }
      });
  }
}
