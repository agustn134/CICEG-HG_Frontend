// src/app/models/nota-postanestesica.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';
import {
  ClasificacionASA,
  TipoAnestesia,
  EstadoRecuperacion,
  ESCALA_ALDRETE_MAXIMA,
  ESCALA_ALDRETE_MINIMA_EGRESO
} from './shared/constantes-anestesia';

export interface NotaPostanestesica extends BaseEntity, AuditInfo {
  id_nota_postanestesica: number;
  id_documento: number;

  // 🔵 TUS CAMPOS EXISTENTES (MANTENER EXACTAMENTE IGUAL)
  tipo_anestesia_utilizada?: string;
  duracion_anestesia_minutos?: number;
  medicamentos_utilizados?: string;
  complicaciones_transanestesicas?: string;
  evaluacion_anestesica: string;
  recuperacion: string;
  complicaciones?: string;
  estado_conciencia_egreso?: string;
  signos_vitales_egreso?: string;
  dolor_postoperatorio?: string;
  tiempo_recuperacion_minutos?: number;
  observaciones?: string;

  // 🔵 TUS CAMPOS DE INFORMACIÓN ADICIONAL (MANTENER IGUAL)
  fecha_documento?: string;
  nombre_paciente?: string;
  numero_expediente?: string;
  anestesiologo?: string;
  procedimiento_quirurgico?: string;

  // 🔥 NUEVOS CAMPOS PARA CUMPLIR NOM-004 (TODOS OPCIONALES)
  fecha_cirugia?: string;
  hora_inicio?: string;
  hora_termino?: string;
  quirofano?: string;
  procedimiento_realizado?: string;
  clasificacion_asa?: ClasificacionASA;

  // Signos vitales específicos al egreso (NOM-004 D11.16)
  presion_arterial_egreso?: string;
  frecuencia_cardiaca_egreso?: number;
  frecuencia_respiratoria_egreso?: number;
  saturacion_oxigeno_egreso?: number;
  temperatura_egreso?: number;

  // Escala Aldrete para evaluación de recuperación
  aldrete_actividad?: number;
  aldrete_respiracion?: number;
  aldrete_circulacion?: number;
  aldrete_conciencia?: number;
  aldrete_saturacion?: number;

  // Balance hídrico específico (NOM-004 D11.15)
  liquidos_administrados?: number; // ml
  sangrado?: number; // ml
  hemoderivados_transfundidos?: string;
  balance_hidrico?: string;

  // Información del personal médico
  id_anestesiologo?: number;
}

// 🔵 TUS FILTROS EXISTENTES (MANTENER IGUAL)
export interface NotaPostanestesicaFilters extends BaseFilters {
  tipo_anestesia?: string;
  con_complicaciones?: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
  anestesiologo?: number;
  duracion_min?: number;
  duracion_max?: number;

  // 🔥 NUEVOS FILTROS OPCIONALES
  clasificacion_asa?: ClasificacionASA;
  quirofano?: string;
  con_incidentes?: boolean;
}

// 🔵 TU DTO DE CREACIÓN EXISTENTE (MANTENER IGUAL)
export interface CreateNotaPostanestesicaDto {
  id_documento: number;
  tipo_anestesia_utilizada?: string;
  duracion_anestesia_minutos?: number;
  medicamentos_utilizados?: string;
  complicaciones_transanestesicas?: string;
  evaluacion_anestesica: string;
  recuperacion: string;
  complicaciones?: string;
  estado_conciencia_egreso?: string;
  signos_vitales_egreso?: string;
  dolor_postoperatorio?: string;
  tiempo_recuperacion_minutos?: number;
  observaciones?: string;
}

// 🔥 NUEVO DTO EXTENDIDO PARA NOM-004 (OPCIONAL)
export interface CreateNotaPostanestesicaCompletaDto extends CreateNotaPostanestesicaDto {
  fecha_cirugia?: string;
  hora_inicio?: string;
  hora_termino?: string;
  quirofano?: string;
  procedimiento_realizado?: string;
  clasificacion_asa?: ClasificacionASA;
  presion_arterial_egreso?: string;
  frecuencia_cardiaca_egreso?: number;
  frecuencia_respiratoria_egreso?: number;
  saturacion_oxigeno_egreso?: number;
  temperatura_egreso?: number;
  aldrete_actividad?: number;
  aldrete_respiracion?: number;
  aldrete_circulacion?: number;
  aldrete_conciencia?: number;
  aldrete_saturacion?: number;
  liquidos_administrados?: number;
  sangrado?: number;
  hemoderivados_transfundidos?: string;
  balance_hidrico?: string;
  id_anestesiologo?: number;
}

// 🔵 TU DTO DE ACTUALIZACIÓN EXISTENTE (MANTENER IGUAL)
export interface UpdateNotaPostanestesicaDto extends Partial<CreateNotaPostanestesicaDto> {
  id_nota_postanestesica: number;
}

// 🔥 NUEVO DTO DE ACTUALIZACIÓN COMPLETO (OPCIONAL)
export interface UpdateNotaPostanestesicaCompletaDto extends Partial<CreateNotaPostanestesicaCompletaDto> {
  id_nota_postanestesica: number;
}

// 🔥 CONSTANTES ESPECÍFICAS PARA POSTANESTÉSICA (sin conflictos)
export const CAMPOS_OBLIGATORIOS_NOM004_POSTANESTESICA = [
  'medicamentos_utilizados',           // D11.12
  'duracion_anestesia_minutos',        // D11.13
  'estado_conciencia_egreso',          // D11.16
  'evaluacion_anestesica'              // D11.17
];

// Re-exportar constantes compartidas para comodidad
export {
  ESCALA_ALDRETE_MAXIMA,
  ESCALA_ALDRETE_MINIMA_EGRESO,
  CLASIFICACIONES_ASA,
  TIPOS_ANESTESIA
} from './shared/constantes-anestesia';
