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
import { BranchService } from '@core/services/branch.service';
import { NotificationService } from '@core/services/notification.service';
import { Branch } from '@core/models';
import { BranchDialogComponent } from './branch-dialog/branch-dialog.component';
import { BranchImagesDialogComponent } from './branch-images-dialog/branch-images-dialog.component';
import { AmenitiesDialogComponent } from './amenities-dialog/amenities-dialog.component';
import { MembershipsDialogComponent } from './memberships-dialog/memberships-dialog.component';

@Component({
  selector: 'app-branches-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatDialogModule
  ],
  templateUrl: './branches-management.component.html',
  styleUrls: ['./branches-management.component.scss']
})
export class BranchesManagementComponent implements OnInit {
  loading = true;
  branches: Branch[] = [];
  filteredBranches: Branch[] = [];

  // Filtros
  searchTerm = '';
  cityFilter = '';
  statusFilter = '';

  cities: string[] = [];

  displayedColumns = ['name', 'city', 'phone', 'email', 'capacity', 'active', 'actions'];

  constructor(
    private branchService: BranchService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    // Intentar endpoint admin; si falla (403), usar endpoint público
    this.branchService.getAllBranches().subscribe({
      next: (branches) => this.setBranches(branches),
      error: () => {
        this.branchService.getBranches().subscribe({
          next: (branches) => this.setBranches(branches),
          error: () => { this.loading = false; }
        });
      }
    });
  }

  private setBranches(branches: Branch[]): void {
    this.branches = branches;
    this.filteredBranches = [...this.branches];
    this.cities = [...new Set(branches.map(b => b.city).filter(Boolean))];
    this.loading = false;
  }

  applyFilters(): void {
    this.filteredBranches = this.branches.filter(branch => {
      const matchesSearch = !this.searchTerm ||
        branch.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        branch.address.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCity = !this.cityFilter || branch.city === this.cityFilter;

      let matchesStatus = true;
      if (this.statusFilter === 'active') matchesStatus = branch.active;
      else if (this.statusFilter === 'inactive') matchesStatus = !branch.active;

      return matchesSearch && matchesCity && matchesStatus;
    });
  }

  openBranchDialog(branch?: Branch): void {
    const dialogRef = this.dialog.open(BranchDialogComponent, {
      width: '640px',
      maxHeight: '90vh',
      data: { branch }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  editBranch(branch: Branch): void {
    this.openBranchDialog(branch);
  }

  toggleBranchStatus(branch: Branch): void {
    const action = branch.active
      ? this.branchService.deactivateBranch(branch.id)
      : this.branchService.activateBranch(branch.id);

    action.subscribe({
      next: () => {
        branch.active = !branch.active;
      },
      error: () => {
        this.notificationService.error('Error al cambiar el estado de la sede');
      }
    });
  }

  manageImages(branch: Branch): void {
    const dialogRef = this.dialog.open(BranchImagesDialogComponent, {
      width: '600px',
      data: { branch }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  manageAmenities(branch: Branch): void {
    const dialogRef = this.dialog.open(AmenitiesDialogComponent, {
      width: '560px',
      maxHeight: '90vh',
      data: { branch }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  manageMemberships(branch: Branch): void {
    const dialogRef = this.dialog.open(MembershipsDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: { branch }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }
}
