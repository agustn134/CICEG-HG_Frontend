// import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// export interface ReferenciaTraslado extends BaseEntity, AuditInfo {
//   id_referencia_traslado: number;
//   id_documento: number;
//   institucion_destino: string;
//   servicio_destino?: string;
//   motivo_traslado: string;
//   id_guia_diagnostico?: number;
//   condiciones_traslado: string;
//   urgencia_traslado?: 'Urgente' | 'Programado' | 'Electivo';
//   medio_transporte?: 'Ambulancia' | 'Helicóptero' | 'Terrestre' | 'Particular';
//   acompañamiento_medico?: boolean;
//   resumen_clinico?: string;
//   estudios_enviados?: string;
//   medicamentos_enviados?: string;
//   fecha_traslado?: string;
//   hora_traslado?: string;
//   medico_referente?: string;
//   telefono_contacto?: string;
//   observaciones?: string;

//   // Información adicional del documento
//   fecha_documento?: string;
//   nombre_paciente?: string;
//   numero_expediente?: string;
//   institucion_origen?: string;
//   guia_clinica_nombre?: string;
//   guia_clinica_codigo?: string;
// }

// export interface ReferenciaTrasladoFilters extends BaseFilters {
//   institucion_destino?: string;
//   urgencia_traslado?: string;
//   medio_transporte?: string;
//   fecha_traslado_inicio?: string;
//   fecha_traslado_fin?: string;
//   con_acompañamiento_medico?: boolean;
// }

// export interface CreateReferenciaTrasladoDto {
//   id_documento: number;
//   institucion_destino: string;
//   servicio_destino?: string;
//   motivo_traslado: string;
//   id_guia_diagnostico?: number;
//   condiciones_traslado: string;
//   urgencia_traslado?: string;
//   medio_transporte?: string;
//   acompañamiento_medico?: boolean;
//   resumen_clinico?: string;
//   estudios_enviados?: string;
//   medicamentos_enviados?: string;
//   fecha_traslado?: string;
//   hora_traslado?: string;
//   medico_referente?: string;
//   telefono_contacto?: string;
//   observaciones?: string;
// }

// export interface UpdateReferenciaTrasladoDto extends Partial<CreateReferenciaTrasladoDto> {
//   id_referencia_traslado: number;
// }
// src/app/models/referencia-traslado.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface ReferenciaTraslado extends BaseEntity, AuditInfo {
  id_referencia_traslado: number;
  id_documento: number;
  id_expediente: number;
  id_paciente: number;
  id_personal_medico: number;

  // Información de origen y destino
  institucion_origen: string;
  institucion_destino: string;
  medico_destino?: string;
  especialidad_destino?: string;

  // Detalles del traslado
  motivo_referencia: string;
  tipo_referencia: TipoReferencia;
  urgencia_traslado: 'baja' | 'media' | 'alta' | 'critica';
  medio_transporte?: string;

  // Información clínica
  estado_paciente: string;
  resumen_caso: string;
  diagnostico_actual: string;
  tratamiento_actual?: string;
  estudios_realizados?: string;
  datos_clinicos_relevantes?: string;

  // Contacto y seguimiento
  contacto_institucion?: string;
  fecha_referencia: string;
  fecha_respuesta?: string;
  aceptado?: boolean;
  observaciones?: string;
  recomendaciones?: string;
}

export type TipoReferencia =
  | 'INTERCONSULTA'
  | 'TRASLADO_DEFINITIVO'
  | 'SEGUNDA_OPINION'
  | 'PROCEDIMIENTO_ESPECIAL'
  | 'NIVEL_SUPERIOR'
  | 'REHABILITACION';

export interface CreateReferenciaTraladoDto {
  id_documento: number;
  id_expediente: number;
  id_paciente: number;
  id_personal_medico: number;
  institucion_origen: string;
  institucion_destino: string;
  medico_destino?: string;
  especialidad_destino?: string;
  motivo_referencia: string;
  tipo_referencia: TipoReferencia;
  urgencia_traslado: 'baja' | 'media' | 'alta' | 'critica';
  medio_transporte?: string;
  estado_paciente: string;
  resumen_caso: string;
  diagnostico_actual: string;
  tratamiento_actual?: string;
  estudios_realizados?: string;
  datos_clinicos_relevantes?: string;
  contacto_institucion?: string;
  fecha_referencia?: string;
  observaciones?: string;
}

export interface ReferenciaTrasladoFilters extends BaseFilters {
  tipo_referencia?: TipoReferencia;
  urgencia?: 'baja' | 'media' | 'alta' | 'critica';
  institucion_destino?: string;
  aceptado?: boolean;
  fecha_desde?: string;
  fecha_hasta?: string;
}
