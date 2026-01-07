import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/auth.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastComponent } from 'app/shared/components/toast/toast.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule, ToastComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  showPassword = false;
  loading = false;
  error: string | null = null;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const { email, password } = this.loginForm.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: (response) => {
        this.loading = false;

        // TOAST SUCCESS
        this.snackBar.openFromComponent(ToastComponent, {
          data: {
            type: 'success',
            title: 'Login successful!',
            message: 'Redirecting to dashboard...',
          },
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['toast-panel'],
        });

        // ambil returnUrl kalau ada
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

        // redirect berdasarkan role
        setTimeout(() => {
          if (response.user.role === Role.ADMIN) {
            this.router.navigateByUrl(returnUrl || '/admin/dashboard');
          } else {
            this.router.navigateByUrl(returnUrl || '/dashboard');
          }
        }, 500);
      },

      error: (err: any) => {
        this.loading = false;

        // TOAST ERROR
        this.snackBar.openFromComponent(ToastComponent, {
          data: {
            type: 'error',
            title: 'Invalid email or password!',
            message: 'Please check your credentials and try again.',
          },
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['toast-panel'],
        });
      },
    });
  }
}
