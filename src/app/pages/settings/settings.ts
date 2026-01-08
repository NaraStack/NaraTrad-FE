import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { UserResponse } from '../../core/models/auth.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule, ToastComponent],
})
export class Settings implements OnInit {
  profileLoading = false;
  passwordLoading = false;
  showOldPassword = false;
  showNewPassword = false;
  userProfile: UserResponse | null = null;

  profileForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
  });

  passwordForm = this.fb.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.profileForm.patchValue({
          fullName: profile.fullName,
          email: profile.email,
        });
      },
      error: (err) => {
        this.showToast('error', 'Error', 'Gagal memuat profil');
      },
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.profileLoading = true;
    const { fullName, email } = this.profileForm.value;

    this.profileService
      .updateProfile({
        fullName: fullName!,
        email: email!,
      })
      .subscribe({
        next: (updatedProfile) => {
          this.profileLoading = false;
          this.userProfile = updatedProfile;

          // Update current user in auth service
          const currentUser = this.authService.getCurrentUserValue();
          if (currentUser) {
            currentUser.fullName = updatedProfile.fullName;
            currentUser.email = updatedProfile.email;
          }

          this.showToast('success', 'Success!', 'Profil berhasil diperbarui');
        },
        error: (err) => {
          this.profileLoading = false;
          this.showToast('error', 'Error!', err || 'Gagal memperbarui profil');
        },
      });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.passwordLoading = true;
    const { oldPassword, newPassword } = this.passwordForm.value;

    this.profileService
      .changePassword({
        oldPassword: oldPassword!,
        newPassword: newPassword!,
      })
      .subscribe({
        next: () => {
          this.passwordLoading = false;
          this.passwordForm.reset();
          this.showToast('success', 'Success!', 'Password berhasil diubah');
        },
        error: (err) => {
          this.passwordLoading = false;
          this.showToast('error', 'Error!', err || 'Gagal mengubah password');
        },
      });
  }

  private showToast(type: 'success' | 'error', title: string, message: string): void {
    this.snackBar.openFromComponent(ToastComponent, {
      data: { type, title, message },
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['toast-panel'],
    });
  }

  get userName(): string {
    return this.authService.getCurrentUserValue()?.fullName || 'User';
  }
}