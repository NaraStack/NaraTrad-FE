// toast.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastComponent } from 'app/shared/components/toast/toast.component';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  showSuccess(title: string, message: string, duration = 3000) {
    this.show('success', title, message, duration);
  }

  showError(title: string, message: string, duration = 4000) {
    this.show('error', title, message, duration);
  }

  private show(type: 'success' | 'error', title: string, message: string, duration: number) {
    this.snackBar.openFromComponent(ToastComponent, {
      data: { type, title, message },
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['toast-panel'],
    });
  }
}
