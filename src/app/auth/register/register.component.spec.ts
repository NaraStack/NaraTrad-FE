import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from 'app/core/services/toast.service';
import { of } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  const authServiceMock = {
    register: jasmine.createSpy('register').and.returnValue(of({})),
  };
  const toastMock = {
    showSuccess: jasmine.createSpy('showSuccess'),
    showError: jasmine.createSpy('showError'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        MatSnackBarModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastService, useValue: toastMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    authServiceMock.register.calls.reset();
    toastMock.showSuccess.calls.reset();
    toastMock.showError.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty form initially', () => {
    const form = component.registerForm;
    expect(form.get('fullName')?.value).toBe('');
    expect(form.get('email')?.value).toBe('');
    expect(form.get('password')?.value).toBe('');
    expect(form.get('confirmPassword')?.value).toBe('');
    expect(form.get('rememberMe')?.value).toBeFalse();
    expect(form.valid).toBeFalse();
  });

  it('should call authService.register on submit when form is valid', () => {
    component.registerForm.setValue({
      fullName: 'Test User',
      email: 'test@example.com',
      password: '123456',
      confirmPassword: '123456',
      rememberMe: false,
    });

    fixture.detectChanges();
    expect(component.registerForm.valid).toBeTrue();

    component.onSubmit();

    expect(authServiceMock.register).toHaveBeenCalledWith({
      fullName: 'Test User',
      email: 'test@example.com',
      password: '123456',
    });
    expect(toastMock.showSuccess).toHaveBeenCalled();
  });

  it('should not call authService.register when form is invalid', () => {
    component.registerForm.setValue({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
    });

    fixture.detectChanges();
    expect(component.registerForm.invalid).toBeTrue();

    component.onSubmit();

    expect(authServiceMock.register).not.toHaveBeenCalled();
  });
});
