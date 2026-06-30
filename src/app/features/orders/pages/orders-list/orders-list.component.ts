import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderService } from '@core/services/order.service';
import { Order } from '@core/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatPaginatorModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent implements OnInit {
  locale = 'es-CO'; // Colombia usa punto como separador de miles
  orders: Order[] = [];
  loading = true;
  displayedColumns = ['id', 'date', 'status', 'total', 'actions'];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Confirmado',
      'PROCESSING': 'En Proceso',
      'SHIPPED': 'Enviado',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado',
      'REFUNDED': 'Reembolsado',
      'COMPLETED': 'Completado'
    };
    return statusMap[status] || status;
  }
}
