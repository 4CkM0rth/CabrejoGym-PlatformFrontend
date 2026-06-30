import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductService } from '@core/services/product.service';
import { NotificationService } from '@core/services/notification.service';
import { Product, ProductImage } from '@core/models';

@Component({
  selector: 'app-images-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatTooltipModule],
  templateUrl: './images-dialog.component.html',
  styleUrls: ['./images-dialog.component.scss']
})
export class ImagesDialogComponent implements OnInit {
  product: Product;
  images: ProductImage[] = [];
  loading = false;
  uploading = false;

  constructor(
    private productService: ProductService,
    public dialogRef: MatDialogRef<ImagesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: Product },
    private notificationService: NotificationService
  ) {
    this.product = data.product;
  }

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.loading = true;
    this.productService.getProductById(this.product.id).subscribe({
      next: (p) => { this.images = p.images || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.uploading = true;
    const file = input.files[0];
    this.productService.uploadProductImage(this.product.id, file).subscribe({
      next: () => { this.uploading = false; this.loadImages(); },
      error: () => { this.uploading = false; this.notificationService.error('Error al subir imagen'); }
    });
    input.value = '';
  }

  setPrimary(imageId: number): void {
    this.productService.setPrimaryImage(imageId).subscribe({
      next: () => this.loadImages(),
      error: () => this.notificationService.error('Error al establecer imagen principal')
    });
  }

  deleteImage(imageId: number): void {
    if (!confirm('¿Eliminar esta imagen?')) return;
    this.productService.deleteProductImage(imageId).subscribe({
      next: () => this.loadImages(),
      error: () => this.notificationService.error('Error al eliminar imagen')
    });
  }
}
