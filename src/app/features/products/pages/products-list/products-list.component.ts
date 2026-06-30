import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '@core/services/product.service';
import { CartService } from '@core/services/cart.service';
import { NotificationService } from '@core/services/notification.service';
import { Category, Brand, PaginatedResponse, Product } from '@core/models';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  locale = 'es-CO';
  loading = true;
  filterForm!: FormGroup;
  products$: Observable<PaginatedResponse<Product>> = of({ content: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: 0, hasNext: false, hasPrevious: false });
  brands$!: Observable<Brand[]>;

  rootCategories: Category[] = [];
  standaloneCategories: Category[] = [];

  sortOptions = [
    { value: 'recommended',  label: 'Recomendados' },
    { value: 'best_selling', label: 'Lo más vendido' },
    { value: 'newest',       label: 'Nuevas opciones' },
    { value: 'price_asc',   label: 'Precio: menor a mayor' },
    { value: 'price_desc',  label: 'Precio: mayor a menor' },
    { value: 'name_asc',    label: 'Nombre: A → Z' },
    { value: 'name_desc',   label: 'Nombre: Z → A' }
  ];

  private readonly PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gSW1hZ2VuPC90ZXh0Pjwvc3ZnPg==';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.brands$ = this.productService.getBrands();
    this.loadCategories();
    this.loadProducts();

    // Búsqueda reactiva con debounce
    this.filterForm.get('search')?.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => this.fetchProducts());
  }

  private initForm(): void {
    this.filterForm = this.fb.group({
      search:   [''],
      category: [null],
      brand:    [null],
      sortBy:   ['recommended']
    });
  }

  private loadCategories(): void {
    this.productService.getCategories().subscribe(categories => {
      const parentIds = new Set(categories.filter(c => c.parentId).map(c => c.parentId));
      this.rootCategories = categories.filter(c => parentIds.has(c.id));
      this.rootCategories.forEach(parent => {
        parent.children = categories.filter(c => c.parentId === parent.id);
      });
      this.standaloneCategories = categories.filter(c => !c.parentId && !parentIds.has(c.id));
    });
  }

  private loadProducts(): void {
    this.loading = true;
    this.products$ = this.productService.getProducts();
    this.products$.subscribe({ next: () => this.loading = false, error: () => this.loading = false });
  }

  applyFilters(): void {
    this.fetchProducts();
  }

  onSortChange(): void {
    this.fetchProducts();
  }

  onSearchInput(): void {
    // La reactividad la maneja valueChanges, este handler es por si se necesita feedback visual
  }

  clearFilters(): void {
    this.filterForm.reset({ search: '', category: null, brand: null, sortBy: 'recommended' });
    this.loadProducts();
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.PLACEHOLDER;
  }

  private fetchProducts(): void {
    const { search, category, brand, sortBy } = this.filterForm.value;
    const { field, direction } = this.parseSortOption(sortBy);

    this.loading = true;
    if (search?.trim()) {
      this.products$ = this.productService.searchProducts(search.trim());
    } else {
      this.products$ = this.productService.filterProducts(
        category, brand, undefined, undefined, undefined, undefined,
        0, 20, field, direction
      );
    }
    this.products$.subscribe({ next: () => this.loading = false, error: () => this.loading = false });
  }

  private parseSortOption(option: string): { field: string; direction: string } {
    switch (option) {
      case 'best_selling': return { field: 'totalSold',  direction: 'desc' };
      case 'newest':       return { field: 'createdAt',  direction: 'desc' };
      case 'price_asc':   return { field: 'price',       direction: 'asc'  };
      case 'price_desc':  return { field: 'price',       direction: 'desc' };
      case 'name_asc':    return { field: 'name',        direction: 'asc'  };
      case 'name_desc':   return { field: 'name',        direction: 'desc' };
      default:             return { field: 'createdAt',  direction: 'desc' };
    }
  }

  addToCart(productId: number): void {
    this.cartService.addToCart(productId, 1).subscribe({
      next:  () => this.notificationService.success('Producto agregado al carrito'),
      error: () => this.notificationService.error('Error al agregar al carrito')
    });
  }
}
