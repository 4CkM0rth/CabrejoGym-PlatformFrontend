import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '@core/services/user.service';
import { NotificationService } from '@core/services/notification.service';
import { User } from '@core/models';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule
  ],
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent {
  user: User;
  currentUserId: number | null;
  saving = false;
  newPassword = '';
  showPasswordField = false;

  constructor(
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user?: User; currentUserId: number | null },
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    this.currentUserId = data.currentUserId;
    this.user = data.user ? { ...data.user } : {} as User;
  }

  get isSelf(): boolean {
    return this.user.id === this.currentUserId;
  }

  save(): void {
    this.saving = true;
    this.userService.updateUser(this.user.id, this.user).subscribe({
      next: () => {
        if (this.showPasswordField && this.newPassword.trim()) {
          this.userService.resetPassword(this.user.id, this.newPassword).subscribe({
            next: () => { this.dialogRef.close(true); },
            error: () => { this.notificationService.error('Usuario actualizado, pero error al cambiar contraseña'); this.dialogRef.close(true); }
          });
        } else {
          this.dialogRef.close(true);
        }
      },
      error: () => { this.saving = false; this.notificationService.error('Error al actualizar el usuario'); }
    });
  }
}
