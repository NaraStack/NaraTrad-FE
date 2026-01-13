import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  loading = false;
  error: string | null = null;

  forgotPasswordForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(private fb: FormBuilder, private router: Router) {}

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid || this.loading) {
      return;
    }

    this.loading = true;
    this.error = null;

    const { email } = this.forgotPasswordForm.getRawValue();

    // setTimeout(() => {
    //   console.log('Reset password link sent to:', email);

    //   this.loading = false;
    //   this.router.navigate(['/login']);
    // }, 1500);
  }
}
