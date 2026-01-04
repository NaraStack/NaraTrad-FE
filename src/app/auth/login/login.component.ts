import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    // simulasi login
    // setTimeout(() => {
    //   const { email, password } = this.loginForm.value;

    //   if (email !== 'admin@test.com' || password !== 'password123') {
    //     this.error = 'Email or password is incorrect';
    //     this.loading = false;
    //     return;
    //   }

    //   this.authService.login('dummy-token');
    //   this.loading = false;
    //   this.router.navigate(['/dashboard']);
    // }, 800);
  }
}
