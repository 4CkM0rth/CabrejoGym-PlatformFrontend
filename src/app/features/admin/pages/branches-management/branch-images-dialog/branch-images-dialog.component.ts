import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BranchService } from '@core/services/branch.service';
import { NotificationService } from '@core/services/notification.service';
import { Branch, BranchImage } from '@core/models';

@Component({
  selector: 'app-branch-images-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatTooltipModule],
  templateUrl: './branch-images-dialog.component.html',
  styleUrls: ['./branch-images-dialog.component.scss']
})
export class BranchImagesDialogComponent implements OnInit {
  branch: Branch;
  images: BranchImage[] = [];
  loading = false;
  uploading = false;

  constructor(
    private branchService: BranchService,
    public dialogRef: MatDialogRef<BranchImagesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { branch: Branch },
    private notificationService: NotificationService
  ) {
    this.branch = data.branch;
  }

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.loading = true;
    this.branchService.getBranchImages(this.branch.id).subscribe({
      next: (images) => { this.images = images; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.uploading = true;
    this.branchService.uploadBranchImage(this.branch.id, input.files[0]).subscribe({
      next: () => { this.uploading = false; this.loadImages(); },
      error: () => { this.uploading = false; this.notificationService.error('Error al subir imagen'); }
    });
    input.value = '';
  }

  setPrimary(imageId: number): void {
    this.branchService.setBranchPrimaryImage(imageId).subscribe({
      next: () => this.loadImages(),
      error: () => this.notificationService.error('Error al establecer imagen principal')
    });
  }

  deleteImage(imageId: number): void {
    if (!confirm('¿Eliminar esta imagen?')) return;
    this.branchService.deleteBranchImage(imageId).subscribe({
      next: () => this.loadImages(),
      error: () => this.notificationService.error('Error al eliminar imagen')
    });
  }
}
