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
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { User } from '@core/models';
import { UserDialogComponent } from './user-dialog/user-dialog.component';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatIconModule, MatTooltipModule,
    MatProgressBarModule, MatDialogModule
  ],
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.scss']
})
export class UsersManagementComponent implements OnInit {
  loading = true;
  users: User[] = [];
  filteredUsers: User[] = [];
  currentUserId: number | null = null;

  searchTerm = '';
  roleFilter = '';
  statusFilter = '';

  displayedColumns = ['name', 'email', 'role', 'status', 'actions'];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const current = this.authService.getCurrentUser();
    this.currentUserId = current?.id ?? null;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.userService.getAllUsers(0, 100).subscribe({
      next: (response) => {
        this.users = response.content;
        this.filteredUsers = [...this.users];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = !this.roleFilter || user.role === this.roleFilter;
      let matchesStatus = true;
      if (this.statusFilter === 'active') matchesStatus = user.isActive;
      else if (this.statusFilter === 'inactive') matchesStatus = !user.isActive;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  openUserDialog(user?: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '540px',
      maxHeight: '90vh',
      data: { user, currentUserId: this.currentUserId }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  editUser(user: User): void {
    this.openUserDialog(user);
  }

  toggleRole(user: User): void {
    if (user.id === this.currentUserId) {
      this.notificationService.info('No puedes cambiar tu propio rol');
      return;
    }
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (confirm(`¿Cambiar rol de ${user.firstName} a ${newRole}?`)) {
      this.userService.changeRole(user.id, newRole).subscribe({
        next: () => { user.role = newRole; },
        error: () => { this.notificationService.error('Error al cambiar el rol'); }
      });
    }
  }

  deleteUser(user: User): void {
    if (user.id === this.currentUserId) {
      this.notificationService.info('No puedes eliminar tu propia cuenta');
      return;
    }
    if (confirm(`¿Estás seguro de eliminar a "${user.firstName} ${user.lastName}"?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.notificationService.success('Usuario eliminado correctamente');
          this.loadData();
        },
        error: () => { this.notificationService.error('Error al eliminar el usuario'); }
      });
    }
  }

  getRoleBadgeClass(role: string): string {
    return role === 'ADMIN' ? 'role-admin' : 'role-user';
  }
}
