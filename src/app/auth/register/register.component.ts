import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastComponent } from 'app/shared/components/toast/toast.component';
import { ToastService } from 'app/core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule, ToastComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  error: string | null = null;

  registerForm = this.fb.group(
    {
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      rememberMe: [false],
    },
    { validators: this.passwordMatchValidator }
  );

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private toast: ToastService
  ) {}

  passwordMatchValidator(form: any) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const { fullName, email, password } = this.registerForm.value;

    this.authService
      .register({
        fullName: fullName!,
        email: email!,
        password: password!,
      })
      .subscribe({
        next: () => {
          this.loading = false;

          // TOAST SUCCESS
          this.toast.showSuccess('Account created!', 'Please login.', 4000);

          // redirect ke login
          this.router.navigate(['/login']);
        },

        error: (err: any) => {
          this.loading = false;
          this.error = err;

          // TOAST ERROR
          this.toast.showError('Email already exists!', 'Try logging in instead.', 4000);
        },
      });
  }
}
