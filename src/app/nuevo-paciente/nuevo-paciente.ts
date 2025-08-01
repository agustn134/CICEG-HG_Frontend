// src/app/nuevo-paciente/nuevo-paciente.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, timer } from 'rxjs';
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

        <!-- Información del Proceso Simplificado -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">
              Proceso de Registro (3 Pasos)
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

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
                  <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-green-600">3</span>
                  </div>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-900">Crear Expediente</h3>
                  <p class="text-sm text-gray-500">Generación automática y redirección</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Estado de Carga de Catálogos -->
        <div *ngIf="isLoadingCatalogos" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-3"></div>
              <p class="text-sm text-yellow-800">Cargando catálogos del sistema...</p>
            </div>
            <!-- Botón de bypass si tarda mucho -->
            <button
              (click)="forzarInicio()"
              class="text-xs text-yellow-700 hover:text-yellow-900 underline font-medium"
            >
              Continuar sin esperar
            </button>
          </div>
        </div>

        <!-- Error de Catálogos -->
        <div *ngIf="catalogosError" class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div class="flex items-center">
            <svg class="w-4 h-4 text-orange-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <div>
              <p class="text-sm text-orange-800 font-medium">Catálogos con datos estáticos</p>
              <p class="text-sm text-orange-600">Se usarán datos predeterminados. Puede continuar normalmente.</p>
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
                <li>• Los datos se guardan automáticamente en cada paso</li>
                <li>• <strong>Al finalizar será redirigido al perfil del paciente</strong></li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="text-center">
          <button
            (click)="comenzarRegistro()"
            [disabled]="!puedeComenzar"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            {{ textoBoton }}
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

        <!-- Flujo Simplificado - Visual -->
        <div class="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
          <h3 class="text-center text-lg font-semibold text-gray-900 mb-4">Flujo Simplificado</h3>
          <div class="flex items-center justify-between max-w-2xl mx-auto">

            <!-- Paso 1 -->
            <div class="text-center">
              <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mb-2">1</div>
              <p class="text-xs font-medium text-gray-700">Datos<br>Personales</p>
            </div>

            <!-- Flecha -->
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>

            <!-- Paso 2 -->
            <div class="text-center">
              <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mb-2">2</div>
              <p class="text-xs font-medium text-gray-700">Info.<br>Médica</p>
            </div>

            <!-- Flecha -->
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>

            <!-- Paso 3 -->
            <div class="text-center">
              <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mb-2">3</div>
              <p class="text-xs font-medium text-gray-700">Crear<br>Expediente</p>
            </div>

            <!-- Flecha -->
            <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>

            <!-- Redirección -->
            <div class="text-center">
              <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mb-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p class="text-xs font-medium text-gray-700">Perfil<br>Paciente</p>
            </div>

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
    this.preloadCatalogosSimplified(); // 🔧 MÉTODO SIMPLIFICADO
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  private initializeComponent(): void {
    console.log('  Inicializando componente nuevo-paciente...');

    //   INICIALIZACIÓN LIMPIA DEL WIZARD
    this.wizardStateService.initializeWizard();

    // Establecer estado como "iniciando"
    this.wizardStateService.setWizardEstado(EstadoWizard.INICIANDO);

    console.log('  Wizard inicializado en estado INICIANDO');
  }

  private subscribeToWizardState(): void {
    this.wizardStateService.getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.wizardState = state;
        console.log('  Estado del wizard en nuevo-paciente:', state);
      });
  }

  // 🔧 MÉTODO DE CARGA SIMPLIFICADO Y CON TIMEOUT
  private preloadCatalogosSimplified(): void {
    this.isLoadingCatalogos = true;
    this.catalogosError = false;

    console.log('  Precargando catálogos esenciales...');

    //   TIMEOUT DE SEGURIDAD - Si no carga en 3 segundos, continuar
    const timeout$ = timer(3000);

    //   SOLO CARGAR CATÁLOGOS QUE REALMENTE EXISTEN
    const loadPromise = this.loadOnlyExistingCatalogs();

    Promise.race([
      loadPromise,
      timeout$.toPromise().then(() => 'timeout')
    ]).then(result => {
      this.isLoadingCatalogos = false;

      if (result === 'timeout') {
        console.warn('⏰ Timeout en carga de catálogos - continuando con datos estáticos');
        this.catalogosError = true;
      } else if (result === 'success') {
        console.log('  Catálogos cargados correctamente');
        this.catalogosError = false;
      } else {
        console.warn('  Error en catálogos - usando datos estáticos');
        this.catalogosError = true;
      }
    }).catch(error => {
      console.error('❌ Error inesperado en carga de catálogos:', error);
      this.isLoadingCatalogos = false;
      this.catalogosError = true;
    });
  }

  // 🎯 CARGAR SOLO CATÁLOGOS QUE EXISTEN EN TU BACKEND
  private async loadOnlyExistingCatalogs(): Promise<string> {
    try {
      // Lista de catálogos que SÍ existen en tu backend
      const existingCatalogs = [
        'tipos_sangre',   //   Existe: tipos-sangre
        'servicios'       //   Existe: servicios
        // NO incluir: estados_civiles, religiones, etc. porque dan 404
      ];

      console.log('  Cargando catálogos existentes:', existingCatalogs);

      // Cargar solo los que existen
      const loadPromises = existingCatalogs.map(async (catalog) => {
        try {
          await this.catalogoService.getCatalogo(catalog as any).toPromise();
          console.log(`  Catálogo ${catalog} cargado`);
          return true;
        } catch (error) {
          console.warn(`  Error en catálogo ${catalog}:`, error);
          return false;
        }
      });

      const results = await Promise.all(loadPromises);
      const successCount = results.filter(r => r).length;

      console.log(`  Catálogos cargados: ${successCount}/${existingCatalogs.length}`);

      return 'success';
    } catch (error) {
      console.error('❌ Error general en carga de catálogos:', error);
      return 'error';
    }
  }

  // ==========================================
  // ACCIONES DEL USUARIO
  // ==========================================

  comenzarRegistro(): void {
    //   PERMITIR INICIAR AUNQUE HAYA ERRORES EN CATÁLOGOS
    console.log('  Comenzando registro de nuevo paciente...');

    // Actualizar estado del wizard a "en progreso"
    this.wizardStateService.setWizardEstado(EstadoWizard.EN_PROGRESO);

    // Navegar al primer paso (Datos Personales)
    this.wizardStateService.goToStep(WizardStep.PERSONA);

    console.log('  Navegando al primer paso: Datos Personales');
  }

  volverDashboard(): void {
    // Preguntar antes de salir si hay datos
    const hasChanges = this.wizardState && (
      Object.keys(this.wizardState.datosPersona || {}).length > 0 ||
      Object.keys(this.wizardState.datosPaciente || {}).length > 0
    );

    if (hasChanges) {
      const shouldLeave = confirm(
        '¿Está seguro de que desea salir? Los datos del wizard se perderán.'
      );

      if (!shouldLeave) return;
    }

    // Limpiar wizard y navegar
    this.wizardStateService.resetWizard();
    this.router.navigate(['/app/dashboard']);
  }

  // ==========================================
  // MÉTODOS PÚBLICOS PARA EL TEMPLATE
  // ==========================================

  /** Verificar si puede comenzar el registro */
  get puedeComenzar(): boolean {
    //   SIEMPRE PERMITIR COMENZAR - No depender de catálogos
    return !this.isLoadingCatalogos;
  }

  /** Obtener texto del botón */
  get textoBoton(): string {
    if (this.isLoadingCatalogos) {
      return 'Cargando...';
    }
    return 'Comenzar Registro (3 Pasos)';
  }

  /** Forzar inicio (para bypass de catálogos) */
  forzarInicio(): void {
    console.log('  Forzando inicio del registro...');

    // Detener carga de catálogos
    this.isLoadingCatalogos = false;
    this.catalogosError = false;

    // Comenzar registro
    this.comenzarRegistro();
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  /** Continuar wizard existente (si había uno en progreso) */
  continuarRegistro(): void {
    const currentState = this.wizardStateService.getCurrentState();

    if (currentState.currentStep && currentState.currentStep !== WizardStep.INICIO) {
      console.log('  Continuando wizard existente desde:', currentState.currentStep);
      this.wizardStateService.goToStep(currentState.currentStep);
    } else {
      this.comenzarRegistro();
    }
  }

  /** Resetear wizard completamente */
  resetearWizard(): void {
    if (confirm('¿Está seguro de que desea reiniciar el proceso de registro? Se perderán todos los datos ingresados.')) {
      console.log('  Reseteando wizard completamente...');
      this.wizardStateService.resetWizard();
      this.initializeComponent(); // Re-inicializar
    }
  }

  // ==========================================
  // DEBUG (solo para desarrollo)
  // ==========================================

  debugWizardState(): void {
    console.log('  DEBUG - Estado completo del wizard:', {
      estado: this.wizardState,
      pasoActual: this.wizardState?.currentStep,
      pasosCompletados: this.wizardState?.completedSteps,
      progreso: this.wizardState?.progreso,
      datos: {
        persona: this.wizardState?.datosPersona,
        paciente: this.wizardState?.datosPaciente
      }
    });
  }

  debugCatalogos(): void {
    console.log('  DEBUG - Estado de catálogos:', {
      isLoading: this.isLoadingCatalogos,
      hasError: this.catalogosError,
      puedeComenzar: this.puedeComenzar
    });
  }
}
