import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
import { LoadingService } from '@core/services/loading.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatProgressBarModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  cartCount$: Observable<number>;
  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private cartService: CartService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {
    this.isLoading$ = loadingService.isLoading$;
    this.cartCount$ = cartService.getTotalItems();
  }

  ngOnInit(): void {
    // Suscribirse a cambios de loading para forzar detección de cambios
    this.isLoading$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
    this.cartService.resetCart();
  }
}
