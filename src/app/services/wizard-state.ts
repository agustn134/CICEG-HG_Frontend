// C:\CICEG-HG-APP\src\app\services\wizard-state.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Router } from '@angular/router';
import {
  WizardState,
  WizardStep,
  EstadoWizard,
  WizardNavigation,
  StepValidationResult,
  WizardValidationResult,
  DatosPersona,
  DatosPaciente,
  DatosExpediente,
  DatosDocumento,
  WIZARD_STEPS_ORDER,
  STEP_ROUTES,
  STEP_TITLES
} from '../models/wizard.models';

@Injectable({
  providedIn: 'root'
})
export class WizardStateService {

  // ==========================================
  // ESTADO INICIAL DEL WIZARD
  // ==========================================
  private readonly initialState: WizardState = {
    currentStep: WizardStep.INICIO,
    completedSteps: [],
    estado: EstadoWizard.INICIANDO,

    datosPersona: {},
    datosPaciente: {},
    datosExpediente: {},
    datosDocumento: {},

    validationErrors: {},
    isStepValid: {
      [WizardStep.INICIO]: false,
      [WizardStep.PERSONA]: false,
      [WizardStep.PACIENTE]: false,
      [WizardStep.EXPEDIENTE]: false,
      [WizardStep.DOCUMENTO_CLINICO]: false,
      [WizardStep.LLENAR_DOCUMENTO]: false,
      [WizardStep.RESUMEN]: false
    },

    fechaInicio: new Date().toISOString(),
    ultimaActualizacion: new Date().toISOString(),
    progreso: 0
  };

  // ==========================================
  // SUBJECTS Y OBSERVABLES
  // ==========================================
  private wizardState$ = new BehaviorSubject<WizardState>(this.initialState);
  private loading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);

  constructor(private router: Router) {
    // Restaurar estado si existe en sessionStorage
    this.loadStateFromStorage();
  }

  // ==========================================
  // GETTERS PARA OBSERVABLES
  // ==========================================

  /** Estado completo del wizard */
  getState(): Observable<WizardState> {
    return this.wizardState$.asObservable();
  }

  /** Estado actual sin observable */
  getCurrentState(): WizardState {
    return this.wizardState$.value;
  }

  /** Información de navegación */
  getNavigation(): Observable<WizardNavigation> {
    return this.wizardState$.pipe(
      map(state => this.calculateNavigation(state))
    );
  }

  /** Paso actual */
  getCurrentStep(): Observable<WizardStep> {
    return this.wizardState$.pipe(map(state => state.currentStep));
  }

  /** Progreso del wizard (0-100) */
  getProgress(): Observable<number> {
    return this.wizardState$.pipe(map(state => state.progreso));
  }

  /** Estado de carga */
  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  /** Errores */
  getError(): Observable<string | null> {
    return this.error$.asObservable();
  }

  // ==========================================
  // NAVEGACIÓN ENTRE PASOS
  // ==========================================

  /** Ir al siguiente paso */
  goToNextStep(): void {
    const currentState = this.getCurrentState();
    const currentIndex = WIZARD_STEPS_ORDER.indexOf(currentState.currentStep);

    if (currentIndex < WIZARD_STEPS_ORDER.length - 1) {
      const nextStep = WIZARD_STEPS_ORDER[currentIndex + 1];
      this.goToStep(nextStep);
    }
  }

  /** Ir al paso anterior */
  goToPreviousStep(): void {
    const currentState = this.getCurrentState();
    const currentIndex = WIZARD_STEPS_ORDER.indexOf(currentState.currentStep);

    if (currentIndex > 0) {
      const previousStep = WIZARD_STEPS_ORDER[currentIndex - 1];
      this.goToStep(previousStep);
    }
  }

  /** Ir a un paso específico */
  goToStep(step: WizardStep): void {
    const newState = {
      ...this.getCurrentState(),
      currentStep: step,
      ultimaActualizacion: new Date().toISOString()
    };

    this.updateState(newState);
    this.router.navigate([STEP_ROUTES[step]]);
  }

  /** Marcar paso como completado */
  markStepAsCompleted(step: WizardStep): void {
    const currentState = this.getCurrentState();

    if (!currentState.completedSteps.includes(step)) {
      const newState = {
        ...currentState,
        completedSteps: [...currentState.completedSteps, step],
        isStepValid: { ...currentState.isStepValid, [step]: true },
        progreso: this.calculateProgress([...currentState.completedSteps, step]),
        ultimaActualizacion: new Date().toISOString()
      };

      this.updateState(newState);
    }
  }

  // ==========================================
  // ACTUALIZACIÓN DE DATOS POR PASO
  // ==========================================

  /** Actualizar datos del paso Persona */
  updatePersonaData(data: Partial<DatosPersona>): void {
    const newState = {
      ...this.getCurrentState(),
      datosPersona: { ...this.getCurrentState().datosPersona, ...data },
      ultimaActualizacion: new Date().toISOString()
    };
    this.updateState(newState);
  }

  /** Actualizar datos del paso Paciente */
  updatePacienteData(data: Partial<DatosPaciente>): void {
    const newState = {
      ...this.getCurrentState(),
      datosPaciente: { ...this.getCurrentState().datosPaciente, ...data },
      ultimaActualizacion: new Date().toISOString()
    };
    this.updateState(newState);
  }

  /** Actualizar datos del paso Expediente */
  updateExpedienteData(data: Partial<DatosExpediente>): void {
    const newState = {
      ...this.getCurrentState(),
      datosExpediente: { ...this.getCurrentState().datosExpediente, ...data },
      ultimaActualizacion: new Date().toISOString()
    };
    this.updateState(newState);
  }

  /** Actualizar datos del paso Documento */
  updateDocumentoData(data: Partial<DatosDocumento>): void {
    const newState = {
      ...this.getCurrentState(),
      datosDocumento: { ...this.getCurrentState().datosDocumento, ...data },
      ultimaActualizacion: new Date().toISOString()
    };
    this.updateState(newState);
  }

  // ==========================================
  // 🔥 FIX: MÉTODOS PARA IDs GENERADOS
  // ==========================================

  /** Establecer IDs generados durante el proceso */
  setGeneratedIds(ids: {
    id_persona?: number;
    id_paciente?: number;
    id_expediente?: number;
    id_documento?: number;
  }): void {
    const newState = {
      ...this.getCurrentState(),
      id_persona_creada: ids.id_persona || this.getCurrentState().id_persona_creada,
      id_paciente_creado: ids.id_paciente || this.getCurrentState().id_paciente_creado,
      id_expediente_creado: ids.id_expediente || this.getCurrentState().id_expediente_creado,
      id_documento_creado: ids.id_documento || this.getCurrentState().id_documento_creado,
      ultimaActualizacion: new Date().toISOString()
    };
    this.updateState(newState);
  }

  /** 🔥 ALIAS para compatibilidad - ahora usa setGeneratedIds */
  updateIds(ids: {
    id_persona?: number;
    id_paciente?: number;
    id_expediente?: number;
    id_documento?: number;
  }): void {
    this.setGeneratedIds(ids);
  }

  // ==========================================
  // VALIDACIONES
  // ==========================================

  /** Validar un paso específico */
  validateStep(step: WizardStep): StepValidationResult {
    const state = this.getCurrentState();

    switch (step) {
      case WizardStep.PERSONA:
        return this.validatePersonaStep(state.datosPersona);

      case WizardStep.PACIENTE:
        return this.validatePacienteStep(state.datosPaciente);

      case WizardStep.EXPEDIENTE:
        return this.validateExpedienteStep(state.datosExpediente);

      case WizardStep.DOCUMENTO_CLINICO:
        return this.validateDocumentoStep(state.datosDocumento);

      default:
        return { isValid: true, errors: [], warnings: [] };
    }
  }

  /** Validar todo el wizard */
  validateWizard(): WizardValidationResult {
    const state = this.getCurrentState();
    const stepResults = {
      [WizardStep.INICIO]: { isValid: true, errors: [], warnings: [] },
      [WizardStep.PERSONA]: this.validatePersonaStep(state.datosPersona),
      [WizardStep.PACIENTE]: this.validatePacienteStep(state.datosPaciente),
      [WizardStep.EXPEDIENTE]: this.validateExpedienteStep(state.datosExpediente),
      [WizardStep.DOCUMENTO_CLINICO]: this.validateDocumentoStep(state.datosDocumento),
      [WizardStep.LLENAR_DOCUMENTO]: { isValid: true, errors: [], warnings: [] },
      [WizardStep.RESUMEN]: { isValid: true, errors: [], warnings: [] }
    };

    const canProceed = Object.values(stepResults).every(result => result.isValid);
    const globalErrors: string[] = [];

    if (!state.id_persona_creada) {
      globalErrors.push('Debe completar el registro de la persona');
    }

    return { canProceed, stepResults, globalErrors };
  }

  // ==========================================
  // CONTROL DE ESTADO DEL WIZARD
  // ==========================================

  /** Reiniciar wizard */
  resetWizard(): void {
    this.clearStorageState();
    this.updateState(this.initialState);
    this.router.navigate([STEP_ROUTES[WizardStep.INICIO]]);
  }

  /** Establecer estado de carga */
  setLoading(loading: boolean): void {
    this.loading$.next(loading);
  }

  /** Establecer error */
  setError(error: string | null): void {
    this.error$.next(error);
  }

  /** Establecer estado del wizard */
  setWizardEstado(estado: EstadoWizard): void {
    const newState = {
      ...this.getCurrentState(),
      estado,
      ultimaActualizacion: new Date().toISOString()
    };
    this.updateState(newState);
  }

  // ==========================================
  // MÉTODOS PRIVADOS
  // ==========================================

  private updateState(newState: WizardState): void {
    this.wizardState$.next(newState);
    this.saveStateToStorage();
  }

  private calculateNavigation(state: WizardState): WizardNavigation {
    const currentIndex = WIZARD_STEPS_ORDER.indexOf(state.currentStep);

    return {
      currentStepIndex: currentIndex,
      totalSteps: WIZARD_STEPS_ORDER.length,
      canGoNext: currentIndex < WIZARD_STEPS_ORDER.length - 1,
      canGoPrevious: currentIndex > 0,
      isFirstStep: currentIndex === 0,
      isLastStep: currentIndex === WIZARD_STEPS_ORDER.length - 1
    };
  }

  private calculateProgress(completedSteps: WizardStep[]): number {
    return Math.round((completedSteps.length / WIZARD_STEPS_ORDER.length) * 100);
  }

  // ==========================================
  // 🔥 FIX: VALIDACIONES CORREGIDAS
  // ==========================================

  private validatePersonaStep(data: Partial<DatosPersona>): StepValidationResult {
    const errors: string[] = [];

    if (!data.nombre?.trim()) errors.push('El nombre es obligatorio');
    if (!data.apellido_paterno?.trim()) errors.push('El apellido paterno es obligatorio');
    if (!data.fecha_nacimiento) errors.push('La fecha de nacimiento es obligatoria');
    if (!data.genero) errors.push('El género es obligatorio'); // 🔥 FIX: data.genero en lugar de data.sexo
    if (!data.curp?.trim()) errors.push('La CURP es obligatoria');
    else if (!this.validateCURP(data.curp)) errors.push('La CURP no tiene el formato correcto');

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  private validatePacienteStep(data: Partial<DatosPaciente>): StepValidationResult {
    const errors: string[] = [];

    if (!data.tipo_sangre) errors.push('El tipo de sangre es obligatorio');
    if (!data.transfusiones) errors.push('Debe especificar si ha tenido transfusiones');
    if (data.transfusiones === 'Si' && !data.detalles_transfusiones?.trim()) {
      errors.push('Debe especificar los detalles de las transfusiones');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  private validateExpedienteStep(data: Partial<DatosExpediente>): StepValidationResult {
    const errors: string[] = [];

    if (!data.estado) errors.push('El estado del expediente es obligatorio');

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  private validateDocumentoStep(data: Partial<DatosDocumento>): StepValidationResult {
    const errors: string[] = [];

    if (!data.tipo_documento) errors.push('El tipo de documento es obligatorio');
    if (!data.fecha_elaboracion) errors.push('La fecha de elaboración es obligatoria');

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  private validateCURP(curp: string): boolean {
    const curpRegex = /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/;
    return curpRegex.test(curp);
  }

  // ==========================================
  // PERSISTENCIA EN STORAGE
  // ==========================================

  private saveStateToStorage(): void {
    try {
      const state = this.getCurrentState();
      sessionStorage.setItem('wizardState', JSON.stringify(state));
    } catch (error) {
      console.warn('No se pudo guardar el estado del wizard:', error);
    }
  }

  private loadStateFromStorage(): void {
    try {
      const savedState = sessionStorage.getItem('wizardState');
      if (savedState) {
        const state = JSON.parse(savedState) as WizardState;
        this.wizardState$.next(state);
      }
    } catch (error) {
      console.warn('No se pudo cargar el estado del wizard:', error);
    }
  }

  private clearStorageState(): void {
    try {
      sessionStorage.removeItem('wizardState');
    } catch (error) {
      console.warn('No se pudo limpiar el estado del wizard:', error);
    }
  }

  // ==========================================
  // GETTERS DE UTILIDAD
  // ==========================================

  /** Obtener título del paso actual */
  getCurrentStepTitle(): string {
    const step = this.getCurrentState().currentStep;
    return STEP_TITLES[step] || 'Nuevo Paciente';
  }

  /** Verificar si puede navegar al siguiente paso */
  canNavigateNext(): boolean {
    const state = this.getCurrentState();
    const navigation = this.calculateNavigation(state);
    const stepValidation = this.validateStep(state.currentStep);

    return navigation.canGoNext && stepValidation.isValid;
  }

  /** Verificar si puede navegar al paso anterior */
  canNavigatePrevious(): boolean {
    const state = this.getCurrentState();
    const navigation = this.calculateNavigation(state);

    return navigation.canGoPrevious;
  }
}
