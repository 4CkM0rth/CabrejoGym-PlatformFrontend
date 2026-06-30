import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ProductService } from '@core/services/product.service';
import { NotificationService } from '@core/services/notification.service';
import { Product, ProductVariant } from '@core/models';

@Component({
  selector: 'app-variants-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSlideToggleModule
  ],
  templateUrl: './variants-dialog.component.html',
  styleUrls: ['./variants-dialog.component.scss']
})
export class VariantsDialogComponent implements OnInit {
  product: Product;
  variants: ProductVariant[] = [];
  loading = false;
  showForm = false;
  editingId: number | null = null;
  variantForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    public dialogRef: MatDialogRef<VariantsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: Product },
    private notificationService: NotificationService
  ) {
    this.product = data.product;
    this.variantForm = this.fb.group({
      variantName: ['', Validators.required],
      sku: [''],
      flavor: [''], size: [''], color: [''], weight: [''],
      priceAdjustment: [0],
      stock: [0, [Validators.required, Validators.min(0)]],
      active: [true]
    });
  }

  ngOnInit(): void { this.loadVariants(); }

  loadVariants(): void {
    this.loading = true;
    this.productService.getVariants(this.product.id).subscribe({
      next: (v) => { this.variants = v; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openForm(variant?: ProductVariant): void {
    this.showForm = true;
    this.editingId = variant?.id || null;
    if (variant) {
      this.variantForm.patchValue(variant);
    } else {
      this.variantForm.reset({ priceAdjustment: 0, stock: 0, active: true });
    }
  }

  cancelForm(): void { this.showForm = false; this.editingId = null; }

  saveVariant(): void {
    if (this.variantForm.invalid) return;
    const data = this.variantForm.value;

    if (this.editingId) {
      this.productService.updateVariant(this.editingId, data).subscribe({
        next: () => { this.showForm = false; this.editingId = null; this.loadVariants(); },
        error: () => this.notificationService.error('Error al actualizar variante')
      });
    } else {
      this.productService.createVariant(this.product.id, data).subscribe({
        next: () => { this.showForm = false; this.loadVariants(); },
        error: () => this.notificationService.error('Error al crear variante')
      });
    }
  }

  deleteVariant(id: number): void {
    if (!confirm('¿Eliminar esta variante?')) return;
    this.productService.deleteVariant(id).subscribe({
      next: () => this.loadVariants(),
      error: () => this.notificationService.error('Error al eliminar variante')
    });
  }
}
