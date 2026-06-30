import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
import { LoginRequest } from '@core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  private returnUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  private initForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (!this.loginForm.valid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const request: LoginRequest = this.loginForm.value;
    this.authService.login(request).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.cartService.reloadCart();
          this.isLoading = false;
          this.router.navigateByUrl(this.returnUrl);
        }, 200);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error al iniciar sesión. Intenta de nuevo.';
      }
    });
  }
}
