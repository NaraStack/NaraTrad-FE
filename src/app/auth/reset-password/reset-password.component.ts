import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  resetPasswordForm: FormGroup;
  showPassword = false;
  loading = false;
  showConfirmPassword = false;
  submitted = false;
  token: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toast: ToastService
  ) {
    this.resetPasswordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  ngOnInit() {
    // Get token from query parameter
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.toast.showError(
        'Invalid or missing token',
        'Please use the reset link from your email.',
        4000
      );
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirm = form.get('confirmPassword')?.value;

    return password === confirm ? null : { passwordMismatch: true };
  }

  onSubmit() {
    this.submitted = true;

    if (this.resetPasswordForm.invalid || !this.token) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const { newPassword } = this.resetPasswordForm.value;

    this.authService.resetPassword(this.token, newPassword)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.toast.showSuccess(
            'Password reset successful!',
            'Redirecting to login...',
            3000
          );
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
          this.loading = false;
          this.toast.showError(
            'Failed to reset password',
            'Please try again or request a new reset link.',
            4000
          );
        },
      });
  }

  isBothFilled(): boolean {
    const { newPassword, confirmPassword } = this.resetPasswordForm.value;
    return !!newPassword && !!confirmPassword;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}