// src/app/models/wizard.models.ts
import { FormControl, FormGroup } from '@angular/forms';

// ==========================================
// IMPORTAR ENUMS DEL SISTEMA PRINCIPAL
// ==========================================
import { Genero, EstadoCivil } from './base.models';

// ==========================================
// ENUMS ESPECÍFICOS DEL WIZARD
// ==========================================
export enum WizardStep {
  INICIO = 'inicio',
  PERSONA = 'persona',
  PACIENTE = 'paciente',
  EXPEDIENTE = 'expediente',
  DOCUMENTO_CLINICO = 'documento-clinico',
  LLENAR_DOCUMENTO = 'llenar-documento',
  RESUMEN = 'resumen'
}

export enum EstadoWizard {
  INICIANDO = 'iniciando',
  EN_PROGRESO = 'en-progreso',
  VALIDANDO = 'validando',
  COMPLETANDO = 'completando',
  COMPLETADO = 'completado',
  ERROR = 'error'
}

// ==========================================
// RE-EXPORTAR ENUMS PRINCIPALES PARA COMPONENTES
// ==========================================
export { Genero, EstadoCivil };

// ==========================================
// DATOS DEL WIZARD POR PASO
// ==========================================
export interface DatosPersona {
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  genero: Genero; // 🔥 FIX: Usar enum Genero del sistema
  curp: string;
  telefono?: string;
  email?: string; // 🔥 FIX: Frontend usa 'email'
  direccion?: string; // 🔥 FIX: Frontend usa 'direccion'
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  estado_civil?: EstadoCivil; // 🔥 FIX: Usar enum EstadoCivil del sistema
  religion?: string;
}

export interface DatosPaciente {
  id_persona: number; // Se obtiene del paso anterior
  tipo_sangre: string;
  alergias?: string;
  transfusiones: 'Si' | 'No';
  detalles_transfusiones?: string;
  familiar_responsable?: string;
  parentesco_familiar?: string;
  telefono_familiar?: string;
  ocupacion?: string;
  escolaridad?: string;
  lugar_nacimiento?: string;
}

export interface DatosExpediente {
  id_paciente: number; // Se obtiene del paso anterior
  numero_expediente?: string; // Se genera automáticamente
  estado: string;
  notas_administrativas?: string;
  crear_historia_clinica: boolean;
  id_medico_creador?: number;
}

export interface DatosDocumento {
  id_expediente: number; // Se obtiene del paso anterior
  tipo_documento: string;
  subtipo_documento?: string;
  fecha_elaboracion: string;
  observaciones?: string;
  id_medico_creador?: number;
}

// ==========================================
// ESTADO COMPLETO DEL WIZARD
// ==========================================
export interface WizardState {
  // Control del flujo
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  estado: EstadoWizard;

  // Datos de cada paso
  datosPersona: Partial<DatosPersona>;
  datosPaciente: Partial<DatosPaciente>;
  datosExpediente: Partial<DatosExpediente>;
  datosDocumento: Partial<DatosDocumento>;

  // IDs generados en el proceso
  id_persona_creada?: number;
  id_paciente_creado?: number;
  id_expediente_creado?: number;
  id_documento_creado?: number;

  // Control de validaciones
  validationErrors: { [key: string]: string[] };
  isStepValid: { [key in WizardStep]: boolean };

  // Metadatos
  fechaInicio: string;
  ultimaActualizacion: string;
  progreso: number; // Porcentaje 0-100
}

// ==========================================
// NAVEGACIÓN DEL WIZARD
// ==========================================
export interface WizardNavigation {
  currentStepIndex: number;
  totalSteps: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export interface StepInfo {
  step: WizardStep;
  title: string;
  description: string;
  route: string;
  isRequired: boolean;
  isCompleted: boolean;
  isActive: boolean;
  icon?: string;
}

// ==========================================
// RESPUESTAS DE VALIDACIÓN
// ==========================================
export interface StepValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface WizardValidationResult {
  canProceed: boolean;
  stepResults: { [key in WizardStep]: StepValidationResult };
  globalErrors: string[];
}

// ==========================================
// CONFIGURACIÓN DEL WIZARD
// ==========================================
export interface WizardConfig {
  allowBackNavigation: boolean;
  autoSave: boolean;
  showProgress: boolean;
  validateOnStepChange: boolean;
  steps: StepInfo[];
}

// ==========================================
// UTILIDADES DE FORMULARIOS
// ==========================================
export interface WizardFormGroup extends FormGroup {
  controls: { [key: string]: FormControl };
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';
  placeholder?: string;
  required: boolean;
  validators?: any[];
  options?: { value: any; label: string }[];
  description?: string;
  errorMessages?: { [key: string]: string };
}

// ==========================================
// CONSTANTES
// ==========================================
export const WIZARD_STEPS_ORDER: WizardStep[] = [
  WizardStep.INICIO,
  WizardStep.PERSONA,
  WizardStep.PACIENTE,
  WizardStep.EXPEDIENTE,
  WizardStep.DOCUMENTO_CLINICO,
  WizardStep.LLENAR_DOCUMENTO,
  WizardStep.RESUMEN
];

export const STEP_ROUTES: { [key in WizardStep]: string } = {
  [WizardStep.INICIO]: '/app/nuevo-paciente',
  [WizardStep.PERSONA]: '/app/nuevo-paciente/persona',
  [WizardStep.PACIENTE]: '/app/nuevo-paciente/paciente',
  [WizardStep.EXPEDIENTE]: '/app/nuevo-paciente/expediente',
  [WizardStep.DOCUMENTO_CLINICO]: '/app/nuevo-paciente/documento-clinico',
  [WizardStep.LLENAR_DOCUMENTO]: '/app/nuevo-paciente/llenar-documento',
  [WizardStep.RESUMEN]: '/app/nuevo-paciente/resumen'
};

export const STEP_TITLES: { [key in WizardStep]: string } = {
  [WizardStep.INICIO]: 'Iniciar Registro',
  [WizardStep.PERSONA]: 'Datos Personales',
  [WizardStep.PACIENTE]: 'Información Médica',
  [WizardStep.EXPEDIENTE]: 'Crear Expediente',
  [WizardStep.DOCUMENTO_CLINICO]: 'Tipo de Documento',
  [WizardStep.LLENAR_DOCUMENTO]: 'Completar Documento',
  [WizardStep.RESUMEN]: 'Confirmar Registro'
};

// ==========================================
// TIPOS UTILITARIOS
// ==========================================
export type WizardStepData = DatosPersona | DatosPaciente | DatosExpediente | DatosDocumento;
export type WizardFormData = { [key: string]: any };
export type ValidationErrors = { [fieldName: string]: string[] };

// ==========================================
// MAPPER PARA COMPATIBILIDAD CON BACKEND
// ==========================================
export class WizardPersonaMapper {

  /**
   * Convierte DatosPersona del wizard al formato del backend
   */
  static toBackendFormat(datosPersona: DatosPersona) {
    return {
      nombre: datosPersona.nombre,
      apellido_paterno: datosPersona.apellido_paterno,
      apellido_materno: datosPersona.apellido_materno,
      fecha_nacimiento: datosPersona.fecha_nacimiento,
      sexo: datosPersona.genero, // 🔥 MAPEO: genero -> sexo para backend
      estado_civil: datosPersona.estado_civil,
      telefono: datosPersona.telefono,
      correo_electronico: datosPersona.email, // 🔥 MAPEO: email -> correo_electronico para backend
      domicilio: datosPersona.direccion, // 🔥 MAPEO: direccion -> domicilio para backend
      ciudad: datosPersona.ciudad,
      estado: datosPersona.estado,
      codigo_postal: datosPersona.codigo_postal,
      curp: datosPersona.curp,
      religion: datosPersona.religion,
      activo: true
    };
  }

  /**
   * Convierte datos del backend al formato del wizard frontend
   */
  static fromBackendFormat(backendData: any): DatosPersona {
    return {
      nombre: backendData.nombre,
      apellido_paterno: backendData.apellido_paterno,
      apellido_materno: backendData.apellido_materno,
      fecha_nacimiento: backendData.fecha_nacimiento,
      genero: backendData.sexo, // 🔥 MAPEO: sexo -> genero para frontend
      curp: backendData.curp,
      telefono: backendData.telefono,
      email: backendData.correo_electronico, // 🔥 MAPEO: correo_electronico -> email para frontend
      direccion: backendData.domicilio, // 🔥 MAPEO: domicilio -> direccion para frontend
      ciudad: backendData.ciudad,
      estado: backendData.estado,
      codigo_postal: backendData.codigo_postal,
      estado_civil: backendData.estado_civil,
      religion: backendData.religion
    };
  }
}
