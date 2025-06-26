import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface SolicitudEstudio extends BaseEntity, AuditInfo {
  id_solicitud: number;
  id_documento: number;
  id_estudio: number;
  justificacion: string;
  preparacion_requerida?: string;
  fecha_solicitada: string; // Cambié de Date a string
  fecha_programada?: string;
  fecha_realizada?: string;
  prioridad: 'Urgente' | 'Normal';
  estado: 'Solicitado' | 'Programado' | 'En proceso' | 'Completado' | 'Cancelado';
  observaciones?: string;
  resultado?: string;
  interpretacion?: string;

  // Información del estudio
  nombre_estudio?: string;
  tipo_estudio?: string;
  clave_estudio?: string;
  requiere_ayuno?: boolean;
  tiempo_resultado_horas?: number;

  // Información adicional del documento
  fecha_documento?: string;
  nombre_paciente?: string;
  numero_expediente?: string;
  medico_solicitante?: string;
}

export interface SolicitudEstudioFilters extends BaseFilters {
  id_estudio?: number;
  prioridad?: string;
  estado?: string;
  fecha_solicitada_inicio?: string;
  fecha_solicitada_fin?: string;
  tipo_estudio?: string;
  medico_solicitante?: number;
  con_resultado?: boolean;
}

export interface CreateSolicitudEstudioDto {
  id_documento: number;
  id_estudio: number;
  justificacion: string;
  preparacion_requerida?: string;
  fecha_solicitada?: string; // Si no se proporciona, usa fecha actual
  fecha_programada?: string;
  prioridad?: 'Urgente' | 'Normal';
  estado?: string;
  observaciones?: string;
}

export interface UpdateSolicitudEstudioDto extends Partial<CreateSolicitudEstudioDto> {
  id_solicitud: number;
  fecha_realizada?: string;
  resultado?: string;
  interpretacion?: string;
}
