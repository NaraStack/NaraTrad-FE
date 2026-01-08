import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastComponent } from 'app/shared/components/toast/toast.component';

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
    },
    { validators: this.passwordMatchValidator }
  );

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
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
          this.snackBar.openFromComponent(ToastComponent, {
            data: {
              type: 'success',
              title: 'Account created!',
              message: 'Please login.',
            },
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['toast-panel'],
          });

          // redirect ke login
          this.router.navigate(['/login']);
        },

        error: (err: any) => {
          this.loading = false;
          this.error = err;

          // TOAST ERROR
          this.snackBar.openFromComponent(ToastComponent, {
            data: {
              type: 'error',
              title: 'Email already exists!',
              message: 'Try logging in instead.',
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
