import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
import { ThemeService } from '@core/services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  cartCount$: Observable<number>;

  constructor(
    public authService: AuthService,
    private cartService: CartService,
    private router: Router,
    public themeService: ThemeService
  ) {
    this.cartCount$ = cartService.getTotalItems();
  }

  hasAdminRole(): boolean {
    return this.authService.hasAdminRole();
  }

  logout(): void {
    this.authService.logout();
    this.cartService.resetCart();
    this.router.navigate(['/home']);
  }
}
