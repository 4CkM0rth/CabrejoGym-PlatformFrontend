import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

const DEFAULT_DURATION_MS = 4000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string): void {
    this.show(message, 'success-snackbar');
  }

  error(message: string): void {
    this.show(message, 'error-snackbar', DEFAULT_DURATION_MS * 1.5);
  }

  info(message: string): void {
    this.show(message, 'info-snackbar');
  }

  confirm(message: string): boolean {
    return window.confirm(message);
  }

  private show(message: string, panelClass: string, duration = DEFAULT_DURATION_MS): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
