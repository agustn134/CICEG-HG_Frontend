// src/app/auth/login/login.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

interface MedicalImage {
  id: string;
  url: string;
  alt: string;
  photographer: string;
  photographer_url: string;
}

interface MedicalFact {
  title: string;
  description: string;
  icon: string;
  source: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-hospital-gray-50 flex flex-col">
      <!-- Header profesional -->
      <header class="bg-white shadow-sm border-b border-hospital-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center space-x-3">
              <div
                class="h-12 w-12 bg-hospital-primary rounded-lg flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <div>
                <h1 class="text-xl font-bold text-hospital-gray-900">
                  SICEG-HG
                </h1>
                <p class="text-xs text-hospital-gray-500">
                  Sistema Integral de Expedientes Clínicos
                </p>
              </div>
            </div>
            <div class="text-right hidden sm:block">
              <p class="text-sm text-hospital-gray-600 font-medium">
                Hospital General
              </p>
              <p class="text-xs text-hospital-gray-500">
                San Luis de la Paz, Gto.
              </p>
            </div>
          </div>
        </div>
      </header>

      <!-- Contenido principal -->
      <main class="flex-1 flex flex-col lg:flex-row">
        <!-- Panel izquierdo - Imagen médica -->
        <div
          class="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-hospital-primary-dark to-hospital-primary overflow-hidden"
        >
          <!-- Imagen médica -->
          <div class="absolute inset-0">
            <img
              *ngIf="currentImage"
              [src]="currentImage.url"
              [alt]="currentImage.alt"
              class="w-full h-full object-cover opacity-90"
              (error)="onImageError()"
            />
            <div
              *ngIf="!currentImage"
              class="w-full h-full bg-gradient-to-br from-hospital-primary to-hospital-primary-dark flex items-center justify-center"
            >
              <div class="text-center text-white p-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-16 w-16 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <h3 class="text-2xl font-bold mb-2">Bienvenido al Sistema</h3>
                <p class="text-hospital-primary-light">
                  Acceso seguro al expediente clínico
                </p>
              </div>
            </div>
          </div>

          <!-- Overlay de gradiente -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-hospital-gray-900/70 via-transparent to-transparent"
          ></div>

          <!-- Contenido inferior -->
          <div class="absolute bottom-0 left-0 right-0 p-6">
            <!-- Dato médico -->
            <div
              class="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-4 transition-all duration-300 hover:shadow-xl"
            >
              <div class="flex items-start">
                <div
                  class="flex-shrink-0 bg-hospital-primary/10 p-3 rounded-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 text-hospital-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-semibold text-hospital-gray-900 mb-1">
                    {{ currentFact.title }}
                  </h3>
                  <p class="text-sm text-hospital-gray-600">
                    {{ currentFact.description }}
                  </p>
                  <p class="text-xs text-hospital-gray-400 mt-2">
                    Fuente: {{ currentFact.source }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Fecha y hora -->
            <div class="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-hospital-gray-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-hospital-gray-900">
                      {{ currentDate }}
                    </p>
                    <p class="text-xs text-hospital-gray-500">
                      {{ currentTime }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-xs text-hospital-gray-500">
                    Semana {{ weekOfYear }}
                  </p>
                  <p class="text-xs text-hospital-gray-500">
                    Día {{ dayOfYear }} del año
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel derecho - Formulario de login -->
        <div
          class="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8"
        >
          <div class="w-full max-w-md space-y-8">
            <!-- Encabezado del formulario -->
            <div class="text-center">
              <div
                class="mx-auto h-20 w-20 bg-gradient-to-br from-hospital-primary to-hospital-primary-dark rounded-full flex items-center justify-center shadow-lg mb-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 class="text-3xl font-bold text-hospital-gray-900">
                Iniciar Sesión
              </h2>
              <p class="mt-2 text-hospital-gray-600">
                Ingrese sus credenciales para acceder al sistema
              </p>
            </div>

            <!-- Formulario -->
            <div class="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <form
                [formGroup]="loginForm"
                (ngSubmit)="onSubmit()"
                class="space-y-5"
              >
                <!-- Tipo de usuario -->
                <div>
                  <label
                    class="block text-sm font-medium text-hospital-gray-700 mb-1"
                  >
                    <span class="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 text-hospital-gray-400 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Tipo de Usuario
                    </span>
                  </label>
                  <select
                    formControlName="tipoUsuario"
                    class="form-field w-full"
                    [class.error]="
                      loginForm.get('tipoUsuario')?.invalid &&
                      loginForm.get('tipoUsuario')?.touched
                    "
                  >
                    <option value="">Seleccione su rol...</option>
                    <option value="medico">Médico</option>

                    <option value="administrador">Administrador</option>
                  </select>
                  <div
                    *ngIf="
                      loginForm.get('tipoUsuario')?.invalid &&
                      loginForm.get('tipoUsuario')?.touched
                    "
                    class="text-hospital-emergency text-sm mt-1 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Seleccione el tipo de usuario
                  </div>
                </div>

                <!-- Usuario -->
                <div>
                  <label
                    class="block text-sm font-medium text-hospital-gray-700 mb-1"
                  >
                    <span class="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 text-hospital-gray-400 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Usuario
                    </span>
                  </label>
                  <input
                    type="text"
                    formControlName="usuario"
                    placeholder="Ingrese su usuario"
                    class="form-field w-full"
                    [class.error]="
                      loginForm.get('usuario')?.invalid &&
                      loginForm.get('usuario')?.touched
                    "
                  />
                  <div
                    *ngIf="
                      loginForm.get('usuario')?.invalid &&
                      loginForm.get('usuario')?.touched
                    "
                    class="text-hospital-emergency text-sm mt-1 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Usuario es obligatorio
                  </div>
                </div>

                <!-- Contraseña -->
                <div>
                  <label
                    class="block text-sm font-medium text-hospital-gray-700 mb-1"
                  >
                    <span class="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 text-hospital-gray-400 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Contraseña
                    </span>
                  </label>
                  <div class="relative">
                    <input
                      [type]="showPassword ? 'text' : 'password'"
                      formControlName="password"
                      placeholder="Ingrese su contraseña"
                      class="form-field w-full pr-10"
                      [class.error]="
                        loginForm.get('password')?.invalid &&
                        loginForm.get('password')?.touched
                      "
                    />
                    <button
                      type="button"
                      (click)="togglePassword()"
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-hospital-gray-400 hover:text-hospital-primary"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </div>
                  <div
                    *ngIf="
                      loginForm.get('password')?.invalid &&
                      loginForm.get('password')?.touched
                    "
                    class="text-hospital-emergency text-sm mt-1 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Contraseña es obligatoria
                  </div>
                </div>

                <!-- Mensajes de estado -->
                <div
                  *ngIf="errorMessage"
                  class="bg-hospital-emergency-light border border-hospital-emergency text-hospital-emergency-dark px-4 py-3 rounded-lg flex items-start"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>{{ errorMessage }}</span>
                </div>

                <div
                  *ngIf="successMessage"
                  class="bg-hospital-success-light border border-hospital-success text-hospital-success-dark px-4 py-3 rounded-lg flex items-start"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{{ successMessage }}</span>
                </div>

                <!-- Botón de submit -->
                <button
                  type="submit"
                  [disabled]="loginForm.invalid || isLoading"
                  class="btn-hospital w-full bg-gradient-to-r from-hospital-primary to-hospital-primary-dark text-white py-3 px-4 rounded-lg transition-all duration-200 hover:from-hospital-primary-dark hover:to-hospital-primary-darker disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="flex items-center justify-center">
                    <svg
                      *ngIf="isLoading"
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 mr-2 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <svg
                      *ngIf="!isLoading"
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
                  </span>
                </button>

                <div class="flex items-center justify-between mt-4">
                  <div class="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      class="h-4 w-4 text-hospital-primary focus:ring-hospital-primary border-hospital-gray-300 rounded"
                    />
                    <label
                      for="remember-me"
                      class="ml-2 block text-sm text-hospital-gray-700"
                    >
                      Recordar sesión
                    </label>
                  </div>

                  <div class="text-sm">
                    <button
                      type="button"
                      (click)="irARecuperarPassword()"
                      class="font-medium text-hospital-primary hover:text-hospital-primary-dark transition-colors duration-200 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6c-2 0-6-1.58-6-4a2 2 0 012-2h2m10-2v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5a2 2 0 012-2h10a2 2 0 012 2z"
                        />
                      </svg>
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <!-- Pie de página -->
            <div class="text-center text-xs text-hospital-gray-500">
              <p>Sistema SICEG-HG v1.0.0</p>
              <p class="mt-1">
                © {{ currentYear }} Hospital General. Todos los derechos
                reservados.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .form-field {
        @apply w-full px-4 py-3 border border-hospital-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hospital-primary focus:border-hospital-primary transition-colors;
      }
      .form-field.error {
        @apply border-hospital-emergency focus:ring-hospital-emergency focus:border-hospital-emergency;
      }
      .btn-hospital {
        @apply w-full bg-gradient-to-r from-hospital-primary to-hospital-primary-dark text-white py-3 px-4 rounded-lg transition-all duration-200 hover:from-hospital-primary-dark hover:to-hospital-primary-darker disabled:opacity-50 disabled:cursor-not-allowed;
      }

      /* 🔥 NUEVO: Estilos para el enlace de recuperación */
      .forgot-password-link {
        @apply text-hospital-primary hover:text-hospital-primary-dark transition-colors duration-200;
      }

      .forgot-password-link:hover {
        @apply underline;
      }
    `,
  ],
})
export class Login implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  private returnUrl: string = '/app/dashboard';

  // Dynamic content
  currentImage: MedicalImage | null = null;
  currentFact: MedicalFact;
  currentDate: string;
  currentTime: string;
  dayOfYear: number;
  weekOfYear: number;
  currentYear: number;

  // Medical facts data (updated with more professional facts)
  private medicalFacts: MedicalFact[] = [
    {
      title: 'Innovación Médica',
      description:
        'La telemedicina ha aumentado un 300% su uso desde 2020, permitiendo atención remota de calidad.',
      icon: 'fas fa-laptop-medical',
      source: 'Organización Mundial de la Salud',
    },
    {
      title: 'Dato Clínico',
      description:
        'El lavado de manos correcto reduce en un 50% las infecciones nosocomiales en entornos hospitalarios.',
      icon: 'fas fa-hands-wash',
      source: 'Centros para el Control de Enfermedades',
    },
    {
      title: 'Avance Tecnológico',
      description:
        'Los sistemas de expedientes clínicos electrónicos reducen errores médicos en un 30%.',
      icon: 'fas fa-file-medical',
      source: 'Journal of Medical Systems',
    },
    {
      title: 'Prevención',
      description:
        'La detección temprana del cáncer aumenta las tasas de supervivencia en más del 80% para muchos tipos.',
      icon: 'fas fa-microscope',
      source: 'Sociedad Americana del Cáncer',
    },
    {
      title: 'Salud Pública',
      description:
        'La vacunación previene entre 2-3 millones de muertes anuales por enfermedades infecciosas.',
      icon: 'fas fa-syringe',
      source: 'Organización Mundial de la Salud',
    },
    {
      title: 'SICEG-HG',
      description:
        'Sistema diseñado específicamente para el Hospital General de San Luis de la Paz, Guanajuato.',
      icon: 'fas fa-hospital',
      source: 'Desarrollo Local',
    },
    {
      title: 'Tecnología Médica',
      description:
        'Los expedientes electrónicos mejoran la coordinación entre especialistas en un 85%.',
      icon: 'fas fa-laptop-medical',
      source: 'Journal of Medical Internet Research',
    },
    {
      title: 'Seguridad del Paciente',
      description:
        'La verificación digital de identidad reduce errores de medicación en un 92%.',
      icon: 'fas fa-shield-alt',
      source: 'Hospital Safety Institute',
    },
  ];

  // Función para rotar entre diferentes tipos de contenido
  private async loadDynamicContent(): Promise<void> {
    const contentTypes = ['motivational', 'funny', 'health', 'curious'];
    const randomType =
      contentTypes[Math.floor(Math.random() * contentTypes.length)];

    switch (randomType) {
      case 'motivational':
        await this.loadMotivationalQuotes();
        break;
      case 'funny':
        await this.loadFunnyFacts();
        break;
      case 'health':
        await this.loadHealthTips();
        break;
      case 'curious':
        await this.loadCuriousFacts();
        break;
    }
  }

  private async loadFunnyFacts(): Promise<void> {
    try {
      const response = await fetch(
        'https://official-joke-api.appspot.com/random_joke'
      );
      const data = await response.json();

      this.medicalFacts[0] = {
        title: 'Momento de Humor 😄',
        description: `${data.setup} - ${data.punchline}`,
        icon: 'fas fa-laugh',
        source: 'Official Joke API',
      };
    } catch (error) {
      console.log('Error cargando chistes');
    }
  }

  private async loadCuriousFacts(): Promise<void> {
    const localFacts = [
      {
        title: 'Dato Médico Curioso',
        description:
          'El corazón humano late aproximadamente 100,000 veces al día y bombea 7,500 litros de sangre.',
        icon: 'fas fa-heart',
        source: 'American Heart Association',
      },
      {
        title: 'Curiosidad Hospitalaria',
        description:
          'Los médicos caminan en promedio 8 kilómetros durante un turno de 12 horas en el hospital.',
        icon: 'fas fa-walking',
        source: 'Hospital Medicine Journal',
      },
      {
        title: 'Dato Tecnológico',
        description:
          'Los códigos QR fueron inventados en 1994 y ahora se usan para acceso rápido a expedientes médicos.',
        icon: 'fas fa-qrcode',
        source: 'Healthcare IT News',
      },
    ];

    const randomFact =
      localFacts[Math.floor(Math.random() * localFacts.length)];
    this.medicalFacts[0] = randomFact;
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      tipoUsuario: ['', Validators.required],
      usuario: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.currentFact = this.medicalFacts[0];
    this.currentDate = this.getCurrentDate();
    this.currentTime = this.getCurrentTime();
    this.dayOfYear = this.getDayOfYear();
    this.weekOfYear = this.getWeekOfYear();
    this.currentYear = new Date().getFullYear();
  }

  // ngOnInit(): void {
  //   if (this.authService.isLoggedIn) {
  //     this.router.navigate(['/app/dashboard']);
  //     return;
  //   }

  //   this.returnUrl =
  //     this.route.snapshot.queryParams['returnUrl'] || '/app/dashboard';

  //   // Load initial medical image
  //   this.loadMedicalImage();

  //   // Update time every minute
  //   setInterval(() => {
  //     this.currentTime = this.getCurrentTime();
  //   }, 60000);

  //   // Rotate medical facts every 8 seconds
  //   setInterval(() => {
  //     this.rotateMedicalFact();
  //   }, 8000);

  //   // Rotate image every 5 minutes (to avoid API rate limits)
  //   setInterval(() => {
  //     this.loadMedicalImage();
  //   }, 300000);
  // }

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/app/dashboard']);
      return;
    }

    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || '/app/dashboard';

    // 🔥 NUEVO: Cargar contenido dinámico
    this.loadDynamicContent();

    // Load initial medical image
    this.loadMedicalImage();

    // Update time every minute
    setInterval(() => {
      this.currentTime = this.getCurrentTime();
    }, 60000);

    // 🔥 CAMBIO: Rotar facts cada 10 segundos con contenido dinámico
    setInterval(() => {
      this.rotateMedicalFact();
    }, 10000);

    // 🔥 NUEVO: Actualizar contenido dinámico cada 2 minutos
    setInterval(() => {
      this.loadDynamicContent();
    }, 120000);

    // Rotate image every 5 minutes
    setInterval(() => {
      this.loadMedicalImage();
    }, 300000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  irARecuperarPassword(): void {
    this.router.navigate(['/recuperar-password']);
  }

  private loadMedicalImage(): void {
    // Using Pexels API for medical images (free tier)
    const medicalQueries = [
      'doctor',
      'hospital',
      'medical',
      'surgery',
      'healthcare',
      'stethoscope',
      'medicine',
      'nurse',
      'clinic',
      'laboratory',
    ];

    const randomQuery =
      medicalQueries[Math.floor(Math.random() * medicalQueries.length)];
    const apiUrl = `https://api.pexels.com/v1/search?query=${randomQuery}&per_page=1&orientation=landscape`;

    this.http
      .get<any>(apiUrl, {
        headers: {
          Authorization:
            'YL4wV2fZ8oFf26uGeW0Xlnvv5XJOS2pgrGWWpBGE4CKMnJWDOHrHF3Ob', // Replace with your Pexels API key
        },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.photos && response.photos.length > 0) {
            const photo = response.photos[0];
            this.currentImage = {
              id: photo.id,
              url: photo.src.large,
              alt: photo.alt || 'Imagen médica',
              photographer: photo.photographer,
              photographer_url: photo.photographer_url,
            };
          }
        },
        error: (error) => {
          console.error('Error loading medical image:', error);
          this.currentImage = null;
        },
      });
  }

  private rotateMedicalFact(): void {
    const currentIndex = this.medicalFacts.findIndex(
      (fact) => fact.title === this.currentFact.title
    );
    const nextIndex = (currentIndex + 1) % this.medicalFacts.length;
    this.currentFact = this.medicalFacts[nextIndex];
  }

  // 🤣 Facts divertidos para alivianar el ambiente hospitalario
  private async loadChuckNorrisFacts(): Promise<void> {
    try {
      const response = await fetch('https://api.chucknorris.io/jokes/random');
      const data = await response.json();

      this.medicalFacts = [
        {
          title: 'Dato Curioso',
          description: data.value,
          icon: 'fas fa-laugh',
          source: 'Chuck Norris Facts API',
        },
        ...this.medicalFacts.slice(1), // Mantener otros facts
      ];
    } catch (error) {
      console.log('Error cargando facts divertidos');
    }
  }

  // 🏥 Consejos de salud profesionales
  private async loadHealthTips(): Promise<void> {
    try {
      const response = await fetch(
        'https://health-tips-api.herokuapp.com/api/tips/random'
      );
      const data = await response.json();

      this.medicalFacts.unshift({
        title: 'Consejo de Salud',
        description: data.tip,
        icon: 'fas fa-heartbeat',
        source: 'Health Tips API',
      });
    } catch (error) {
      console.log('Error cargando consejos de salud');
    }
  }

  // ✨ Frases motivacionales para personal médico
  private async loadMotivationalQuotes(): Promise<void> {
    try {
      const response = await fetch(
        'https://api.quotable.io/random?tags=inspirational|motivational'
      );
      const data = await response.json();

      this.medicalFacts.unshift({
        title: 'Inspiración del Día',
        description: `"${data.content}"`,
        icon: 'fas fa-star',
        source: `${data.author} - Quotable API`,
      });
    } catch (error) {
      console.log('Error cargando frases motivacionales');
    }
  }

  // 🧠 Facts curiosos e interesantes
  private async loadInterestingFacts(): Promise<void> {
    try {
      const response = await fetch(
        'https://uselessfacts.jsph.pl/random.json?language=en'
      );
      const data = await response.json();

      this.medicalFacts.unshift({
        title: 'Dato Curioso',
        description: data.text,
        icon: 'fas fa-lightbulb',
        source: 'Useless Facts API',
      });
    } catch (error) {
      console.log('Error cargando facts curiosos');
    }
  }

  onImageError(): void {
    this.currentImage = null;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getDayOfYear(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  getWeekOfYear(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor(
      (now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
    );
    return Math.ceil((days + start.getDay() + 1) / 7);
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
      tipoUsuario: this.loginForm.value.tipoUsuario,
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response.success) {
          // Guardar token y usuario
          localStorage.setItem('token', response.data.token);

          // Actualizar usuario actual en el servicio
          this.authService.setCurrentUser(response.data.usuario);

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
        this.errorMessage =
          error.error?.message || 'Error de conexión con el servidor';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private markFormGroupTouched(): void {
    Object.values(this.loginForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }
}
