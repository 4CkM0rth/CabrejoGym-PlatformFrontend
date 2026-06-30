import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '@core/services/product.service';
import { CartService } from '@core/services/cart.service';
import { NotificationService } from '@core/services/notification.service';
import { Product, Category, Brand, PaginatedResponse } from '@core/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatSliderModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  locale = 'es-CO';
  filterForm!: FormGroup;
  products$!: Observable<PaginatedResponse<Product>>;
  categories$!: Observable<Category[]>;
  brands$!: Observable<Brand[]>;

  rootCategories: Category[] = [];
  standaloneCategories: Category[] = [];

  sortOptions = [
    { value: 'recommended', label: 'Recomendados' },
    { value: 'best_selling', label: 'Lo más vendido' },
    { value: 'newest', label: 'Nuevas opciones' },
    { value: 'price_asc', label: 'Precio: Del más bajo al más alto' },
    { value: 'price_desc', label: 'Precio: Del más alto al más bajo' },
    { value: 'name_asc', label: 'Nombre: A a la Z' },
    { value: 'name_desc', label: 'Nombre: Z a la A' }
  ];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.categories$ = this.productService.getCategories();
    this.brands$ = this.productService.getBrands();
    this.loadProducts();

    this.productService.getCategories().subscribe(categories => {
      const parentIds = new Set(categories.filter(c => c.parentId).map(c => c.parentId));
      this.rootCategories = categories.filter(c => parentIds.has(c.id));
      this.rootCategories.forEach(parent => {
        parent.children = categories.filter(c => c.parentId === parent.id);
      });
      this.standaloneCategories = categories.filter(c => !c.parentId && !parentIds.has(c.id));
    });
  }

  private initForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      category: [null],
      brand: [null],
      sortBy: ['recommended']
    });
  }

  private loadProducts(): void {
    this.products$ = this.productService.getProducts();
  }

  applyFilters(): void {
    this.fetchProducts();
  }

  onSortChange(): void {
    this.fetchProducts();
  }

  private fetchProducts(): void {
    const { search, category, brand, sortBy } = this.filterForm.value;
    const { field, direction } = this.parseSortOption(sortBy);

    if (search) {
      this.products$ = this.productService.searchProducts(search);
    } else {
      this.products$ = this.productService.filterProducts(
        category, brand, undefined, undefined, undefined, undefined,
        0, 20, field, direction
      );
    }
  }

  private parseSortOption(option: string): { field: string; direction: string } {
    switch (option) {
      case 'best_selling': return { field: 'totalSold', direction: 'desc' };
      case 'newest': return { field: 'createdAt', direction: 'desc' };
      case 'price_asc': return { field: 'price', direction: 'asc' };
      case 'price_desc': return { field: 'price', direction: 'desc' };
      case 'name_asc': return { field: 'name', direction: 'asc' };
      case 'name_desc': return { field: 'name', direction: 'desc' };
      default: return { field: 'createdAt', direction: 'desc' }; // recommended
    }
  }

  addToCart(productId: number): void {
    this.cartService.addToCart(productId, 1).subscribe({
      next: () => this.notificationService.success('Producto agregado al carrito'),
      error: () => this.notificationService.error('Error al agregar al carrito')
    });
  }
}
