// src/app/auth/cambiar-password/cambiar-password.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PasswordResetService, ResetPasswordRequest } from '../../services/password-reset/password-reset.service';

@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cambiar-password.html',
  styleUrl: './cambiar-password.css'
})
export class CambiarPassword implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  cambiarPasswordForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Estados del token
  tokenValidado = false;
  tokenInvalido = false;
  validandoToken = true;

  // Información del token
  email: string = '';
  tipoUsuario: string = '';
  token: string = '';

  // Control de contraseñas
  showPassword = false;
  showConfirmPassword = false;
  passwordChanged = false;

  constructor(
    private fb: FormBuilder,
    private passwordResetService: PasswordResetService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.cambiarPasswordForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Obtener token de la URL
    this.token = this.route.snapshot.queryParams['token'];

    if (!this.token) {
      this.tokenInvalido = true;
      this.validandoToken = false;
      this.errorMessage = 'Token de recuperación no encontrado en la URL';
      return;
    }

    // Validar token
    this.validarToken();

    // // Suscribirse a estados del servicio
    // this.passwordResetService.loading$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(loading => this.isLoading = loading);

    // this.passwordResetService.error$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(error => this.errorMessage = error);

    // this.passwordResetService.success$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(success => this.successMessage = success);
    // 🔧 CORREGIDO: Mejor manejo de suscripciones
  this.passwordResetService.loading$
    .pipe(takeUntil(this.destroy$))
    .subscribe(loading => {
      console.log('🔄 Loading state changed:', loading);
      this.isLoading = loading;
    });

  this.passwordResetService.error$
    .pipe(takeUntil(this.destroy$))
    .subscribe(error => {
      console.log('❌ Error state changed:', error);
      this.errorMessage = error;
    });

  this.passwordResetService.success$
    .pipe(takeUntil(this.destroy$))
    .subscribe(success => {
      console.log('  Success state changed:', success);
      this.successMessage = success;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private validarToken(): void {
    console.log('  Validando token:', this.token);

    this.passwordResetService.validateToken(this.token)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('  Token válido:', response);

          if (response.success && response.data) {
            this.tokenValidado = true;
            this.email = response.data.email;
            this.tipoUsuario = response.data.tipoUsuario;
            this.validandoToken = false;

            console.log('📧 Email:', this.email);
            console.log('👤 Tipo usuario:', this.tipoUsuario);
          } else {
            this.tokenInvalido = true;
            this.validandoToken = false;
            this.errorMessage = response.message || 'Token inválido';
          }
        },
        error: (error) => {
          console.error('❌ Error validando token:', error);
          this.tokenInvalido = true;
          this.validandoToken = false;
          this.errorMessage = error.error?.message || 'Token inválido o expirado';
        }
      });
  }

  onSubmit(): void {
    if (this.cambiarPasswordForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const { newPassword } = this.cambiarPasswordForm.value;

    const resetData: ResetPasswordRequest = {
      token: this.token,
      newPassword: newPassword
    };

    console.log('🔄 Cambiando contraseña...');

    this.passwordResetService.resetPassword(resetData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('  Respuesta del servidor:', response);

          if (response.success) {
            this.passwordChanged = true;
            this.passwordResetService.setSuccess(response.message);

            // Limpiar formulario
            this.cambiarPasswordForm.reset();

            // Redirigir al login después de 3 segundos
            setTimeout(() => {
              this.router.navigate(['/login'], {
                queryParams: { passwordChanged: 'true' }
              });
            }, 3000);
          } else {
            this.passwordResetService.setError(response.message);
          }
        },
        error: (error) => {
          console.error('❌ Error:', error);
          const errorMsg = error.error?.message || 'Error al cambiar contraseña';
          this.passwordResetService.setError(errorMsg);
        }
      });
  }

  // Validadores personalizados
  private passwordStrengthValidator(control: AbstractControl): {[key: string]: any} | null {
    const value = control.value;
    if (!value) return null;

    const hasNumber = /[0-9]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const valid = hasNumber && (hasLower || hasUpper);

    if (!valid) {
      return { 'passwordStrength': true };
    }

    return null;
  }

  private passwordMatchValidator(group: AbstractControl): {[key: string]: any} | null {
    const password = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { 'passwordMismatch': true };
  }

  private markFormGroupTouched(): void {
    Object.values(this.cambiarPasswordForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  // Métodos de utilidad para el template
  get newPasswordControl() {
    return this.cambiarPasswordForm.get('newPassword');
  }

  get confirmPasswordControl() {
    return this.cambiarPasswordForm.get('confirmPassword');
  }

  get passwordsMatch(): boolean {
    const password = this.newPasswordControl?.value;
    const confirmPassword = this.confirmPasswordControl?.value;
    return password && confirmPassword && password === confirmPassword;
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  clearError(): void {
    this.passwordResetService.clearError();
  }

  clearSuccess(): void {
    this.passwordResetService.clearSuccess();
  }

  volverAlLogin(): void {
    this.router.navigate(['/login']);
  }

  solicitarNuevoToken(): void {
    this.router.navigate(['/recuperar-password']);
  }

  // Agregar este método en la clase CambiarPassword
hasLetterAndNumber(value: string): boolean {
  if (!value) return false;
  return /^(?=.*[a-zA-Z])(?=.*\d)/.test(value);
}

}
