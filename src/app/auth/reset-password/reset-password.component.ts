import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  showPassword = false;
  loading = false;
  showConfirmPassword = false;
  submitted = false;

  constructor(private fb: FormBuilder) {
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

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirm = form.get('confirmPassword')?.value;

    return password === confirm ? null : { passwordMismatch: true };
  }

  onSubmit() {
    this.submitted = true;

    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const { newPassword } = this.resetPasswordForm.value;
    console.log('New Password:', newPassword);

    setTimeout(() => {
      this.loading = false;
      alert('Password berhasil direset');
      this.resetPasswordForm.reset();
      this.submitted = false;
    }, 1500);
  }

  isBothFilled(): boolean {
    const { newPassword, confirmPassword } = this.resetPasswordForm.value;
    return !!newPassword && !!confirmPassword;
  }
}
