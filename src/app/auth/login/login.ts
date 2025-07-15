// src/app/auth/login/login.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">

        <!-- Header -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">
            Hospital General
          </h2>
          <p class="text-gray-600">San Luis de la Paz, Guanajuato</p>
          <div class="mt-4 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded"></div>
        </div>

        <!-- Formulario -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">

          <!-- Tipo de Usuario -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Usuario
            </label>
            <select formControlName="tipoUsuario"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccione...</option>
              <option value="medico">Médico</option>
              <option value="administrador">Administrador</option>
            </select>
            <div *ngIf="loginForm.get('tipoUsuario')?.errors?.['required'] && loginForm.get('tipoUsuario')?.touched"
                 class="text-red-500 text-sm mt-1">
              Seleccione el tipo de usuario
            </div>
          </div>

          <!-- Usuario -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Usuario
            </label>
            <input type="text"
                   formControlName="usuario"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="Ingrese su usuario">
            <div *ngIf="loginForm.get('usuario')?.errors?.['required'] && loginForm.get('usuario')?.touched"
                 class="text-red-500 text-sm mt-1">
              Usuario es obligatorio
            </div>
          </div>

          <!-- Contraseña -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input type="password"
                   formControlName="password"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="Ingrese su contraseña">
            <div *ngIf="loginForm.get('password')?.errors?.['required'] && loginForm.get('password')?.touched"
                 class="text-red-500 text-sm mt-1">
              Contraseña es obligatoria
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            {{ errorMessage }}
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <i class="fas fa-check-circle mr-2"></i>
            {{ successMessage }}
          </div>

          <!-- Botón Login -->
          <button type="submit"
                  [disabled]="loginForm.invalid || isLoading"
                  class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-md transition-colors">
            <i *ngIf="isLoading" class="fas fa-spinner fa-spin mr-2"></i>
            <i *ngIf="!isLoading" class="fas fa-sign-in-alt mr-2"></i>
            {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>

        </form>

        <!-- Usuarios de prueba -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-sm font-medium text-gray-700 mb-2">Usuarios de Prueba:</h3>
          <div class="text-xs text-gray-600 space-y-1">
            <div><strong>Médico:</strong> dr.garcia / 123456</div>
            <div><strong>Admin:</strong> admin.direccion / admin123</div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class Login implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  private returnUrl: string = '/app/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      tipoUsuario: ['', Validators.required],
      usuario: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Si ya está logueado, redirigir al dashboard
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/app/dashboard']);
      return;
    }

    // Obtener URL de retorno
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/app/dashboard';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const credentials: LoginRequest = {
      usuario: this.loginForm.value.usuario,
      password: this.loginForm.value.password,
      tipoUsuario: this.loginForm.value.tipoUsuario
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = `¡Bienvenido ${response.data.usuario.nombre_completo}!`;

          setTimeout(() => {
            this.router.navigate([this.returnUrl]);
          }, 1500);
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.errorMessage = error.error?.message || 'Error de conexión con el servidor';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
