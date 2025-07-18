// src/app/auth/recuperar-password/recuperar-password.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PasswordResetService, PasswordResetRequest } from '../../services/password-reset/password-reset.service';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recuperar-password.html',
  styleUrl: './recuperar-password.css'
})
export class RecuperarPassword implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  recuperarForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  emailEnviado = false;

  constructor(
    private fb: FormBuilder,
    private passwordResetService: PasswordResetService,
    private router: Router
  ) {
    this.recuperarForm = this.fb.group({
      tipoUsuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Suscribirse a estados del servicio
    this.passwordResetService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);

    this.passwordResetService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.errorMessage = error);

    this.passwordResetService.success$
      .pipe(takeUntil(this.destroy$))
      .subscribe(success => this.successMessage = success);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.recuperarForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formData = this.recuperarForm.value as PasswordResetRequest;

    console.log('🔄 Enviando solicitud de recuperación:', formData);

    this.passwordResetService.requestPasswordReset(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Respuesta del servidor:', response);

          if (response.success) {
            this.emailEnviado = true;
            this.passwordResetService.setSuccess(response.message);

            // Limpiar formulario
            this.recuperarForm.reset();

            // Opcional: redirigir después de unos segundos
            setTimeout(() => {
              this.volverAlLogin();
            }, 5000);
          } else {
            this.passwordResetService.setError(response.message);
          }
        },
        error: (error) => {
          console.error('❌ Error:', error);
          const errorMsg = error.error?.message || 'Error de conexión con el servidor';
          this.passwordResetService.setError(errorMsg);
        }
      });
  }

  volverAlLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  private markFormGroupTouched(): void {
    Object.values(this.recuperarForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  // Métodos de utilidad para el template
  get tipoUsuarioControl() {
    return this.recuperarForm.get('tipoUsuario');
  }

  get emailControl() {
    return this.recuperarForm.get('email');
  }

  clearError(): void {
    this.passwordResetService.clearError();
  }

  clearSuccess(): void {
    this.passwordResetService.clearSuccess();
  }
}
