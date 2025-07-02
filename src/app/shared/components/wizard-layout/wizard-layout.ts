// src/app/shared/components/wizard-layout/wizard-layout.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { WizardStateService } from '../../../services/wizard-state';
import { WizardState, WizardNavigation, STEP_TITLES } from '../../../models/wizard.models';

@Component({
  selector: 'app-wizard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">

      <!-- Header del Wizard -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">

            <!-- Logo y título -->
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <h1 class="text-lg font-semibold text-gray-900">Registro de Nuevo Paciente</h1>
                <p class="text-sm text-gray-500">Hospital General San Luis de la Paz</p>
              </div>
            </div>

            <!-- Estado del wizard -->
            <div class="flex items-center space-x-4">
              <div class="text-sm text-gray-500">
                {{ getCurrentStepTitle() }}
              </div>

              <!-- Botón de salir -->
              <button
                (click)="exitWizard()"
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Barra de progreso -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

          <!-- Progress bar -->
          <div class="mb-4">
            <div class="flex justify-between text-xs font-medium text-gray-500 mb-2">
              <span>Progreso del Registro</span>
              <span>{{ wizardState?.progreso || 0 }}% completado</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                [style.width.%]="wizardState?.progreso || 0"
              ></div>
            </div>
          </div>

          <!-- Steps -->
          <nav class="flex justify-between">
            <div
              *ngFor="let step of steps; let i = index"
              class="flex flex-col items-center relative"
              [class.flex-1]="i < steps.length - 1"
            >

              <!-- Línea conectora -->
              <div
                *ngIf="i < steps.length - 1"
                class="absolute top-5 left-1/2 w-full h-0.5 bg-gray-200 -z-10"
                [class.bg-blue-600]="step.isCompleted"
              ></div>

              <!-- Círculo del paso -->
              <div
                class="w-10 h-10 rounded-full border-2 flex items-center justify-center relative z-10 bg-white transition-all duration-200"
                [ngClass]="{
                  'border-blue-600 bg-blue-600 text-white': step.isActive,
                  'border-green-500 bg-green-500 text-white': step.isCompleted && !step.isActive,
                  'border-gray-300 text-gray-400': !step.isActive && !step.isCompleted
                }"
              >
                <svg
                  *ngIf="step.isCompleted && !step.isActive"
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span
                  *ngIf="!step.isCompleted || step.isActive"
                  class="text-sm font-medium"
                >
                  {{ i + 1 }}
                </span>
              </div>

              <!-- Título del paso -->
              <div class="mt-2 text-center max-w-20">
                <div
                  class="text-xs font-medium"
                  [ngClass]="{
                    'text-blue-600': step.isActive,
                    'text-green-600': step.isCompleted && !step.isActive,
                    'text-gray-500': !step.isActive && !step.isCompleted
                  }"
                >
                  {{ step.title }}
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>

      <!-- Loading overlay -->
      <div
        *ngIf="isLoading"
        class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg p-6 flex items-center space-x-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="text-gray-900 font-medium">Procesando...</span>
        </div>
      </div>

      <!-- Contenido principal -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer del wizard -->
      <div class="bg-white border-t border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">

            <!-- Información del Hospital -->
            <div class="flex items-center text-sm text-gray-500">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0a2 2 0 002-2m-2 2H5m14 0v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2m2 0V9a2 2 0 012-2h10a2 2 0 012 2v10M9 7h6m-6 4h6m-6 4h6"/>
              </svg>
              <span>Sistema CICEG-HG © 2025</span>
            </div>

            <!-- Estado de guardado -->
            <div class="flex items-center text-sm">
              <div
                class="w-2 h-2 rounded-full mr-2"
                [ngClass]="{
                  'bg-green-500': lastSaved && !isLoading,
                  'bg-yellow-500': isLoading,
                  'bg-gray-400': !lastSaved
                }"
              ></div>
              <span class="text-gray-500">
                <span *ngIf="isLoading">Guardando...</span>
                <span *ngIf="!isLoading && lastSaved">Guardado {{ lastSaved | date:'short' }}</span>
                <span *ngIf="!isLoading && !lastSaved">Sin cambios</span>
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class WizardLayout implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Estado del wizard
  wizardState: WizardState | null = null;
  navigation: WizardNavigation | null = null;
  isLoading = false;
  lastSaved: Date | null = null;

  // Pasos del wizard para la UI
  steps = [
    {
      title: 'Inicio',
      isActive: false,
      isCompleted: false
    },
    {
      title: 'Datos Personales',
      isActive: false,
      isCompleted: false
    },
    {
      title: 'Info. Médica',
      isActive: false,
      isCompleted: false
    },
    {
      title: 'Expediente',
      isActive: false,
      isCompleted: false
    },
    {
      title: 'Documento',
      isActive: false,
      isCompleted: false
    },
    {
      title: 'Confirmación',
      isActive: false,
      isCompleted: false
    }
  ];

  constructor(
    private wizardStateService: WizardStateService
  ) {}

  ngOnInit(): void {
    this.subscribeToWizardState();
    this.subscribeToLoading();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // SUSCRIPCIONES
  // ==========================================

  private subscribeToWizardState(): void {
    this.wizardStateService.getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.wizardState = state;
        this.updateStepsUI(state);

        // Actualizar última fecha de guardado
        if (state.ultimaActualizacion) {
          this.lastSaved = new Date(state.ultimaActualizacion);
        }
      });

    this.wizardStateService.getNavigation()
      .pipe(takeUntil(this.destroy$))
      .subscribe(nav => {
        this.navigation = nav;
      });
  }

  private subscribeToLoading(): void {
    this.wizardStateService.getLoading()
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
      });
  }

  // ==========================================
  // MÉTODOS DE UI
  // ==========================================

  private updateStepsUI(state: WizardState): void {
    // Mapear pasos del wizard a pasos de UI
    const stepMapping = [
      'inicio', 'persona', 'paciente', 'expediente', 'documento-clinico', 'resumen'
    ];

    this.steps.forEach((step, index) => {
      const stepKey = stepMapping[index];

      // Verificar si está completado
      step.isCompleted = state.completedSteps.some(completedStep =>
        completedStep.toLowerCase().includes(stepKey)
      );

      // Verificar si está activo
      step.isActive = state.currentStep.toLowerCase().includes(stepKey);
    });
  }

  getCurrentStepTitle(): string {
    return this.wizardStateService.getCurrentStepTitle();
  }

  // ==========================================
  // ACCIONES
  // ==========================================

  exitWizard(): void {
    const hasData = this.wizardState && (
      Object.keys(this.wizardState.datosPersona).length > 0 ||
      Object.keys(this.wizardState.datosPaciente).length > 0
    );

    if (hasData) {
      const shouldExit = confirm(
        '¿Está seguro de que desea salir del registro? Los datos se mantendrán guardados y podrá continuar más tarde.'
      );

      if (shouldExit) {
        this.navigateToMain();
      }
    } else {
      this.navigateToMain();
    }
  }

  private navigateToMain(): void {
    // Navegar al dashboard principal
    window.location.href = '/app/dashboard';
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  getProgressPercentage(): number {
    return this.wizardState?.progreso || 0;
  }

  isStepClickable(stepIndex: number): boolean {
    // Solo permitir navegar a pasos anteriores o al paso actual
    const currentIndex = this.navigation?.currentStepIndex || 0;
    return stepIndex <= currentIndex;
  }

  goToStep(stepIndex: number): void {
    if (this.isStepClickable(stepIndex)) {
      // Implementar navegación a paso específico
      console.log(`Navegando al paso ${stepIndex}`);
    }
  }
}
