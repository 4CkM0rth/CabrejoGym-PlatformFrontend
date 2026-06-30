import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BranchService } from '@core/services/branch.service';
import { NotificationService } from '@core/services/notification.service';
import { Branch, BranchAmenity } from '@core/models';

@Component({
  selector: 'app-amenities-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatListModule, MatProgressBarModule
  ],
  templateUrl: './amenities-dialog.component.html',
  styleUrls: ['./amenities-dialog.component.scss']
})
export class AmenitiesDialogComponent implements OnInit {
  branch: Branch;
  amenities: BranchAmenity[] = [];
  loading = true;
  newName = '';
  newDescription = '';
  saving = false;

  constructor(
    public dialogRef: MatDialogRef<AmenitiesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { branch: Branch },
    private branchService: BranchService,
    private notificationService: NotificationService
  ) {
    this.branch = data.branch;
  }

  ngOnInit(): void {
    this.loadAmenities();
  }

  loadAmenities(): void {
    this.loading = true;
    this.branchService.getAmenities(this.branch.id).subscribe({
      next: (amenities) => { this.amenities = amenities; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  addAmenity(): void {
    if (!this.newName.trim()) return;
    this.saving = true;
    this.branchService.addAmenity(this.branch.id, {
      name: this.newName.trim(),
      description: this.newDescription.trim() || undefined,
      available: true
    }).subscribe({
      next: () => {
        this.newName = '';
        this.newDescription = '';
        this.saving = false;
        this.loadAmenities();
      },
      error: () => { this.saving = false; this.notificationService.error('Error al agregar beneficio'); }
    });
  }

  deleteAmenity(amenity: BranchAmenity): void {
    if (confirm(`¿Eliminar "${amenity.name}"?`)) {
      this.branchService.deleteAmenity(amenity.id).subscribe({
        next: () => this.loadAmenities(),
        error: () => this.notificationService.error('Error al eliminar beneficio')
      });
    }
  }

  close(): void {
    this.dialogRef.close(true);
  }
}
