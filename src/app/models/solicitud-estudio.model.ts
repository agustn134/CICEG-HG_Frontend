// import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// export interface SolicitudEstudio extends BaseEntity, AuditInfo {
//   id_solicitud: number;
//   id_documento: number;
//   id_estudio: number;
//   justificacion: string;
//   preparacion_requerida?: string;
//   fecha_solicitada: string; // Cambié de Date a string
//   fecha_programada?: string;
//   fecha_realizada?: string;
//   prioridad: 'Urgente' | 'Normal';
//   estado: 'Solicitado' | 'Programado' | 'En proceso' | 'Completado' | 'Cancelado';
//   observaciones?: string;
//   resultado?: string;
//   interpretacion?: string;

//   // Información del estudio
//   nombre_estudio?: string;
//   tipo_estudio?: string;
//   clave_estudio?: string;
//   requiere_ayuno?: boolean;
//   tiempo_resultado_horas?: number;

//   // Información adicional del documento
//   fecha_documento?: string;
//   nombre_paciente?: string;
//   numero_expediente?: string;
//   medico_solicitante?: string;
// }

// export interface SolicitudEstudioFilters extends BaseFilters {
//   id_estudio?: number;
//   prioridad?: string;
//   estado?: string;
//   fecha_solicitada_inicio?: string;
//   fecha_solicitada_fin?: string;
//   tipo_estudio?: string;
//   medico_solicitante?: number;
//   con_resultado?: boolean;
// }

// export interface CreateSolicitudEstudioDto {
//   id_documento: number;
//   id_estudio: number;
//   justificacion: string;
//   preparacion_requerida?: string;
//   fecha_solicitada?: string; // Si no se proporciona, usa fecha actual
//   fecha_programada?: string;
//   prioridad?: 'Urgente' | 'Normal';
//   estado?: string;
//   observaciones?: string;
// }

// export interface UpdateSolicitudEstudioDto extends Partial<CreateSolicitudEstudioDto> {
//   id_solicitud: number;
//   fecha_realizada?: string;
//   resultado?: string;
//   interpretacion?: string;
// }




// src/app/models/solicitud-estudio.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface SolicitudEstudio extends BaseEntity, AuditInfo {
  id_solicitud_estudio: number;
  id_documento: number;
  id_expediente: number;
  id_paciente: number;
  id_personal_medico: number;

  // Información del estudio
  tipo_estudio: TipoEstudioSolicitud;
  estudios_solicitados: string;
  indicacion_clinica: string;
  datos_clinicos_relevantes?: string;
  diagnostico_presuntivo?: string;

  // Detalles de la solicitud
  urgencia_estudio: 'rutina' | 'urgente' | 'stat';
  preparacion_requerida?: string;
  fecha_solicitud: string;
  fecha_programada?: string;

  // Estado y seguimiento
  estado: EstadoSolicitud;
  observaciones?: string;
  resultado?: string;
  fecha_resultado?: string;
  interpretacion?: string;
}

export type TipoEstudioSolicitud =
  | 'LABORATORIO'
  | 'RADIOLOGIA'
  | 'ULTRASONIDO'
  | 'TOMOGRAFIA'
  | 'RESONANCIA'
  | 'ENDOSCOPIA'
  | 'ELECTROCARDIOGRAMA'
  | 'ELECTROENCEFALOGRAMA'
  | 'BIOPSIA'
  | 'OTROS';

export type EstadoSolicitud =
  | 'SOLICITADO'
  | 'PROGRAMADO'
  | 'EN_PROCESO'
  | 'COMPLETADO'
  | 'CANCELADO';

export interface CreateSolicitudEstudioDto {
  id_documento: number;
  id_expediente: number;
  id_paciente: number;
  id_personal_medico: number;
  tipo_estudio: TipoEstudioSolicitud;
  estudios_solicitados: string;
  indicacion_clinica: string;
  datos_clinicos_relevantes?: string;
  diagnostico_presuntivo?: string;
  urgencia_estudio?: 'rutina' | 'urgente' | 'stat';
  preparacion_requerida?: string;
  fecha_solicitud?: string;
  observaciones?: string;
}

export interface SolicitudEstudioFilters extends BaseFilters {
  tipo_estudio?: TipoEstudioSolicitud;
  estado?: EstadoSolicitud;
  urgencia?: 'rutina' | 'urgente' | 'stat';
  fecha_desde?: string;
  fecha_hasta?: string;
  id_medico?: number;
}

