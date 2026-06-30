import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '@core/services/product.service';
import { BranchService } from '@core/services/branch.service';
import { Product, Branch } from '@core/models';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit, OnDestroy {
  locale = 'es-CO'; // Colombia usa punto como separador de miles
  products$ = this.productService.getProducts(0, 8);
  branches$ = this.branchService.getBranches();
  
  // Índices de imagen actual para cada producto
  productImageIndices: { [key: number]: number } = {};
  private imageCarousels: { [key: number]: any } = {};
  private readonly IMAGE_INTERVAL = 2500; // 3 segundos

  constructor(
    private productService: ProductService,
    private branchService: BranchService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    // Limpiar todos los intervalos
    Object.values(this.imageCarousels).forEach(interval => {
      if (interval) clearInterval(interval);
    });
  }

  startImageCarousel(productId: number, imageCount: number): void {
    if (imageCount <= 1) return; // No iniciar carrusel si solo hay una imagen
    
    // Inicializar índice si no existe
    if (this.productImageIndices[productId] === undefined) {
      this.productImageIndices[productId] = 0;
    }

    // Limpiar intervalo existente si hay uno
    if (this.imageCarousels[productId]) {
      clearInterval(this.imageCarousels[productId]);
    }

    // Crear nuevo intervalo
    this.imageCarousels[productId] = setInterval(() => {
      this.productImageIndices[productId] = 
        (this.productImageIndices[productId] + 1) % imageCount;
    }, this.IMAGE_INTERVAL);
  }

  stopImageCarousel(productId: number): void {
    if (this.imageCarousels[productId]) {
      clearInterval(this.imageCarousels[productId]);
      delete this.imageCarousels[productId];
    }
  }

  getProductImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      const currentIndex = this.productImageIndices[product.id] || 0;
      return product.images[currentIndex]?.url || this.getPlaceholderImage();
    }
    return this.getPlaceholderImage();
  }

  getPlaceholderImage(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gSW1hZ2VuPC90ZXh0Pjwvc3ZnPg==';
  }

  getBranchImage(branch: Branch): string {
    if (branch.images && branch.images.length > 0) {
      const primaryImage = branch.images.find(img => img.isPrimary);
      return primaryImage ? primaryImage.url : branch.images[0].url;
    }
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gSW1hZ2VuPC90ZXh0Pjwvc3ZnPg==';
  }

  onImageError(event: any): void {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gSW1hZ2VuPC90ZXh0Pjwvc3ZnPg==';
  }
}
