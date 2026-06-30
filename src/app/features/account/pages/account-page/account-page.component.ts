import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '@core/services/auth.service';
import { User } from '@core/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatListModule
  ],
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.scss']
})
export class AccountPageComponent implements OnInit {
  currentUser$!: Observable<User | null>;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
  }
}
