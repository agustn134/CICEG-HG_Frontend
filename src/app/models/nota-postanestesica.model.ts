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
  fecha_documento?: string;
  nombre_paciente?: string;
  numero_expediente?: string;
  anestesiologo?: string;
  procedimiento_quirurgico?: string;
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

export interface NotaPostanestesicaFilters extends BaseFilters {
  tipo_anestesia?: string;
  con_complicaciones?: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
  anestesiologo?: number;
  duracion_min?: number;
  duracion_max?: number;
  clasificacion_asa?: ClasificacionASA;
  quirofano?: string;
  con_incidentes?: boolean;
}

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

export interface UpdateNotaPostanestesicaDto extends Partial<CreateNotaPostanestesicaDto> {
  id_nota_postanestesica: number;
}

export interface UpdateNotaPostanestesicaCompletaDto extends Partial<CreateNotaPostanestesicaCompletaDto> {
  id_nota_postanestesica: number;
}
export const CAMPOS_OBLIGATORIOS_NOM004_POSTANESTESICA = [
  'medicamentos_utilizados',           // D11.12
  'duracion_anestesia_minutos',        // D11.13
  'estado_conciencia_egreso',          // D11.16
  'evaluacion_anestesica'              // D11.17
];
export {
  ESCALA_ALDRETE_MAXIMA,
  ESCALA_ALDRETE_MINIMA_EGRESO,
  CLASIFICACIONES_ASA,
  TIPOS_ANESTESIA
} from './shared/constantes-anestesia';
