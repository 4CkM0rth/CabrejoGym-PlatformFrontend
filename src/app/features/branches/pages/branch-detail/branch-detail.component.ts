import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BranchService } from '@core/services/branch.service';
import { Branch } from '@core/models';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-branch-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDialogModule
  ],
  templateUrl: './branch-detail.component.html',
  styleUrls: ['./branch-detail.component.scss']
})
export class BranchDetailComponent implements OnInit {
  locale = 'es-CO'; // Colombia usa punto como separador de miles
  branch$!: Observable<Branch>;
  lightboxOpen = false;
  currentImage = '';
  currentImageIndex = 0;
  lightboxImages: string[] = [];

  private mapUrlCache = new Map<string, Observable<SafeResourceUrl>>();

  constructor(
    private route: ActivatedRoute,
    private branchService: BranchService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.branch$ = this.route.params.pipe(
      switchMap(params => this.branchService.getBranchById(params['id']))
    );
  }

  openLightbox(imageUrl: string, images: any[]): void {
    this.lightboxImages = images.map(img => img.url);
    this.currentImageIndex = this.lightboxImages.indexOf(imageUrl);
    if (this.currentImageIndex === -1) this.currentImageIndex = 0;
    this.currentImage = this.lightboxImages[this.currentImageIndex];
    this.lightboxOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    this.currentImage = '';
    this.lightboxImages = [];
    document.body.style.overflow = 'auto';
  }

  prevImage(): void {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.lightboxImages.length) % this.lightboxImages.length;
    this.currentImage = this.lightboxImages[this.currentImageIndex];
  }

  nextImage(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.lightboxImages.length;
    this.currentImage = this.lightboxImages[this.currentImageIndex];
  }

  getMapUrl(lat: number, lng: number): Observable<SafeResourceUrl> {
    const key = `${lat},${lng}`;
    if (!this.mapUrlCache.has(key)) {
      const url = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sco!4v1`;
      this.mapUrlCache.set(key, of(this.sanitizer.bypassSecurityTrustResourceUrl(url)));
    }
    return this.mapUrlCache.get(key)!;
  }
}
