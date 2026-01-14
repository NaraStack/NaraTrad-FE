import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/auth.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastComponent } from 'app/shared/components/toast/toast.component';
import { ToastService } from 'app/core/services/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule, ToastComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
  showPassword = false;
  loading = false;
  error: string | null = null;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private toast: ToastService
  ) {}

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const { email, password } = this.loginForm.value;

    this.authService.login({ email: email!, password: password! })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;

          // TOAST SUCCESS
          this.toast.showSuccess('Login successful!', 'Redirecting to dashboard...', 3000);

          // ambil returnUrl kalau ada
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

          // Add small delay to ensure token and user are properly set
          setTimeout(() => {
            // redirect berdasarkan role
            if (response.user.role === Role.ADMIN) {
              this.router.navigateByUrl(returnUrl || '/admin/dashboard');
            } else {
              this.router.navigateByUrl(returnUrl || '/dashboard');
            }
          }, 100);
        },

        error: (err: any) => {
          this.loading = false;

          // TOAST ERROR
          this.toast.showError(
            'Invalid email or password!',
            'Please check your credentials and try again.',
            4000
          );
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}