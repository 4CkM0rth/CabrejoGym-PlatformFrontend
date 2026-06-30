import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductService } from '@core/services/product.service';
import { NotificationService } from '@core/services/notification.service';
import { Product, PaginatedResponse, Category, PublicationStatus } from '@core/models';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { StockDialogComponent } from './stock-dialog/stock-dialog.component';
import { ImagesDialogComponent } from './images-dialog/images-dialog.component';
import { VariantsDialogComponent } from './variants-dialog/variants-dialog.component';

@Component({
  selector: 'app-products-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatDialogModule
  ],
  templateUrl: './products-management.component.html',
  styleUrls: ['./products-management.component.scss']
})
export class ProductsManagementComponent implements OnInit {
  loading = true;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  
  // Filtros
  searchTerm = '';
  selectedCategory = '';
  stockFilter = '';
  
  displayedColumns = ['image', 'name', 'category', 'price', 'stock', 'active', 'actions'];

  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    // Cargar productos
    this.productService.getProducts(0, 100).subscribe({
      next: (response) => {
        this.products = response.content;
        this.filteredProducts = [...this.products];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });

    // Cargar categorías
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      }
    });
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      // Filtro de búsqueda
      const matchesSearch = !this.searchTerm || 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.slug.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtro de categoría
      const matchesCategory = !this.selectedCategory || 
        (product.category && product.category.id === parseInt(this.selectedCategory));

      // Filtro de stock
      let matchesStock = true;
      if (this.stockFilter === 'available') {
        matchesStock = product.stock > 10;
      } else if (this.stockFilter === 'low') {
        matchesStock = product.stock > 0 && product.stock <= 10;
      } else if (this.stockFilter === 'out') {
        matchesStock = product.stock === 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'stock-out';
    if (stock <= 10) return 'stock-low';
    return 'stock-available';
  }

  openProductDialog(product?: Product): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '640px',
      maxHeight: '90vh',
      data: { product }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  editProduct(product: Product): void {
    this.openProductDialog(product);
  }

  toggleProductStatus(product: Product): void {
    // Cambiar el estado de publicación
    const isPublished = product.status === PublicationStatus.PUBLISHED;
    
    if (isPublished) {
      this.productService.unpublishProduct(product.id).subscribe({
        next: () => {
          product.status = PublicationStatus.UNPUBLISHED;
          this.notificationService.success('Producto despublicado correctamente');
        },
        error: () => {
          this.notificationService.error('Error al despublicar el producto');
        }
      });
    } else {
      this.productService.publishProduct(product.id).subscribe({
        next: () => {
          product.status = PublicationStatus.PUBLISHED;
          this.notificationService.success('Producto publicado correctamente');
        },
        error: () => {
          this.notificationService.error('Error al publicar el producto');
        }
      });
    }
  }

  manageStock(product: Product): void {
    const dialogRef = this.dialog.open(StockDialogComponent, {
      width: '480px',
      data: { product }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  manageImages(product: Product): void {
    const dialogRef = this.dialog.open(ImagesDialogComponent, {
      width: '600px',
      data: { product }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  manageVariants(product: Product): void {
    const dialogRef = this.dialog.open(VariantsDialogComponent, {
      width: '700px',
      data: { product }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  deleteProduct(product: Product): void {
    if (confirm(`¿Estás seguro de eliminar el producto "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.notificationService.success('Producto eliminado correctamente');
          this.loadData();
        },
        error: () => {
          this.notificationService.error('Error al eliminar el producto');
        }
      });
    }
  }
}

