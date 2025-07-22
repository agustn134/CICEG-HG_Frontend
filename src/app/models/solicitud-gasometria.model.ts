// src/app/models/solicitud-gasometria.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface SolicitudGasometria extends BaseEntity, AuditInfo {
  id_solicitud_gasometria: number;
  id_documento: number;
  id_expediente: number;
  id_paciente: number;
  id_medico_solicita: number;

  // Información de la solicitud
  tipo_muestra: TipoMuestraGasometria;
  sitio_puncion?: string;
  indicacion_clinica: string;
  diagnostico_presuntivo: string;

  // Datos del paciente al momento de la toma
  temperatura_paciente?: number;
  fio2?: number; // Fracción inspirada de oxígeno (0.21-1.0)
  tipo_oxigenoterapia?: TipoOxigenoterapia;
  flujo_oxigeno?: number; // Litros por minuto
  presion_atmosferica?: number;

  // Información clínica adicional
  estado_ventilatorio?: EstadoVentilatorio;
  estado_hemodinamico?: string;
  medicamentos_actuales?: string;
  datos_clinicos_relevantes?: string;

  // Control de la muestra
  fecha_toma: string;
  hora_toma: string;
  fecha_procesamiento?: string;
  tiempo_transporte_minutos?: number;
  conservacion_muestra?: string;

  // Urgencia y prioridad
  urgente: boolean;
  motivo_urgencia?: string;
  prioridad: PrioridadGasometria;

  // Estado del proceso
  estado_solicitud: EstadoSolicitud;
  rechazada?: boolean;
  motivo_rechazo?: string;

  // Resultados
  resultados?: ResultadosGasometria;
  interpretacion?: InterpretacionGasometria;

  // Personal involucrado
  id_personal_toma?: number;
  id_personal_laboratorio?: number;
  observaciones_laboratorio?: string;
}

export type TipoMuestraGasometria =
  | 'ARTERIAL'
  | 'VENOSA'
  | 'VENOSA_CENTRAL'
  | 'VENOSA_MIXTA'
  | 'CAPILAR';

export type TipoOxigenoterapia =
  | 'AIRE_AMBIENTE'
  | 'CANULA_NASAL'
  | 'MASCARILLA_SIMPLE'
  | 'MASCARILLA_RESERVORIO'
  | 'MASCARILLA_VENTURI'
  | 'VENTILACION_MECANICA'
  | 'CPAP'
  | 'BIPAP';

export type EstadoVentilatorio =
  | 'ESPONTANEO'
  | 'VENTILACION_MECANICA'
  | 'VENTILACION_NO_INVASIVA'
  | 'RESPIRACION_ASISTIDA';

export type PrioridadGasometria =
  | 'RUTINA'
  | 'URGENTE'
  | 'STAT'
  | 'CRITICA';

export type EstadoSolicitud =
  | 'SOLICITADO'
  | 'TOMA_PROGRAMADA'
  | 'MUESTRA_TOMADA'
  | 'EN_PROCESO'
  | 'COMPLETADO'
  | 'RECHAZADO'
  | 'CANCELADO';

export interface ResultadosGasometria {
  // Parámetros básicos
  ph?: number;
  pco2?: number; // mmHg
  po2?: number; // mmHg
  hco3_actual?: number; // mEq/L
  hco3_std?: number; // mEq/L
  exceso_base?: number; // mEq/L

  // Oxigenación
  saturacion_o2?: number; // %
  contenido_o2?: number; // vol%
  p50?: number;
  fraccion_shunt?: number;

  // Electrolitos
  sodio?: number; // mEq/L
  potasio?: number; // mEq/L
  cloro?: number; // mEq/L
  calcio_ionico?: number; // mmol/L

  // Metabolismo
  glucosa?: number; // mg/dL
  lactato?: number; // mmol/L
  creatinina?: number; // mg/dL
  urea?: number; // mg/dL

  // Parámetros calculados
  anion_gap?: number;
  osmolalidad?: number;
  diferencia_alveolo_arterial?: number;
  relacion_pao2_fio2?: number;

  // Hemoglobina
  hemoglobina?: number; // g/dL
  hematocrito?: number; // %
  carboxihemoglobina?: number; // %
  metahemoglobina?: number; // %

  // Control de calidad
  temperatura_muestra?: number;
  tiempo_analisis_minutos?: number;
  observaciones_tecnicas?: string;
}

export interface InterpretacionGasometria {
  estado_acido_base: EstadoAcidoBase;
  compensacion?: TipoCompensacion;
  estado_oxigenacion: EstadoOxigenacion;
  alteraciones_electroliticas?: string[];
  alteraciones_metabolicas?: string[];
  interpretacion_clinica?: string;
  recomendaciones?: string[];
}

export type EstadoAcidoBase =
  | 'NORMAL'
  | 'ACIDOSIS_METABOLICA'
  | 'ACIDOSIS_RESPIRATORIA'
  | 'ALCALOSIS_METABOLICA'
  | 'ALCALOSIS_RESPIRATORIA'
  | 'TRASTORNO_MIXTO';

export type TipoCompensacion =
  | 'NO_COMPENSADO'
  | 'PARCIALMENTE_COMPENSADO'
  | 'COMPLETAMENTE_COMPENSADO'
  | 'SOBRECOMPENSADO';

export type EstadoOxigenacion =
  | 'NORMAL'
  | 'HIPOXEMIA_LEVE'
  | 'HIPOXEMIA_MODERADA'
  | 'HIPOXEMIA_SEVERA'
  | 'HIPEROXEMIA';

export interface CreateSolicitudGasometriaDto {
  id_documento: number;
  id_expediente: number;
  id_paciente: number;
  id_medico_solicita: number;
  tipo_muestra: TipoMuestraGasometria;
  sitio_puncion?: string;
  indicacion_clinica: string;
  diagnostico_presuntivo: string;
  temperatura_paciente?: number;
  fio2?: number;
  tipo_oxigenoterapia?: TipoOxigenoterapia;
  flujo_oxigeno?: number;
  estado_ventilatorio?: EstadoVentilatorio;
  fecha_toma?: string;
  hora_toma?: string;
  urgente: boolean;
  motivo_urgencia?: string;
  prioridad: PrioridadGasometria;
  datos_clinicos_relevantes?: string;
}

export interface SolicitudGasometriaFilters extends BaseFilters {
  tipo_muestra?: TipoMuestraGasometria;
  estado_solicitud?: EstadoSolicitud;
  prioridad?: PrioridadGasometria;
  urgente?: boolean;
  fecha_desde?: string;
  fecha_hasta?: string;
  con_resultados?: boolean;
  estado_acido_base?: EstadoAcidoBase;
}
