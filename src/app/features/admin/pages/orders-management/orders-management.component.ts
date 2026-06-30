import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrderService } from '@core/services/order.service';
import { NotificationService } from '@core/services/notification.service';
import { Order } from '@core/models';

@Component({
  selector: 'app-orders-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './orders-management.component.html',
  styleUrls: ['./orders-management.component.scss']
})
export class OrdersManagementComponent implements OnInit {
  locale = 'es-CO'; // Colombia usa punto como separador de miles
  orders: Order[] = [];
  loading = true;
  displayedColumns = ['id', 'customer', 'date', 'status', 'total', 'actions'];

  statusOptions = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'PAID', label: 'Pagado' },
    { value: 'SHIPPED', label: 'Enviado' },
    { value: 'DELIVERED', label: 'Entregado' },
    { value: 'CANCELLED', label: 'Cancelado' },
    { value: 'RETURN_REQUESTED', label: 'Devolución Solicitada' },
    { value: 'REFUNDED', label: 'Reembolsado' }
  ];

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getUserOrders(0, 100).subscribe({
      next: (response) => {
        this.orders = response.content;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  updateStatus(orderId: number, newStatus: string): void {
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.notificationService.success('Estado actualizado correctamente');
        this.loadOrders();
      },
      error: (error) => {
        this.notificationService.error('Error al actualizar el estado: ' + (error.error?.message || error.message || 'Error desconocido'));
      }
    });
  }

  translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING: 'Pendiente', PAID: 'Pagado', SHIPPED: 'Enviado',
      DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
      RETURN_REQUESTED: 'Devolución Solicitada', REFUNDED: 'Reembolsado'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'status-pending', PAID: 'status-paid',
      SHIPPED: 'status-shipped', DELIVERED: 'status-delivered',
      CANCELLED: 'status-cancelled', RETURN_REQUESTED: 'status-return',
      REFUNDED: 'status-refunded'
    };
    return map[status] || '';
  }
}
