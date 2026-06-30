import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BranchService } from '@core/services/branch.service';
import { NotificationService } from '@core/services/notification.service';
import { Branch } from '@core/models';

@Component({
  selector: 'app-branch-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './branch-dialog.component.html',
  styleUrls: ['./branch-dialog.component.scss']
})
export class BranchDialogComponent {
  branchForm: FormGroup;
  isEditMode = false;
  loading = false;
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private branchService: BranchService,
    public dialogRef: MatDialogRef<BranchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { branch?: Branch },
    private notificationService: NotificationService
  ) {
    this.isEditMode = !!data?.branch;

    this.branchForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      city: ['', [Validators.required, Validators.maxLength(80)]],
      address: ['', [Validators.required, Validators.maxLength(180)]],
      phone: ['', Validators.maxLength(30)],
      email: ['', [Validators.email, Validators.maxLength(120)]],
      openingHours: ['', Validators.maxLength(255)],
      description: [''],
      capacity: [null, Validators.min(0)],
      areaSqm: [null, Validators.min(0)],
      latitude: [null, [Validators.min(-90), Validators.max(90)]],
      longitude: [null, [Validators.min(-180), Validators.max(180)]],
      imageUrl: ['']
    });

    if (this.isEditMode && data.branch) {
      this.branchForm.patchValue({
        name: data.branch.name,
        city: data.branch.city,
        address: data.branch.address,
        phone: data.branch.phone || '',
        email: data.branch.email || '',
        openingHours: data.branch.openingHours || '',
        description: data.branch.description || '',
        capacity: data.branch.capacity,
        areaSqm: data.branch.areaSqm,
        latitude: data.branch.latitude,
        longitude: data.branch.longitude
      });

      if (data.branch.images && data.branch.images.length > 0) {
        const primary = data.branch.images.find(i => i.isPrimary) || data.branch.images[0];
        this.imagePreview = primary.url;
        this.branchForm.patchValue({ imageUrl: primary.url });
      }
    }
  }

  onSubmit(): void {
    if (this.branchForm.invalid) {
      this.branchForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.branchForm.value;

    // Limpiar valores vacíos (excluir imageUrl del payload del branch)
    const payload: any = {};
    Object.keys(formValue).forEach(key => {
      if (key === 'imageUrl') return;
      const val = formValue[key];
      if (val !== null && val !== '' && val !== undefined) {
        payload[key] = val;
      }
    });

    if (this.isEditMode && this.data.branch) {
      this.branchService.updateBranch(this.data.branch.id, payload).subscribe({
        next: () => this.handleImageAfterSave(this.data.branch!.id),
        error: () => {
          this.loading = false;
          this.notificationService.error('Error al actualizar la sede');
        }
      });
    } else {
      this.branchService.createBranch(payload).subscribe({
        next: (branch) => this.handleImageAfterSave(branch.id),
        error: () => {
          this.loading = false;
          this.notificationService.error('Error al crear la sede');
        }
      });
    }
  }

  private handleImageAfterSave(branchId: number): void {
    if (this.selectedFile) {
      this.branchService.uploadBranchImage(branchId, this.selectedFile).subscribe({
        next: () => { this.loading = false; this.dialogRef.close(true); },
        error: () => {
          this.loading = false;
          this.notificationService.error('Sede guardada, pero hubo un error al subir la imagen');
          this.dialogRef.close(true);
        }
      });
    } else if (this.branchForm.value.imageUrl && this.branchForm.value.imageUrl !== this.getExistingImageUrl()) {
      this.branchService.addBranchImage(branchId, this.branchForm.value.imageUrl).subscribe({
        next: () => { this.loading = false; this.dialogRef.close(true); },
        error: () => {
          this.loading = false;
          this.notificationService.error('Sede guardada, pero hubo un error al agregar la imagen');
          this.dialogRef.close(true);
        }
      });
    } else {
      this.loading = false;
      this.dialogRef.close(true);
    }
  }

  private getExistingImageUrl(): string {
    if (this.data.branch?.images && this.data.branch.images.length > 0) {
      const primary = this.data.branch.images.find(i => i.isPrimary) || this.data.branch.images[0];
      return primary.url;
    }
    return '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
      this.branchForm.patchValue({ imageUrl: '' });
    }
  }

  onImageUrlChange(): void {
    const url = this.branchForm.get('imageUrl')?.value;
    if (url) {
      this.imagePreview = url;
      this.selectedFile = null;
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    this.selectedFile = null;
    this.branchForm.patchValue({ imageUrl: '' });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const field = this.branchForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('email')) return 'Email inválido';
    if (field?.hasError('maxlength')) return `Máximo ${field.errors?.['maxlength'].requiredLength} caracteres`;
    if (field?.hasError('min')) return `El valor mínimo es ${field.errors?.['min'].min}`;
    return '';
  }
}
