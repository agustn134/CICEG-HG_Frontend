// src/app/models/control-crecimiento.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface ControlCrecimiento extends BaseEntity, AuditInfo {
  id_control_crecimiento: number;
  id_expediente: number;
  id_paciente: number;
  id_personal_medico: number;

  // Datos del control
  fecha_control: string;
  edad_meses: number;
  edad_cronologica: string;

  // Medidas antropométricas
  peso: number;
  talla: number;
  perimetro_cefalico?: number;
  perimetro_toracico?: number;
  perimetro_abdominal?: number;
  indice_masa_corporal?: number;

  // Percentiles
  percentil_peso?: number;
  percentil_talla?: number;
  percentil_perimetro_cefalico?: number;
  percentil_imc?: number;

  // Evaluación del desarrollo
  desarrollo_psicomotor?: string;
  hitos_desarrollo?: string;
  desarrollo_motor?: string;
  desarrollo_cognitivo?: string;
  desarrollo_social?: string;
  desarrollo_lenguaje?: string;

  // Alimentación
  alimentacion_actual?: string;
  tipo_lactancia?: 'MATERNA' | 'ARTIFICIAL' | 'MIXTA' | 'NINGUNA';
  ablactacion?: string;

  // Vacunación
  esquema_vacunacion_completo?: boolean;
  vacunas_pendientes?: string;
  proxima_vacuna?: string;

  // Observaciones y plan
  signos_alarma?: string;
  observaciones?: string;
  recomendaciones?: string;
  proxima_cita?: string;
  frecuencia_controles?: string;
}

export interface CreateControlCrecimientoDto {
  id_expediente: number;
  id_paciente: number;
  id_personal_medico: number;
  fecha_control?: string;
  edad_meses: number;
  peso: number;
  talla: number;
  perimetro_cefalico?: number;
  perimetro_toracico?: number;
  perimetro_abdominal?: number;
  desarrollo_psicomotor?: string;
  hitos_desarrollo?: string;
  alimentacion_actual?: string;
  tipo_lactancia?: 'MATERNA' | 'ARTIFICIAL' | 'MIXTA' | 'NINGUNA';
  ablactacion?: string;
  esquema_vacunacion_completo?: boolean;
  vacunas_pendientes?: string;
  signos_alarma?: string;
  observaciones?: string;
  recomendaciones?: string;
  proxima_cita?: string;
}

export interface ControlCrecimientoFilters extends BaseFilters {
  edad_minima?: number;
  edad_maxima?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  desarrollo_normal?: boolean;
  vacunacion_completa?: boolean;
}
