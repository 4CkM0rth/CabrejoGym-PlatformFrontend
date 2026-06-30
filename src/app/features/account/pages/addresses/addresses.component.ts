import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AddressService } from '@core/services/address.service';
import { NotificationService } from '@core/services/notification.service';
import { Address, AddressType } from '@core/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.scss']
})
export class AddressesComponent implements OnInit {
  addressForm!: FormGroup;
  addresses: Address[] = [];
  displayedColumns = ['fullName', 'street', 'city', 'type', 'actions'];
  editingId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private notificationService: NotificationService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadAddresses();
  }

  private loadAddresses(): void {
    this.addressService.getUserAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
      },
      error: () => {
        this.addresses = [];
      }
    });
  }

  private initForm(): void {
    this.addressForm = this.fb.group({
      fullName: ['', Validators.required],
      street: ['', Validators.required],
      apartment: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{4,10}(-[0-9]{1,4})?$/)]],
      country: ['Colombia', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      type: ['SHIPPING', Validators.required],
      isDefault: [false]
    });
  }

  saveAddress(): void {
    if (!this.addressForm.valid) {
      this.notificationService.info('Por favor, completa todos los campos requeridos');
      return;
    }

    this.loading = true;
    const address = this.addressForm.value;

    if (this.editingId) {
      this.addressService.updateAddress(this.editingId, address).subscribe({
        next: () => {
          this.notificationService.success('Dirección actualizada correctamente');
          this.resetForm();
          this.loadAddresses();
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.error('Error al actualizar la dirección: ' + (error.error?.message || 'Error desconocido'));
          this.loading = false;
        }
      });
    } else {
      this.addressService.createAddress(address).subscribe({
        next: () => {
          this.notificationService.success('Dirección guardada correctamente');
          this.resetForm();
          this.loadAddresses();
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.error('Error al crear la dirección: ' + (error.error?.message || 'Error desconocido'));
          this.loading = false;
        }
      });
    }
  }

  editAddress(address: Address): void {
    this.editingId = address.id;
    this.addressForm.patchValue(address);
  }

  deleteAddress(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta dirección?')) {
      this.addressService.deleteAddress(id).subscribe({
        next: () => {
          this.notificationService.success('Dirección eliminada correctamente');
          this.loadAddresses();
        },
        error: (error) => {
          this.notificationService.error('Error al eliminar la dirección: ' + (error.error?.message || 'Error desconocido'));
        }
      });
    }
  }

  resetForm(): void {
    this.editingId = null;
    this.addressForm.reset({ 
      type: 'SHIPPING', 
      isDefault: false,
      country: 'Colombia',
      fullName: '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      phone: ''
    });
  }
}
