// src/app/nuevo-paciente/nuevo-paciente.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { WizardStateService } from '../services/wizard-state';
import { CatalogoService } from '../services/catalogo';
import { WizardStep, EstadoWizard } from '../models/wizard.models';

@Component({
  selector: 'app-nuevo-paciente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Header del Wizard -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Nuevo Expediente de Paciente
          </h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Registre un nuevo paciente en el sistema hospitalario siguiendo el proceso guiado paso a paso.
          </p>
        </div>

        <!-- Información del Proceso -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">
              Proceso de Registro
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              <!-- Paso 1: Datos Personales -->
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-600">1</span>
                  </div>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-900">Datos Personales</h3>
                  <p class="text-sm text-gray-500">Nombre, CURP, fecha de nacimiento</p>
                </div>
              </div>

              <!-- Paso 2: Información Médica -->
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-600">2</span>
                  </div>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-900">Información Médica</h3>
                  <p class="text-sm text-gray-500">Tipo de sangre, alergias, contacto</p>
                </div>
              </div>

              <!-- Paso 3: Crear Expediente -->
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-600">3</span>
                  </div>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-900">Crear Expediente</h3>
                  <p class="text-sm text-gray-500">Generación automática del expediente</p>
                </div>
              </div>

              <!-- Paso 4: Documento Clínico -->
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-600">4</span>
                  </div>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-900">Tipo de Documento</h3>
                  <p class="text-sm text-gray-500">Seleccionar tipo de documento clínico</p>
                </div>
              </div>

              <!-- Paso 5: Llenar Documento -->
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-600">5</span>
                  </div>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-900">Llenar Documento</h3>
                  <p class="text-sm text-gray-500">Completar formulario específico</p>
                </div>
              </div>

              <!-- Paso 6: Confirmación -->
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-600">6</span>
                  </div>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-900">Confirmación</h3>
                  <p class="text-sm text-gray-500">Revisar y confirmar registro</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Estado de Carga de Catálogos -->
        <div *ngIf="isLoadingCatalogos" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-3"></div>
            <p class="text-sm text-yellow-800">Cargando catálogos del sistema...</p>
          </div>
        </div>

        <!-- Error de Catálogos -->
        <div *ngIf="catalogosError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="flex items-center">
            <svg class="w-4 h-4 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <div>
              <p class="text-sm text-red-800 font-medium">Error al cargar catálogos</p>
              <p class="text-sm text-red-600">Se usarán datos predeterminados. Puede continuar con el registro.</p>
            </div>
          </div>
        </div>

        <!-- Información Importante -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
            <div>
              <h3 class="text-sm font-medium text-blue-900 mb-1">Información Importante</h3>
              <ul class="text-sm text-blue-800 space-y-1">
                <li>• Asegúrese de tener la CURP del paciente disponible</li>
                <li>• Todos los campos marcados como obligatorios deben completarse</li>
                <li>• El proceso se puede pausar y continuar más tarde</li>
                <li>• Los datos se guardan automáticamente en cada paso</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="text-center">
          <button
            (click)="comenzarRegistro()"
            [disabled]="isLoadingCatalogos"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            {{ isLoadingCatalogos ? 'Cargando...' : 'Comenzar Registro' }}
          </button>

          <div class="mt-4">
            <button
              (click)="volverDashboard()"
              class="text-sm text-gray-500 hover:text-gray-700"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>

        <!-- Estado Actual del Wizard (Solo para desarrollo) -->
        <div *ngIf="showDebugInfo" class="mt-8 bg-gray-100 rounded-lg p-4">
          <h3 class="text-sm font-medium text-gray-900 mb-2">Estado del Wizard (Debug)</h3>
          <pre class="text-xs text-gray-600 overflow-auto">{{ wizardState | json }}</pre>
        </div>

      </div>
    </div>
  `
})
export class NuevoPaciente implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Estados del componente
  isLoadingCatalogos = false;
  catalogosError = false;
  wizardState: any = {};
  showDebugInfo = false; // Cambiar a true para desarrollo

  constructor(
    private wizardStateService: WizardStateService,
    private catalogoService: CatalogoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.subscribeToWizardState();
    this.preloadCatalogos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  private initializeComponent(): void {
    // Resetear el wizard si estamos empezando de nuevo
    this.wizardStateService.setWizardEstado(EstadoWizard.INICIANDO);
  }

  private subscribeToWizardState(): void {
    this.wizardStateService.getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.wizardState = state;
      });
  }

  private preloadCatalogos(): void {
    this.isLoadingCatalogos = true;
    this.catalogosError = false;

    this.catalogoService.preloadEssentialCatalogos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success) => {
          this.isLoadingCatalogos = false;
          if (!success) {
            this.catalogosError = true;
            console.warn('Algunos catálogos no se pudieron cargar, usando datos estáticos');
          }
        },
        error: (error) => {
          this.isLoadingCatalogos = false;
          this.catalogosError = true;
          console.error('Error al precargar catálogos:', error);
        }
      });
  }

  // ==========================================
  // ACCIONES DEL USUARIO
  // ==========================================

  comenzarRegistro(): void {
    if (this.isLoadingCatalogos) return;

    // Actualizar estado del wizard
    this.wizardStateService.setWizardEstado(EstadoWizard.EN_PROGRESO);

    // Navegar al primer paso
    this.wizardStateService.goToStep(WizardStep.PERSONA);
  }

  volverDashboard(): void {
    this.router.navigate(['/app/dashboard']);
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  /** Continuar wizard existente (si había uno en progreso) */
  continuarRegistro(): void {
    const currentState = this.wizardStateService.getCurrentState();

    if (currentState.currentStep && currentState.currentStep !== WizardStep.INICIO) {
      this.wizardStateService.goToStep(currentState.currentStep);
    } else {
      this.comenzarRegistro();
    }
  }

  /** Resetear wizard completamente */
  resetearWizard(): void {
    if (confirm('¿Está seguro de que desea reiniciar el proceso de registro? Se perderán todos los datos ingresados.')) {
      this.wizardStateService.resetWizard();
    }
  }
}
