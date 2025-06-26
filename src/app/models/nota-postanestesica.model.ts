import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

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

  // Información adicional del documento
  fecha_documento?: string;
  nombre_paciente?: string;
  numero_expediente?: string;
  anestesiologo?: string;
  procedimiento_quirurgico?: string;
}

export interface NotaPostanestesicaFilters extends BaseFilters {
  tipo_anestesia?: string;
  con_complicaciones?: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
  anestesiologo?: number;
  duracion_min?: number;
  duracion_max?: number;
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

export interface UpdateNotaPostanestesicaDto extends Partial<CreateNotaPostanestesicaDto> {
  id_nota_postanestesica: number;
}
