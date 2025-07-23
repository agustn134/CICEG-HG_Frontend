// src/app/shared/components/wizard-layout/wizard-layout.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { WizardStateService } from '../../../services/wizard-state';
import { WizardState, WizardNavigation, WizardStep } from '../../../models/wizard.models';

@Component({
  selector: 'app-wizard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wizard-layout.html',
  styleUrls: ['./wizard-layout.css']
})
export class WizardLayout implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Estado del wizard
  wizardState: WizardState | null = null;
  navigation: WizardNavigation | null = null;
  isLoading = false;
  lastSaved: Date | null = null;
  loadingMessage: string = '';
  currentRoute: string = '';

  // 🎯 PASOS SIMPLIFICADOS A 3 - INICIALIZADOS CORRECTAMENTE
  steps = [
    {
      title: 'Datos Personales',
      description: 'Información básica',
      shortTitle: 'Persona',
      route: 'persona',
      stepEnum: WizardStep.PERSONA,
      isActive: false,
      isCompleted: false
    },
    {
      title: 'Info. Médica',
      description: 'Datos del paciente',
      shortTitle: 'Médica',
      route: 'paciente',
      stepEnum: WizardStep.PACIENTE,
      isActive: false,
      isCompleted: false
    },
    {
      title: 'Expediente',
      description: 'Creación automática',
      shortTitle: 'Expediente',
      route: 'expediente',
      stepEnum: WizardStep.EXPEDIENTE,
      isActive: false,
      isCompleted: false
    }
  ];

  constructor(
    private wizardStateService: WizardStateService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('🔄 Inicializando WizardLayout...');

    // Verificar y limpiar estado si es necesario
    this.checkAndResetStateIfNeeded();

    this.subscribeToWizardState();
    this.subscribeToLoading();
    this.subscribeToRoute();

    // Forzar actualización inicial
    this.forceInitialUpdate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // INICIALIZACIÓN Y VERIFICACIÓN
  // ==========================================

  private checkAndResetStateIfNeeded(): void {
    const currentState = this.wizardStateService.getCurrentState();

    // Si no hay estado o está corrupto, reiniciar
    if (!currentState ||
        typeof currentState !== 'object' ||
        !currentState.currentStep ||
        !currentState.completedSteps) {

      console.log('  Estado del wizard inválido, reiniciando...');
      this.wizardStateService.resetWizard();
    }
  }

  private forceInitialUpdate(): void {
    // Obtener estado actual y actualizar UI inmediatamente
    const currentState = this.wizardStateService.getCurrentState();
    console.log('  Estado inicial del wizard:', currentState);

    if (currentState) {
      this.wizardState = currentState;
      this.updateStepsUI(currentState);
    }

    // Detectar ruta actual
    this.detectCurrentRoute();
  }

  private detectCurrentRoute(): void {
    const urlSegments = this.router.url.split('/');
    this.currentRoute = urlSegments[urlSegments.length - 1] || 'inicio';
    console.log('  Ruta detectada:', this.currentRoute);

    this.updateStepsFromRoute();
  }

  // ==========================================
  // SUSCRIPCIONES
  // ==========================================

  private subscribeToRoute(): void {
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.detectCurrentRoute();
      });
  }

  private subscribeToWizardState(): void {
    this.wizardStateService.getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        console.log('📊 Estado del wizard actualizado:', state);
        this.wizardState = state;

        if (state) {
          this.updateStepsUI(state);

          if (state.ultimaActualizacion) {
            this.lastSaved = new Date(state.ultimaActualizacion);
          }
        }
      });

    this.wizardStateService.getNavigation()
      .pipe(takeUntil(this.destroy$))
      .subscribe(nav => {
        this.navigation = nav;
        console.log('🧭 Navegación actualizada:', nav);
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
  // ACTUALIZACIÓN DE UI
  // ==========================================

  private updateStepsFromRoute(): void {
    // Resetear todos los pasos
    this.steps.forEach(step => {
      step.isActive = false;
      step.isCompleted = false;
    });

    // 🎯 LÓGICA CLARA: Solo marcar activo si coincide con la ruta
    if (this.currentRoute !== 'inicio') {
      const activeStep = this.steps.find(step => step.route === this.currentRoute);
      if (activeStep) {
        activeStep.isActive = true;
        console.log(`  Paso activo: ${activeStep.title}`);
      }
    }

    console.log('🔄 Pasos actualizados desde ruta:', this.steps.map(s => ({
      title: s.title,
      active: s.isActive,
      completed: s.isCompleted
    })));
  }

  private updateStepsUI(state: WizardState): void {
    if (!state) {
      console.log('  Estado del wizard vacío, reseteando pasos...');
      this.steps.forEach(step => {
        step.isActive = false;
        step.isCompleted = false;
      });
      return;
    }

    console.log('🔄 Actualizando UI de pasos...');
    console.log('📋 Pasos completados:', state.completedSteps);
    console.log('🎯 Paso actual:', state.currentStep);

    this.steps.forEach((step, index) => {
      //   VERIFICACIÓN ESTRICTA: Solo completado si está en la lista
      step.isCompleted = state.completedSteps &&
                        state.completedSteps.length > 0 &&
                        state.completedSteps.includes(step.stepEnum);

      //   VERIFICACIÓN ESTRICTA: Solo activo si coincide exactamente
      step.isActive = state.currentStep === step.stepEnum;

      console.log(`  Paso ${index + 1} (${step.route}):`, {
        active: step.isActive,
        completed: step.isCompleted,
        stepEnum: step.stepEnum,
        currentStep: state.currentStep
      });
    });

    // 🎯 OVERRIDE: Si estamos en inicio, ningún paso debe estar activo
    if (this.currentRoute === 'inicio') {
      this.steps.forEach(step => {
        step.isActive = false;
      });
      console.log('🏠 En página de inicio - todos los pasos desactivados');
    }
  }

  getCurrentStepTitle(): string {
    const activeStep = this.steps.find(step => step.isActive);
    if (activeStep) {
      return activeStep.title;
    }

    // Fallback basado en la ruta
    switch (this.currentRoute) {
      case 'inicio':
        return 'Bienvenida';
      case 'persona':
        return 'Datos Personales';
      case 'paciente':
        return 'Información Médica';
      case 'expediente':
        return 'Crear Expediente';
      default:
        return 'Nuevo Paciente';
    }
  }

  getProgressPercentage(): number {
    // 🎯 CÁLCULO BASADO EN RUTA ACTUAL Y PASOS COMPLETADOS
    if (this.currentRoute === 'inicio') {
      return 0;
    }

    const totalSteps = 3;
    const completedCount = this.steps.filter(step => step.isCompleted).length;

    // Si hay un paso activo, agregar progreso parcial
    const activeStepIndex = this.steps.findIndex(step => step.isActive);
    const activeProgress = activeStepIndex >= 0 ? 0.3 : 0; // 30% por estar en el paso

    const progress = ((completedCount + activeProgress) / totalSteps) * 100;
    const finalProgress = Math.min(Math.round(progress), 100);

    console.log(`📊 Progreso calculado: ${finalProgress}% (completados: ${completedCount}, activo: ${activeStepIndex >= 0})`);

    return finalProgress;
  }

  getCurrentStepIndex(): number {
    return this.steps.findIndex(step => step.isActive);
  }

  // ==========================================
  // ACCIONES
  // ==========================================

  exitWizard(): void {
    const hasData = this.wizardState && (
      Object.keys(this.wizardState.datosPersona || {}).length > 0 ||
      Object.keys(this.wizardState.datosPaciente || {}).length > 0
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
    // Limpiar estado del wizard al salir
    this.wizardStateService.resetWizard();
    this.router.navigate(['/app/dashboard']);
  }

  isStepClickable(stepIndex: number): boolean {
    // Solo permitir navegar a pasos anteriores completados o al paso actual
    const currentIndex = this.getCurrentStepIndex();
    return stepIndex <= currentIndex || this.steps[stepIndex].isCompleted;
  }

  goToStep(stepIndex: number): void {
    if (!this.isStepClickable(stepIndex)) {
      console.log(`❌ No se puede navegar al paso ${stepIndex + 1}`);
      return;
    }

    const targetStep = this.steps[stepIndex];
    console.log(`🔄 Navegando al paso ${stepIndex + 1}: ${targetStep.title}`);

    // Actualizar estado del wizard
    this.wizardStateService.goToStep(targetStep.stepEnum);
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  setLoadingMessage(message: string): void {
    this.loadingMessage = message;
  }

  get isInMobileView(): boolean {
    return window.innerWidth < 768;
  }

  getFormattedSaveTime(): string {
    if (!this.lastSaved) return 'Sin cambios';

    const now = new Date();
    const diff = now.getTime() - this.lastSaved.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Guardado ahora';
    if (minutes < 60) return `Guardado hace ${minutes}m`;

    return this.lastSaved.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get isLastStep(): boolean {
    return this.getCurrentStepIndex() === this.steps.length - 1;
  }

  get isFirstStep(): boolean {
    return this.getCurrentStepIndex() === 0;
  }

  getCurrentStepShortTitle(): string {
    const currentStep = this.steps.find(step => step.isActive);
    return currentStep?.shortTitle || 'Inicio';
  }

  // ==========================================
  // DEBUG METHODS
  // ==========================================

  debugWizardState(): void {
    console.log('  DEBUG - Estado actual del wizard:', {
      currentRoute: this.currentRoute,
      wizardState: this.wizardState,
      steps: this.steps.map(s => ({
        title: s.title,
        route: s.route,
        active: s.isActive,
        completed: s.isCompleted
      })),
      progress: this.getProgressPercentage()
    });
  }
}
