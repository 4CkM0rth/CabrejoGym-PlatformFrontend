import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ProductService, CreateProductRequest, UpdateProductRequest } from '@core/services/product.service';
import { NotificationService } from '@core/services/notification.service';
import { Product, Category, Brand } from '@core/models';

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule
  ],
  templateUrl: './product-dialog.component.html',
  styleUrls: ['./product-dialog.component.scss']
})
export class ProductDialogComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  brands: Brand[] = [];
  isEditMode = false;
  loading = false;
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    public dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product?: Product },
    private notificationService: NotificationService
  ) {
    this.isEditMode = !!data?.product;
    
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      shortDescription: [''],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', Validators.required],
      brandId: [''],
      hasDiscount: [false],
      discountPercent: [0, [Validators.min(0), Validators.max(100)]],
      hasVariants: [false],
      imageUrl: ['']
    });

    // Si es modo edición, cargar datos del producto
    if (this.isEditMode && data.product) {
      this.loadProductData(data.product);
    }
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
  }

  loadProductData(product: Product): void {
    this.productForm.patchValue({
      name: product.name,
      shortDescription: product.shortDescription || '',
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.category?.id || '',
      brandId: product.brand?.id || '',
      hasDiscount: product.hasDiscount,
      discountPercent: product.discountPercent,
      hasVariants: product.hasVariants,
      imageUrl: product.images && product.images.length > 0 ? product.images[0].url : ''
    });

    // Cargar preview de imagen existente
    if (product.images && product.images.length > 0) {
      this.imagePreview = product.images[0].url;
    }
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      }
    });
  }

  loadBrands(): void {
    this.productService.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands;
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.productForm.value;

    if (this.isEditMode && this.data.product) {
      // Actualizar producto existente
      const updateData: UpdateProductRequest = {
        name: formValue.name,
        shortDescription: formValue.shortDescription,
        description: formValue.description,
        price: formValue.price,
        stock: formValue.stock,
        categoryId: formValue.categoryId,
        brandId: formValue.brandId || undefined,
        hasDiscount: formValue.hasDiscount,
        discountPercent: formValue.discountPercent,
        hasVariants: formValue.hasVariants
      };

      this.productService.updateProduct(this.data.product.id, updateData).subscribe({
        next: (product) => {
          // Si hay imagen nueva, subirla
          if (this.selectedFile) {
            this.uploadProductImage(product.id);
          } else if (formValue.imageUrl && formValue.imageUrl !== this.data.product?.images?.[0]?.url) {
            this.addProductImageUrl(product.id, formValue.imageUrl);
          } else {
            this.loading = false;
            this.dialogRef.close(product);
          }
        },
        error: () => {
          this.loading = false;
          this.notificationService.error('Error al actualizar el producto');
        }
      });
    } else {
      // Crear nuevo producto
      const createData: CreateProductRequest = {
        name: formValue.name,
        shortDescription: formValue.shortDescription,
        description: formValue.description,
        price: formValue.price,
        stock: formValue.stock,
        categoryId: formValue.categoryId,
        brandId: formValue.brandId || undefined,
        hasDiscount: formValue.hasDiscount,
        discountPercent: formValue.discountPercent,
        hasVariants: formValue.hasVariants
      };

      this.productService.createProduct(createData).subscribe({
        next: (product) => {
          // Si hay imagen, subirla
          if (this.selectedFile) {
            this.uploadProductImage(product.id);
          } else if (formValue.imageUrl) {
            this.addProductImageUrl(product.id, formValue.imageUrl);
          } else {
            this.loading = false;
            this.dialogRef.close(product);
          }
        },
        error: () => {
          this.loading = false;
          this.notificationService.error('Error al crear el producto');
        }
      });
    }
  }

  private uploadProductImage(productId: number): void {
    if (!this.selectedFile) {
      this.loading = false;
      this.dialogRef.close(true);
      return;
    }

    this.productService.uploadProductImage(productId, this.selectedFile).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Producto guardado, pero hubo un error al subir la imagen');
        this.dialogRef.close(true);
      }
    });
  }

  private addProductImageUrl(productId: number, imageUrl: string): void {
    this.productService.addProductImage(productId, imageUrl).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Producto guardado, pero hubo un error al agregar la imagen');
        this.dialogRef.close(true);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
      
      // Limpiar URL si se selecciona archivo
      this.productForm.patchValue({ imageUrl: '' });
    }
  }

  onImageUrlChange(): void {
    const url = this.productForm.get('imageUrl')?.value;
    if (url) {
      this.imagePreview = url;
      this.selectedFile = null;
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    this.selectedFile = null;
    this.productForm.patchValue({ imageUrl: '' });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (field?.hasError('min')) {
      return `El valor mínimo es ${field.errors?.['min'].min}`;
    }
    if (field?.hasError('max')) {
      return `El valor máximo es ${field.errors?.['max'].max}`;
    }
    return '';
  }
}
