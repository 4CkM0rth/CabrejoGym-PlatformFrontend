import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrandService } from '@core/services/brand.service';
import { NotificationService } from '@core/services/notification.service';
import { Brand } from '@core/models';
import { BrandDialogComponent } from './brand-dialog/brand-dialog.component';

@Component({
  selector: 'app-brands-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatIconModule, MatTooltipModule,
    MatProgressBarModule, MatDialogModule
  ],
  templateUrl: './brands-management.component.html',
  styleUrls: ['./brands-management.component.scss']
})
export class BrandsManagementComponent implements OnInit {
  loading = true;
  brands: Brand[] = [];
  filteredBrands: Brand[] = [];
  searchTerm = '';
  displayedColumns = ['logo', 'name', 'description', 'active', 'actions'];

  constructor(
    private brandService: BrandService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.brandService.getAllBrands().subscribe({
      next: (brands) => {
        this.brands = brands;
        this.filteredBrands = [...this.brands];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    this.filteredBrands = this.brands.filter(brand => {
      return !this.searchTerm ||
        brand.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (brand.description || '').toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  openBrandDialog(brand?: Brand): void {
    const dialogRef = this.dialog.open(BrandDialogComponent, {
      width: '540px',
      maxHeight: '90vh',
      data: { brand }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  editBrand(brand: Brand): void {
    this.openBrandDialog(brand);
  }

  toggleBrandStatus(brand: Brand): void {
    this.brandService.updateBrand(brand.id, { active: !brand.active }).subscribe({
      next: () => { brand.active = !brand.active; },
      error: () => { this.notificationService.error('Error al cambiar el estado de la marca'); }
    });
  }

  deleteBrand(brand: Brand): void {
    if (confirm(`¿Estás seguro de eliminar la marca "${brand.name}"?`)) {
      this.brandService.deleteBrand(brand.id).subscribe({
        next: () => {
          this.notificationService.success('Marca eliminada correctamente');
          this.loadData();
        },
        error: () => { this.notificationService.error('Error al eliminar la marca'); }
      });
    }
  }
}
