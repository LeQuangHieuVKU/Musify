import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification-service';

type AuthView = 'login' | 'forgotPassword' | 'signUp';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;
  signUpForm: FormGroup;

  currentView: AuthView = 'login';
  hidePassword = true;
  returnUrl = '/home';

  loginLoading = false;
  loginError = '';

  forgotPasswordLoading = false;
  forgotPasswordSuccess = '';
  forgotPasswordError = '';

  signUpLoading = false;
  signUpSuccess = '';
  signUpError = '';

  get isLoginView(): boolean {
    return this.currentView === 'login';
  }

  get isForgotPasswordView(): boolean {
    return this.currentView === 'forgotPassword';
  }

  get isSignUpView(): boolean {
    return this.currentView === 'signUp';
  }

  get pageTitle(): string {
    switch (this.currentView) {
      case 'forgotPassword':
        return 'Reset Password';
      case 'signUp':
        return 'Sign Up For Musify';
      default:
        return 'Login to Musify';
    }
  }

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.signUpForm = this.formBuilder.group({
      name: ['', Validators.required, Validators.minLength(2)],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
      return;
    }

    const savedView = localStorage.getItem('authViewState') as AuthView;
    if (savedView && ['login', 'forgotPassword', 'signUp'].includes(savedView)) {
      this.currentView = savedView;
    }

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  private getErrorMessage(error: any, defaultMessage: string): string {
    if (error.status === 0) {
      return 'Unable to connect to the server. Please try again later.';
    }
    if (error.error?.message) {
      return error.error.message;
    }
    return defaultMessage;
  }

  private clearAllMessages(): void {
    this.loginError = '';
    this.forgotPasswordError = '';
    this.forgotPasswordSuccess = '';
    this.signUpError = '';
    this.signUpSuccess = '';
  }

  onForgotPasswordSubmit() {
    this.forgotPasswordLoading = true;
    this.forgotPasswordError = '';
    this.forgotPasswordSuccess = '';

    const email = this.forgotPasswordForm.get('email')?.value.email;

    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.forgotPasswordLoading = false;
        this.forgotPasswordSuccess = response.message;
        this.notificationService.success(response.message);

        setTimeout(() => this.showLoginView(), 3000);
      },
      error: (error) => {
        this.forgotPasswordLoading = false;
        this.forgotPasswordError = this.getErrorMessage(
          error,
          'Failed to send reset email. Please try again.',
        );
        this.notificationService.error(this.forgotPasswordError);
      },
    });
  }

  showLoginView(): void {
    this.currentView = 'login';
    localStorage.removeItem('authViewState');
    this.clearAllMessages();
  }

  onLoginSubmit() {
    this.loginLoading = true;
    this.loginError = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.loginLoading = false;
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.loginLoading = false;
        this.loginError = this.getErrorMessage(error, 'Login Failed. Please Try Again.');
        this.notificationService.error(error.message || 'Login Failed. Please Try Again.');
      },
    });
  }

  showSignUpView() {
    this.currentView = 'signUp';
    this.clearAllMessages();
    localStorage.setItem('authViewState', 'signUp');

    const loginEmail = this.loginForm.get('email')?.value;
    if (loginEmail) {
      this.signUpForm.patchValue({ email: loginEmail });
    }
  }

  showForgotPasswordView() {
    this.currentView = 'forgotPassword';
    this.clearAllMessages();
    localStorage.setItem('authViewState', 'forgotPassword');

    const loginEmail = this.loginForm.get('email')?.value;
    if (loginEmail) {
      this.forgotPasswordForm.patchValue({ email: loginEmail });
    }
  }

  onSignUpSubmit() {
    this.signUpLoading = true;
    this.signUpError = '';
    this.signUpSuccess = '';

    const {email, name} = this.signUpForm.value;

    this.authService.signUp({ email, name }).subscribe({
      next: (response) => {
        this.loginLoading = false;
        this.signUpSuccess = response.message;
        this.notificationService.success(response.message);

        setTimeout(() => this.showLoginView(), 3000);
      },
      error: (error) => {
        this.signUpLoading = false;
        this.signUpError = this.getErrorMessage(error, 'Failed to creare Account. Please try again.');
        this.notificationService.error(error.message || 'Failed to create Account. Please try again.');
      },
    });
  }
}
