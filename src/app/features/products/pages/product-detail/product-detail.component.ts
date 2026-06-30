import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService, UpdateProductRequest } from '@core/services/product.service';
import { CartService } from '@core/services/cart.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { Product, Category, Brand } from '@core/models';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  locale = 'es-CO'; // Colombia usa punto como separador de miles
  product$!: Observable<Product>;
  addToCartForm!: FormGroup;
  editForm!: FormGroup;
  private currentProduct: Product | null = null;
  isEditMode = false;
  categories: Category[] = [];
  brands: Brand[] = [];
  currentImageIndex = 0;
  showImageModal = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    public authService: AuthService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.addToCartForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(99)]]
    });

    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      shortDescription: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      hasDiscount: [false],
      discountPercent: [0, [Validators.min(0), Validators.max(100)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null],
      brandId: [null]
    });
  }

  ngOnInit(): void {
    this.product$ = this.route.params.pipe(
      switchMap(params => this.productService.getProductById(params['id']))
    );
    
    this.product$.subscribe(product => {
      this.currentProduct = product;
      this.currentImageIndex = 0;
      this.populateEditForm(product);
    });

    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
    });

    this.productService.getBrands().subscribe(brands => {
      this.brands = brands;
    });
  }

  getCurrentImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      return product.images[this.currentImageIndex]?.url || this.getPlaceholderImage();
    }
    return this.getPlaceholderImage();
  }

  getPlaceholderImage(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gSW1hZ2VuPC90ZXh0Pjwvc3ZnPg==';
  }

  decrementQty(): void {
    const current = this.addToCartForm.get('quantity')?.value ?? 1;
    if (current > 1) this.addToCartForm.patchValue({ quantity: current - 1 });
  }

  incrementQty(maxStock: number): void {
    const current = this.addToCartForm.get('quantity')?.value ?? 1;
    if (current < maxStock) this.addToCartForm.patchValue({ quantity: current + 1 });
  }

  selectImage(index: number): void {
    this.currentImageIndex = index;
  }

  nextImage(product: Product): void {
    if (product.images && this.currentImageIndex < product.images.length - 1) {
      this.currentImageIndex++;
    }
  }

  previousImage(product: Product): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  openImageModal(): void {
    this.showImageModal = true;
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
  }

  closeImageModal(): void {
    this.showImageModal = false;
    document.body.style.overflow = ''; // Restaurar scroll
  }

  hasAdminRole(): boolean {
    return this.authService.hasAdminRole();
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode && this.currentProduct) {
      this.populateEditForm(this.currentProduct);
    }
  }

  populateEditForm(product: Product): void {
    this.editForm.patchValue({
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      hasDiscount: product.hasDiscount,
      discountPercent: product.discountPercent,
      stock: product.stock,
      categoryId: product.category?.id,
      brandId: product.brand?.id
    });
  }

  onSaveProduct(): void {
    if (!this.currentProduct || this.editForm.invalid) {
      this.notificationService.info('Por favor, completa todos los campos requeridos');
      return;
    }

    const updateData: UpdateProductRequest = {
      name: this.editForm.value.name,
      description: this.editForm.value.description,
      shortDescription: this.editForm.value.shortDescription,
      price: this.editForm.value.price,
      hasDiscount: this.editForm.value.hasDiscount,
      discountPercent: this.editForm.value.discountPercent,
      stock: this.editForm.value.stock,
      categoryId: this.editForm.value.categoryId,
      brandId: this.editForm.value.brandId
    };

    this.productService.updateProduct(this.currentProduct.id, updateData).subscribe({
      next: (updatedProduct) => {
        this.notificationService.success('Producto actualizado exitosamente');
        this.currentProduct = updatedProduct;
        this.isEditMode = false;
        // Recargar el producto
        this.product$ = this.productService.getProductById(this.currentProduct.id);
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al actualizar el producto';
        this.notificationService.error(errorMessage);
      }
    });
  }

  onCancelEdit(): void {
    this.isEditMode = false;
    if (this.currentProduct) {
      this.populateEditForm(this.currentProduct);
    }
  }

  onAddToCart(productId: number): void {
    if (!this.currentProduct) {
      this.notificationService.error('Error: Producto no disponible');
      return;
    }

    const quantity = this.addToCartForm.value.quantity;

    if (quantity > this.currentProduct.stock) {
      this.notificationService.error('La cantidad solicitada no está disponible. Por favor, intenta con una cantidad menor.');
      return;
    }

    this.cartService.addToCart(productId, quantity).subscribe({
      next: () => {
        this.notificationService.success('Producto agregado al carrito');
        this.addToCartForm.reset({ quantity: 1 });
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al agregar al carrito';
        this.notificationService.error(errorMessage);
      }
    });
  }
}
