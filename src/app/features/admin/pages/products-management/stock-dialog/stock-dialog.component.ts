import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '@core/services/product.service';
import { NotificationService } from '@core/services/notification.service';
import { Product } from '@core/models';

@Component({
  selector: 'app-stock-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './stock-dialog.component.html',
  styleUrls: ['./stock-dialog.component.scss']
})
export class StockDialogComponent {
  product: Product;
  newStock: number;
  loading = false;

  constructor(
    private productService: ProductService,
    public dialogRef: MatDialogRef<StockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: Product },
    private notificationService: NotificationService
  ) {
    this.product = data.product;
    this.newStock = data.product.stock;
  }

  increment(amount: number): void {
    this.newStock = Math.max(0, this.newStock + amount);
  }

  save(): void {
    this.loading = true;
    this.productService.updateStock(this.product.id, this.newStock).subscribe({
      next: () => { this.loading = false; this.dialogRef.close(true); },
      error: () => { this.loading = false; this.notificationService.error('Error al actualizar stock'); }
    });
  }
}
