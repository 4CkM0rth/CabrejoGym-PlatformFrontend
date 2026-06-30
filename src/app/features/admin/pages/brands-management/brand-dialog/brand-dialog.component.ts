import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrandService } from '@core/services/brand.service';
import { NotificationService } from '@core/services/notification.service';
import { Brand } from '@core/models';

@Component({
  selector: 'app-brand-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule
  ],
  templateUrl: './brand-dialog.component.html',
  styleUrls: ['./brand-dialog.component.scss']
})
export class BrandDialogComponent {
  isEdit = false;
  saving = false;
  form = { name: '', description: '', logoUrl: '' };
  private brandId?: number;

  constructor(
    public dialogRef: MatDialogRef<BrandDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { brand?: Brand },
    private brandService: BrandService,
    private notificationService: NotificationService
  ) {
    if (data.brand) {
      this.isEdit = true;
      this.brandId = data.brand.id;
      this.form.name = data.brand.name;
      this.form.description = data.brand.description || '';
      this.form.logoUrl = data.brand.logoUrl || '';
    }
  }

  save(): void {
    this.saving = true;
    const payload = {
      name: this.form.name,
      description: this.form.description || undefined,
      logoUrl: this.form.logoUrl || undefined
    };

    const request = this.isEdit
      ? this.brandService.updateBrand(this.brandId!, payload)
      : this.brandService.createBrand(payload);

    request.subscribe({
      next: () => { this.dialogRef.close(true); },
      error: () => { this.saving = false; this.notificationService.error('Error al guardar la marca'); }
    });
  }
}
