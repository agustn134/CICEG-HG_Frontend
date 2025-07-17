import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface ReferenciaTraslado extends BaseEntity, AuditInfo {
  id_referencia_traslado: number;
  id_documento: number;
  institucion_destino: string;
  servicio_destino?: string;
  motivo_traslado: string;
  id_guia_diagnostico?: number;
  condiciones_traslado: string;
  urgencia_traslado?: 'Urgente' | 'Programado' | 'Electivo';
  medio_transporte?: 'Ambulancia' | 'Helicóptero' | 'Terrestre' | 'Particular';
  acompañamiento_medico?: boolean;
  resumen_clinico?: string;
  estudios_enviados?: string;
  medicamentos_enviados?: string;
  fecha_traslado?: string;
  hora_traslado?: string;
  medico_referente?: string;
  telefono_contacto?: string;
  observaciones?: string;

  // Información adicional del documento
  fecha_documento?: string;
  nombre_paciente?: string;
  numero_expediente?: string;
  institucion_origen?: string;
  guia_clinica_nombre?: string;
  guia_clinica_codigo?: string;
}

export interface ReferenciaTrasladoFilters extends BaseFilters {
  institucion_destino?: string;
  urgencia_traslado?: string;
  medio_transporte?: string;
  fecha_traslado_inicio?: string;
  fecha_traslado_fin?: string;
  con_acompañamiento_medico?: boolean;
}

export interface CreateReferenciaTrasladoDto {
  id_documento: number;
  institucion_destino: string;
  servicio_destino?: string;
  motivo_traslado: string;
  id_guia_diagnostico?: number;
  condiciones_traslado: string;
  urgencia_traslado?: string;
  medio_transporte?: string;
  acompañamiento_medico?: boolean;
  resumen_clinico?: string;
  estudios_enviados?: string;
  medicamentos_enviados?: string;
  fecha_traslado?: string;
  hora_traslado?: string;
  medico_referente?: string;
  telefono_contacto?: string;
  observaciones?: string;
}

export interface UpdateReferenciaTrasladoDto extends Partial<CreateReferenciaTrasladoDto> {
  id_referencia_traslado: number;
}
